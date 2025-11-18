/**
 * Import group chat knowledge essentials from markdown files
 * 导入群聊精华内容到数据库
 *
 * Run: node scripts/import-knowledge-essentials.js
 */

require('dotenv/config');
const { readdir, readFile } = require('node:fs/promises');
const { join } = require('node:path');
const postgres = require('postgres');

// 分类映射：文件夹名 -> 数据库分类
const CATEGORY_MAP = {
  '01-账号与设备': '账号与设备',
  '02-网络与代理': '网络与代理',
  '03-支付与订阅': '支付与订阅',
  '04-开发工具': '开发工具',
  '05-项目执行': '项目执行',
  '06-产品与增长': '产品与增长',
  '07-社群与学习': '社群与学习',
  '08-学习认知与避坑': '学习认知与避坑',
  '09-成本规划': '成本规划',
  '10-设备与环境': '设备与环境',
};

// 知识库文件夹路径
const KNOWLEDGE_BASE_PATH = '/Users/liyadong/Desktop/群聊精华-主题精修';

// 特殊日报 ID 和信息
const SPECIAL_REPORT_ID = 'special-knowledge-essentials-2024-10';
const SPECIAL_REPORT_TITLE = '新人营群聊精华合集（2024.10.14-11.05）';
const SPECIAL_REPORT_SUMMARY =
  '汇总新人营1群+2群在2024年10月14日至11月5日期间的精华讨论内容，涵盖账号注册、网络配置、支付方案、开发工具、项目执行、产品增长、社群学习、避坑经验、成本规划和设备环境等10大主题，共68篇精选内容。';

async function main() {
  console.log('🚀 开始导入群聊精华内容...\n');

  // 检查环境变量
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  console.log('📋 连接数据库...');
  const client = postgres(dbUrl);

  try {
    // ============================================================================
    // 步骤 1: 创建特殊日报记录
    // ============================================================================
    console.log('\n📝 创建特殊日报记录...');

    // 使用第一个用户 ID
    const adminUserId = 'test_user_001';

    await client`
      INSERT INTO daily_report (
        id, date, title, summary, status, published_at,
        views, likes, comment_count, year, month,
        created_by, created_at, updated_at
      ) VALUES (
        ${SPECIAL_REPORT_ID},
        ${new Date('2024-11-05')},
        ${SPECIAL_REPORT_TITLE},
        ${SPECIAL_REPORT_SUMMARY},
        'published',
        ${new Date()},
        0, 0, 0, 2024, 11,
        ${adminUserId},
        ${new Date()},
        ${new Date()}
      )
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('✅ 特殊日报记录创建成功');

    // ============================================================================
    // 步骤 2: 读取所有分类文件夹和 markdown 文件
    // ============================================================================
    console.log('\n📂 扫描知识库文件夹...');

    const categories = await readdir(KNOWLEDGE_BASE_PATH, {
      withFileTypes: true,
    });
    const categoryFolders = categories.filter(
      (d) => d.isDirectory() && d.name.startsWith('0')
    );

    console.log(`找到 ${categoryFolders.length} 个分类文件夹`);

    let totalFiles = 0;
    let importedFiles = 0;
    const failedFiles = [];

    // ============================================================================
    // 步骤 3: 遍历每个分类文件夹，导入 markdown 文件
    // ============================================================================
    for (const categoryFolder of categoryFolders) {
      const categoryName = categoryFolder.name;
      const mappedCategory = CATEGORY_MAP[categoryName];

      if (!mappedCategory) {
        console.warn(`⚠️  未找到分类映射: ${categoryName}，跳过`);
        continue;
      }

      console.log(`\n📁 处理分类: ${mappedCategory}`);

      const categoryPath = join(KNOWLEDGE_BASE_PATH, categoryName);
      const files = await readdir(categoryPath);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      console.log(`   找到 ${mdFiles.length} 个 markdown 文件`);
      totalFiles += mdFiles.length;

      // 处理每个 markdown 文件
      for (const mdFile of mdFiles) {
        try {
          const filePath = join(categoryPath, mdFile);
          const content = await readFile(filePath, 'utf-8');

          // 从文件名提取标题和标签
          const fileNameWithoutExt = mdFile.replace('.md', '');

          // 文件名格式可能是: "claude-账号注册与风控.md" 或 "账号安全避坑清单.md"
          const parts = fileNameWithoutExt.split('-');
          let tags = [];
          let title = fileNameWithoutExt;

          if (parts.length > 1) {
            // 第一部分作为标签
            tags = [parts[0]];
            // 其余部分作为标题
            title = parts.slice(1).join('-');
          }

          // 添加分类作为标签
          tags.push(mappedCategory);

          // 生成摘要（取内容前200个字符）
          const summary =
            content
              .replace(/^#.*$/gm, '') // 去除标题
              .replace(/\n+/g, ' ') // 替换换行
              .trim()
              .substring(0, 200) + '...';

          // 生成唯一 ID
          const topicId = `topic-${SPECIAL_REPORT_ID}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

          // 插入数据库
          await client`
            INSERT INTO daily_topic (
              id, report_id, title, summary, content,
              category, tags, importance, sort_order,
              source_group, views, likes, comment_count,
              created_at, updated_at
            ) VALUES (
              ${topicId},
              ${SPECIAL_REPORT_ID},
              ${title},
              ${summary},
              ${content},
              ${mappedCategory},
              ${tags},
              4,
              ${importedFiles},
              '新人营1群+2群',
              0, 0, 0,
              ${new Date()},
              ${new Date()}
            )
          `;

          importedFiles++;
          console.log(`   ✅ [${importedFiles}/${totalFiles}] ${title}`);
        } catch (error) {
          console.error(`   ❌ 导入失败: ${mdFile}`, error.message);
          failedFiles.push(`${categoryName}/${mdFile}`);
        }
      }
    }

    // ============================================================================
    // 步骤 4: 显示导入结果
    // ============================================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 导入结果汇总:');
    console.log('='.repeat(60));
    console.log(`✅ 成功导入: ${importedFiles} 个文件`);
    console.log(`📁 总文件数: ${totalFiles} 个文件`);

    if (failedFiles.length > 0) {
      console.log(`❌ 失败文件: ${failedFiles.length} 个`);
      console.log('\n失败文件列表:');
      failedFiles.forEach((f) => console.log(`   - ${f}`));
    }

    console.log('\n✨ 导入完成！');
    console.log(`\n💡 提示: 访问网站查看特殊日报 ID: ${SPECIAL_REPORT_ID}`);
    console.log(`   URL: /zh/reports/${SPECIAL_REPORT_ID}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 导入过程发生错误:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
