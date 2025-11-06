#!/usr/bin/env tsx

/**
 * Enhance Knowledge Base Content
 *
 * 将原始 Markdown 内容转换为使用 Fumadocs 组件的优化 MDX 格式
 * 自动识别并添加：Steps、Callout、Tabs 等组件
 */

import fs from 'fs';
import path from 'path';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'content', 'knowledge');
const BACKUP_DIR = path.join(process.cwd(), 'content', 'knowledge-backup');

// 测试模式：只处理指定文件
const TEST_MODE = process.argv.includes('--test');
const TEST_FILES = [
  'content/knowledge/network/网络排查与最佳实践.mdx',
  'content/knowledge/dev-tools/claudecode使用攻略.mdx',
];

interface FileInfo {
  path: string;
  frontmatter: string;
  content: string;
}

/**
 * 提取 frontmatter 和内容
 */
function parseMDX(content: string): { frontmatter: string; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: '', body: content };
  }
  return {
    frontmatter: match[1],
    body: match[2],
  };
}

/**
 * 转换有序列表为 Steps 组件
 */
function convertOrderedListsToSteps(content: string): string {
  // 匹配连续的有序列表（1. 2. 3. 等）
  const orderedListPattern = /(\n(?:\d+\.\s+\*\*[^*]+\*\*[^\n]+\n?)+)/g;

  return content.replace(orderedListPattern, (match) => {
    // 分割每一项
    const items = match.trim().split(/\n(?=\d+\.\s)/);

    // 只有 3 项以上才转换为 Steps
    if (items.length < 3) {
      return match;
    }

    const steps = items
      .map((item) => {
        // 移除序号
        const cleaned = item.replace(/^\d+\.\s+/, '').trim();
        return `<Step>\n${cleaned}\n</Step>`;
      })
      .join('\n\n');

    return `\n<Steps>\n${steps}\n</Steps>\n`;
  });
}

/**
 * 添加 Callout 组件
 */
function addCallouts(content: string): string {
  let result = content;

  // 识别段落中的关键词，添加 Callout
  const patterns = [
    {
      keywords: ['注意', '提示', '重要', '建议', '推荐', '💡'],
      type: 'info',
    },
    {
      keywords: ['警告', '避免', '不要', '风险', '⚠️', '注意事项'],
      type: 'warning',
    },
    {
      keywords: ['错误', '失败', '问题', '❌'],
      type: 'danger',
    },
  ];

  patterns.forEach(({ keywords, type }) => {
    keywords.forEach((keyword) => {
      // 匹配以关键词开头的段落
      const regex = new RegExp(
        `\n([^<\n]*${keyword}[^<\n]*(?:\n(?![#<\n])[^\n]+)*)\n`,
        'g'
      );

      result = result.replace(regex, (match, content) => {
        // 避免重复包装
        if (content.includes('<Callout')) {
          return match;
        }
        return `\n<Callout type="${type}">\n${content.trim()}\n</Callout>\n`;
      });
    });
  });

  return result;
}

/**
 * 优化标题格式
 */
function enhanceHeadings(content: string): string {
  // 为 ### 标题添加图标
  return content.replace(/^### (.+)$/gm, (match, title) => {
    // 如果已有图标，跳过
    if (title.match(/^[📌🔧🎯💡⚡]/u)) {
      return match;
    }

    // 根据内容添加合适的图标
    if (title.includes('实战') || title.includes('案例')) {
      return `### 💡 ${title}`;
    } else if (title.includes('配置') || title.includes('设置')) {
      return `### 🔧 ${title}`;
    } else if (title.includes('推荐') || title.includes('方案')) {
      return `### ⚡ ${title}`;
    } else if (title.includes('清单') || title.includes('检查')) {
      return `### 📌 ${title}`;
    }

    return match;
  });
}

/**
 * 优化代码块
 */
function enhanceCodeBlocks(content: string): string {
  // 为没有语言标记的代码块添加
  return content.replace(/```\n/g, '```bash\n');
}

/**
 * 优化链接格式
 */
function enhanceLinks(content: string): string {
  // 将裸链接转换为 Markdown 链接
  return content.replace(
    /([^(])(https?:\/\/[^\s<)]+)/g,
    (match, prefix, url) => {
      // 如果已经是 Markdown 链接，跳过
      if (prefix === '[') {
        return match;
      }

      // 提取域名作为链接文本
      const domain = url.replace(/^https?:\/\//, '').split('/')[0];
      return `${prefix}[${domain}](${url})`;
    }
  );
}

/**
 * 转换单个文件
 */
function enhanceFile(filePath: string): boolean {
  try {
    console.log(`📝 处理: ${path.relative(process.cwd(), filePath)}`);

    // 读取文件
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseMDX(content);

    // 应用转换
    let enhanced = body;
    enhanced = convertOrderedListsToSteps(enhanced);
    enhanced = addCallouts(enhanced);
    enhanced = enhanceHeadings(enhanced);
    enhanced = enhanceCodeBlocks(enhanced);
    enhanced = enhanceLinks(enhanced);

    // 重新组合
    const result = `---\n${frontmatter}\n---\n${enhanced}`;

    // 写回文件
    fs.writeFileSync(filePath, result, 'utf-8');

    console.log(`✅ 完成: ${path.relative(process.cwd(), filePath)}\n`);
    return true;
  } catch (error) {
    console.error(`❌ 错误: ${filePath}`, error);
    return false;
  }
}

/**
 * 递归获取所有 MDX 文件
 */
function getAllMDXFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    const items = fs.readdirSync(currentDir);

    items.forEach((item) => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.mdx') && item !== 'index.mdx') {
        files.push(fullPath);
      }
    });
  }

  traverse(dir);
  return files;
}

/**
 * 创建备份
 */
function createBackup() {
  console.log('📦 创建备份...');

  if (fs.existsSync(BACKUP_DIR)) {
    fs.rmSync(BACKUP_DIR, { recursive: true });
  }

  fs.cpSync(KNOWLEDGE_DIR, BACKUP_DIR, { recursive: true });
  console.log(`✅ 备份创建成功: ${BACKUP_DIR}\n`);
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始增强知识库内容...\n');

  if (TEST_MODE) {
    console.log('🧪 测试模式：只处理指定文件\n');

    const testFilePaths = TEST_FILES.map((f) => path.join(process.cwd(), f));

    testFilePaths.forEach((file) => {
      if (fs.existsSync(file)) {
        enhanceFile(file);
      } else {
        console.log(`⚠️  文件不存在: ${file}`);
      }
    });
  } else {
    // 创建备份
    createBackup();

    // 获取所有文件
    const files = getAllMDXFiles(KNOWLEDGE_DIR);
    console.log(`📁 找到 ${files.length} 个文件\n`);

    let successCount = 0;
    let failCount = 0;

    // 处理每个文件
    files.forEach((file) => {
      if (enhanceFile(file)) {
        successCount++;
      } else {
        failCount++;
      }
    });

    console.log('\n✨ 处理完成！');
    console.log(`📊 成功: ${successCount} 个文件`);
    console.log(`❌ 失败: ${failCount} 个文件`);

    if (failCount === 0) {
      console.log('\n🔄 请运行 `pnpm content` 重新生成内容索引');
    }
  }
}

// 运行脚本
main();
