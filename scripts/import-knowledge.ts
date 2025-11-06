#!/usr/bin/env tsx

/**
 * Import Knowledge Base from Desktop
 *
 * This script imports Markdown files from /Users/liyadong/Desktop/群聊精华-主题精修/
 * and converts them to MDX format for the knowledge base.
 */

import fs from 'fs';
import path from 'path';

const SOURCE_DIR = '/Users/liyadong/Desktop/群聊精华-主题精修';
const TARGET_DIR = path.join(process.cwd(), 'content', 'knowledge');

// Category mapping (folder name → URL slug)
const CATEGORY_MAPPING: Record<
  string,
  { slug: string; title: string; icon: string; description: string }
> = {
  '01-账号与设备': {
    slug: 'account',
    title: '账号与设备',
    icon: 'User',
    description: 'Google、Claude、GitHub 等核心账号的注册、养号与风控',
  },
  '02-网络与代理': {
    slug: 'network',
    title: '网络与代理',
    icon: 'Globe',
    description: '网络环境配置、代理选择、IP 风险检测',
  },
  '03-支付与订阅': {
    slug: 'payment',
    title: '支付与订阅',
    icon: 'CreditCard',
    description: '海外支付方式、虚拟卡申请、订阅管理',
  },
  '04-开发工具': {
    slug: 'dev-tools',
    title: '开发工具',
    icon: 'Code',
    description: 'Cursor、Claude Code、GitHub 等开发工具配置',
  },
  '05-项目执行': {
    slug: 'project',
    title: '项目执行',
    icon: 'Rocket',
    description: '项目规划、开发流程、部署上线',
  },
  '06-产品与增长': {
    slug: 'product-growth',
    title: '产品与增长',
    icon: 'TrendingUp',
    description: '产品设计、用户增长、数据分析',
  },
  '07-社群与学习': {
    slug: 'community',
    title: '社群与学习',
    icon: 'Users',
    description: '社群运营、学习方法、资源分享',
  },
  '08-学习认知与避坑': {
    slug: 'learning',
    title: '学习认知与避坑',
    icon: 'Lightbulb',
    description: '学习方法、认知提升、常见误区',
  },
  '09-成本规划': {
    slug: 'cost',
    title: '成本规划',
    icon: 'DollarSign',
    description: '成本控制、预算规划、省钱技巧',
  },
  '10-设备与环境': {
    slug: 'device',
    title: '设备与环境',
    icon: 'Monitor',
    description: '设备选购、系统配置、环境搭建',
  },
};

/**
 * Convert filename to slug
 */
function filenameToSlug(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/^[^-]+-/, '') // Remove prefix like "claude-"
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Convert filename to title
 */
function filenameToTitle(filename: string): string {
  return filename.replace(/\.md$/, '');
}

/**
 * Extract category from filename or use default
 */
function extractCategory(content: string, defaultCategory: string): string {
  // Try to extract from content or use default
  return defaultCategory;
}

/**
 * Extract tags from content
 */
function extractTags(filename: string): string[] {
  const tags: string[] = [];

  if (filename.includes('claude')) tags.push('Claude');
  if (filename.includes('google')) tags.push('Google');
  if (filename.includes('github')) tags.push('GitHub');
  if (filename.includes('账号') || filename.includes('注册'))
    tags.push('账号注册');
  if (filename.includes('风控') || filename.includes('封号')) tags.push('风控');
  if (filename.includes('支付') || filename.includes('订阅')) tags.push('支付');
  if (filename.includes('网络') || filename.includes('代理')) tags.push('网络');
  if (filename.includes('设备') || filename.includes('配置'))
    tags.push('设备配置');

  return tags.length > 0 ? tags : ['出海开发'];
}

/**
 * Import knowledge base
 */
function importKnowledge() {
  console.log('🚀 开始导入知识库...\n');

  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ 源目录不存在: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Read all category directories
  const categories = fs.readdirSync(SOURCE_DIR).filter((item) => {
    const fullPath = path.join(SOURCE_DIR, item);
    return fs.statSync(fullPath).isDirectory() && item.startsWith('0');
  });

  console.log(`📁 找到 ${categories.length} 个分类目录\n`);

  let totalFiles = 0;
  const allCategoryPages: string[] = [];

  // Process each category
  categories.forEach((categoryDir) => {
    const mapping = CATEGORY_MAPPING[categoryDir];
    if (!mapping) {
      console.warn(`⚠️  跳过未映射的分类: ${categoryDir}`);
      return;
    }

    console.log(`📂 处理分类: ${mapping.title} (${mapping.slug})`);

    // Create category directory
    const categoryPath = path.join(TARGET_DIR, mapping.slug);
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }

    // Read all markdown files in category
    const sourceCategory = path.join(SOURCE_DIR, categoryDir);
    const files = fs
      .readdirSync(sourceCategory)
      .filter((file) => file.endsWith('.md'));

    if (files.length === 0) {
      console.log(`  ⏭️  该分类无文件，跳过\n`);
      return;
    }

    const categoryPages: string[] = [];

    // Process each file
    files.forEach((file) => {
      const sourceFile = path.join(sourceCategory, file);
      const content = fs.readFileSync(sourceFile, 'utf-8');

      const slug = filenameToSlug(file);
      const title = filenameToTitle(file);
      const tags = extractTags(file);

      // Generate frontmatter
      const frontmatter = `---
title: ${title}
description: ${mapping.description}
category: ${mapping.title}
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
importance: 3
---

`;

      // Write MDX file
      const targetFile = path.join(categoryPath, `${slug}.mdx`);
      fs.writeFileSync(targetFile, frontmatter + content);

      categoryPages.push(slug);
      totalFiles++;
      console.log(`  ✅ ${file} → ${slug}.mdx`);
    });

    // Create meta.json for category
    const metaJson = {
      title: mapping.title,
      description: mapping.description,
      icon: mapping.icon,
      pages: categoryPages,
    };

    fs.writeFileSync(
      path.join(categoryPath, 'meta.json'),
      JSON.stringify(metaJson, null, 2)
    );

    allCategoryPages.push(mapping.slug);
    console.log(`  📝 创建 meta.json (${categoryPages.length} 篇文章)\n`);
  });

  // Update root meta.json
  const rootMetaPath = path.join(TARGET_DIR, 'meta.json');
  const rootMeta = {
    title: '知识库',
    description: 'AI 出海开发知识库 - 系统化的经验总结',
    icon: 'BookOpen',
    root: true,
    pages: ['index', '---分类---', ...allCategoryPages],
  };

  fs.writeFileSync(rootMetaPath, JSON.stringify(rootMeta, null, 2));

  console.log('✨ 导入完成！');
  console.log(
    `📊 总计导入 ${totalFiles} 篇文章，${categories.length} 个分类\n`
  );
  console.log('🔄 请运行 `pnpm content` 重新生成内容索引\n');
}

// Run the script
importKnowledge();
