/**
 * Import group chat knowledge essentials from markdown files
 * 导入群聊精华内容到数据库
 *
 * Run: npm run tsx scripts/import-knowledge-essentials.ts
 */

import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { dailyReport, dailyTopic } from '../src/db/schema';

// 分类映射：文件夹名 -> 数据库分类
const CATEGORY_MAP: Record<string, string> = {
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
  const db = drizzle(client, { schema });

  try {
    // ============================================================================
    // 步骤 1: 创建特殊日报记录
    // ============================================================================
    console.log('\n📝 创建特殊日报记录...');

    // 使用第一个用户 ID（从数据库获取）
    const adminUserId = 'test_user_001';

    await db
      .insert(dailyReport)
      .values({
        id: SPECIAL_REPORT_ID,
        date: new Date('2024-11-05'),
        title: SPECIAL_REPORT_TITLE,
        summary: SPECIAL_REPORT_SUMMARY,
        status: 'published',
        publishedAt: new Date(),
        views: 0,
        likes: 0,
        commentCount: 0,
        year: 2024,
        month: 11,
        createdBy: adminUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

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
    const failedFiles: string[] = [];

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
          let tags: string[] = [];
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
          await db.insert(dailyTopic).values({
            id: topicId,
            reportId: SPECIAL_REPORT_ID,
            title: title,
            summary: summary,
            content: content, // 完整的 markdown 内容
            category: mappedCategory,
            tags: tags,
            importance: 4, // 精华内容默认重要度为4
            sortOrder: importedFiles,
            sourceGroup: '新人营1群+2群',
            views: 0,
            likes: 0,
            commentCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          importedFiles++;
          console.log(`   ✅ [${importedFiles}/${totalFiles}] ${title}`);
        } catch (error) {
          console.error(`   ❌ 导入失败: ${mdFile}`, error);
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
    console.log(`   URL: /reports/${SPECIAL_REPORT_ID}\n`);
  } catch (error) {
    console.error('\n❌ 导入过程发生错误:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
