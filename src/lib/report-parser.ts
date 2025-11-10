/**
 * Report Parser
 *
 * 解析 Markdown 日报内容，提取话题和分类
 */

import { suggestCategoryByKeywords, slugify } from '@/config/knowledge-categories';

export interface ParsedTopic {
  id: string;
  title: string;
  content: string;
  rawCategory: string;        // 从 Markdown 中提取的原始分类
  suggestedSlug: string;       // AI推荐的分类slug
  suggestedName: string;       // AI推荐的分类名称
  confidence: number;          // 推荐置信度 0-1
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 解析日报 Markdown 内容
 *
 * 支持多种格式：
 * - ## 开发工具 | Cursor使用技巧
 * - ## 【开发工具】Cursor使用技巧
 * - ## Cursor使用技巧
 */
export function parseReportMarkdown(markdown: string): ParsedTopic[] {
  // 按 ## 分割话题（支持多个 # 但至少2个）
  const sections = markdown.split(/^##\s+/gm).filter(Boolean);

  const topics: ParsedTopic[] = [];

  for (const section of sections) {
    const lines = section.split('\n');
    const headerLine = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    // 跳过空内容
    if (!content || content.length < 10) {
      continue;
    }

    let rawCategory = '';
    let title = '';

    // 格式1: ## 开发工具 | Cursor使用技巧
    if (headerLine.includes('|')) {
      const parts = headerLine.split('|');
      rawCategory = parts[0].trim();
      title = parts.slice(1).join('|').trim();
    }
    // 格式2: ## 【开发工具】Cursor使用技巧
    else if (headerLine.match(/【(.+?)】/)) {
      const match = headerLine.match(/【(.+?)】(.+)/);
      rawCategory = match?.[1]?.trim() || '';
      title = match?.[2]?.trim() || '';
    }
    // 格式3: ## Cursor使用技巧
    else {
      title = headerLine;
    }

    // 如果标题为空，跳过
    if (!title) {
      continue;
    }

    // AI 推荐分类
    const fullText = `${rawCategory} ${title} ${content}`;
    const { category, confidence } = suggestCategoryByKeywords(fullText);

    topics.push({
      id: generateId(),
      title,
      content,
      rawCategory,
      suggestedSlug: category?.slug || '',
      suggestedName: category?.name || '',
      confidence,
    });
  }

  return topics;
}

/**
 * 生成日报 MDX 内容
 */
export function generateReportMDX(
  markdown: string,
  metadata: {
    date: string;
    title: string;
    description: string;
    tags: string[];
  }
): string {
  return `---
title: ${metadata.title}
description: ${metadata.description}
date: "${metadata.date}"
author: AI产品出海社群
published: true
tags: [${metadata.tags.map(t => `"${t}"`).join(', ')}]
---

${markdown}
`;
}

/**
 * 生成知识库 MDX 内容
 */
export function generateKnowledgeMDX(
  topic: {
    title: string;
    content: string;
    description?: string;
    tags?: string[];
    importance?: number;
  },
  reportMetadata: {
    date: string;
    title: string;
  },
  categoryName: string
): string {
  const tags = topic.tags && topic.tags.length > 0
    ? `[${topic.tags.map(t => `"${t}"`).join(', ')}]`
    : '[]';

  return `---
title: ${topic.title}
description: ${topic.description || `摘自 ${reportMetadata.date} 日报`}
category: ${categoryName}
source: /reports/${reportMetadata.date}
sourceDate: "${reportMetadata.date}"
tags: ${tags}
importance: ${topic.importance || 3}
---

> 本文摘自 [${reportMetadata.date} 日报](/reports/${reportMetadata.date})

${topic.content}

---

## 相关链接

- [查看原日报](/reports/${reportMetadata.date})
- [更多${categoryName}内容](/knowledge)
`;
}

/**
 * 生成知识库文件名
 */
export function generateKnowledgeFileName(
  date: string,
  title: string
): string {
  const dateSlug = date;
  const titleSlug = slugify(title);
  // 限制标题长度，避免文件名过长
  const shortTitle = titleSlug.slice(0, 30);
  return `${dateSlug}-${shortTitle}.zh.mdx`;
}
