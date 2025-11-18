#!/usr/bin/env node

/**
 * Enhance Knowledge Base Content
 *
 * 将原始 Markdown 内容转换为使用 Fumadocs 组件的优化 MDX 格式
 */

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(process.cwd(), 'content', 'knowledge');
const BACKUP_DIR = path.join(process.cwd(), 'content', 'knowledge-backup');

// 测试模式
const TEST_MODE = process.argv.includes('--test');
const TEST_FILES = [
  'content/knowledge/network/网络排查与最佳实践.mdx',
  'content/knowledge/dev-tools/claudecode使用攻略.mdx',
];

/**
 * 提取 frontmatter 和内容
 */
function parseMDX(content) {
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
function convertOrderedListsToSteps(content) {
  // 匹配连续的有序列表
  const orderedListPattern = /(\n(?:\d+\.\s+\*\*[^*]+\*\*[^\n]+\n?)+)/g;

  return content.replace(orderedListPattern, (match) => {
    const items = match.trim().split(/\n(?=\d+\.\s)/);

    if (items.length < 3) {
      return match;
    }

    const steps = items
      .map((item) => {
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
function addCallouts(content) {
  let result = content;

  const patterns = [
    {
      keywords: ['注意', '提示', '重要', '建议', '推荐', '💡'],
      type: 'info',
    },
    {
      keywords: ['警告', '避免', '不要', '风险', '⚠️'],
      type: 'warning',
    },
  ];

  patterns.forEach(({ keywords, type }) => {
    keywords.forEach((keyword) => {
      const regex = new RegExp(
        `\n([^<\n]*${keyword}[^<\n]*(?:\n(?![#<\n])[^\n]+)*)\n`,
        'g'
      );

      result = result.replace(regex, (match, content) => {
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
function enhanceHeadings(content) {
  return content.replace(/^### (.+)$/gm, (match, title) => {
    if (title.match(/^[📌🔧🎯💡⚡]/u)) {
      return match;
    }

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
function enhanceCodeBlocks(content) {
  return content.replace(/```\n/g, '```bash\n');
}

/**
 * 优化链接格式
 */
function enhanceLinks(content) {
  return content.replace(
    /([^(])(https?:\/\/[^\s<)]+)/g,
    (match, prefix, url) => {
      if (prefix === '[') {
        return match;
      }

      const domain = url.replace(/^https?:\/\//, '').split('/')[0];
      return `${prefix}[${domain}](${url})`;
    }
  );
}

/**
 * 修复MDX语法问题 - 转义 < 符号
 */
function fixMDXSyntax(content) {
  // 修复 "< 数字" 问题 (例如: <30, <50)
  // 在非代码块、非HTML标签的上下文中
  let result = content;

  // 匹配不在代码块中的 < 后跟数字的情况
  result = result.replace(/([^`<])(<)(\d)/g, '$1&lt;$3');

  return result;
}

/**
 * 修复不支持的代码语言
 */
function fixUnsupportedLanguages(content) {
  // 将不支持的语言替换为支持的语言
  const unsupportedLanguages = {
    env: 'bash',
    dotenv: 'bash',
    properties: 'text',
  };

  let result = content;
  Object.entries(unsupportedLanguages).forEach(([unsupported, supported]) => {
    const regex = new RegExp(`\`\`\`${unsupported}\\n`, 'g');
    result = result.replace(regex, `\`\`\`${supported}\n`);
  });

  return result;
}

/**
 * 转换单个文件
 */
function enhanceFile(filePath) {
  try {
    console.log(`📝 处理: ${path.relative(process.cwd(), filePath)}`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseMDX(content);

    let enhanced = body;
    // 先修复MDX语法问题
    enhanced = fixMDXSyntax(enhanced);
    enhanced = fixUnsupportedLanguages(enhanced);
    // 然后应用增强
    enhanced = convertOrderedListsToSteps(enhanced);
    enhanced = addCallouts(enhanced);
    enhanced = enhanceHeadings(enhanced);
    enhanced = enhanceCodeBlocks(enhanced);
    enhanced = enhanceLinks(enhanced);

    const result = `---\n${frontmatter}\n---\n${enhanced}`;
    fs.writeFileSync(filePath, result, 'utf-8');

    console.log(`✅ 完成\n`);
    return true;
  } catch (error) {
    console.error(`❌ 错误: ${filePath}`, error);
    return false;
  }
}

/**
 * 递归获取所有 MDX 文件
 */
function getAllMDXFiles(dir) {
  const files = [];

  function traverse(currentDir) {
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
  console.log(`✅ 备份完成: ${BACKUP_DIR}\n`);
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始增强知识库内容...\n');

  if (TEST_MODE) {
    console.log('🧪 测试模式\n');

    const testFilePaths = TEST_FILES.map((f) => path.join(process.cwd(), f));

    testFilePaths.forEach((file) => {
      if (fs.existsSync(file)) {
        enhanceFile(file);
      } else {
        console.log(`⚠️  文件不存在: ${file}`);
      }
    });
  } else {
    createBackup();

    const files = getAllMDXFiles(KNOWLEDGE_DIR);
    console.log(`📁 找到 ${files.length} 个文件\n`);

    let successCount = 0;
    let failCount = 0;

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

main();
