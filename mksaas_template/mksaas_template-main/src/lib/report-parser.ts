/**
 * Report Parser
 *
 * 解析 Markdown 日报内容，提取话题和分类
 */

import {
  suggestCategoryByKeywords,
  slugify,
  getCategoryByName,
  getCategoryBySlug,
} from '@/config/knowledge-categories';

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
 * 统一归一化标题：
 * - 去掉序号前缀（1. / 1) / 一、等）
 * - 去掉“今日要点/小结”等通用标题噪声
 * - 收敛空白并限长
 */
export function normalizeTitle(raw: string): string {
  let t = (raw || '')
    // 去掉中文序号 一、 二、 三、
    .replace(/^[一二三四五六七八九十百千]+[、.．]\s*/g, '')
    // 去掉数字序号 1. / 1) / 1． / 1、 
    .replace(/^\d+\s*[\).．、.]\s*/g, '')
    // 去掉“今日要点/小结/总结”等噪声
    .replace(/^今日(要点|小结|总结).*/g, '')
    .trim();
  // 太短就保留原始（避免被清空）
  if (!t || t.length < 2) t = (raw || '').trim();
  // 限长保护
  if (t.length > 40) t = t.slice(0, 40);
  return t;
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 移除文本中的 emoji
 */
function removeEmoji(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emoji 符号
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // 其他符号
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // 装饰符号
    .trim();
}

function buildCategorySuggestion(rawCategory: string, title: string, content: string) {
  if (rawCategory) {
    const manual = resolveManualCategory(rawCategory);
    if (manual) {
      return {
        slug: manual.slug,
        name: manual.name,
        confidence: 0.95,
      };
    }
  }

  const fullText = `${rawCategory} ${title} ${content}`;
  const { category, confidence } = suggestCategoryByKeywords(fullText);

  return {
    slug: category?.slug || '',
    name: category?.name || '',
    confidence,
  };
}

/**
 * 识别是否是话题标题
 * 标题特征：
 * 1. 相对较短（一般不超过50字）
 * 2. 包含冒号（：或:）
 * 3. 或者是独立的短句（不超过30字且独立成段）
 */
function isTopicTitle(line: string): boolean {
  const trimmed = line.trim();

  // 空行不是标题
  if (!trimmed) return false;

  // 包含冒号的短句很可能是标题
  if ((trimmed.includes('：') || trimmed.includes(':')) && trimmed.length < 80) {
    return true;
  }

  // 特别短的独立句子可能是小标题
  if (trimmed.length > 5 && trimmed.length < 30 && !trimmed.includes('。')) {
    return true;
  }

  return false;
}

/**
 * 解析日报 Markdown 内容
 *
 * 支持多种格式：
 * 1. 标准格式（老格式，向后兼容）：
 *    - ## 开发工具 | Cursor使用技巧
 *    - ## 【开发工具】Cursor使用技巧
 *    - ## Cursor使用技巧
 *
 * 2. 分隔线格式：
 *    ---
 *    💰 Mac 设备选购：性价比与开发体验兼得
 *    内容...
 *
 *    ---
 *    🖥️ Mac vs Windows：开发环境差异真实反馈
 *    内容...
 *
 * 3. 自然段落格式：
 *    核心话题：Codex"站起来了"
 *    内容...
 *
 *    Bypass 模式安全实践：必须容器化运行
 *    内容...
 */
export function parseReportMarkdown(markdown: string): ParsedTopic[] {
  const topics: ParsedTopic[] = [];

  // 首先尝试按 --- 分隔符分割
  const horizontalRuleSections = markdown.split(/\n\s*---\s*\n/).filter(Boolean);

  // 如果找到了至少 2 个分隔线分割的部分，说明是分隔线格式
  if (horizontalRuleSections.length >= 2) {
    console.log(`[Parser] 检测到分隔线格式，找到 ${horizontalRuleSections.length} 个部分`);

    for (const section of horizontalRuleSections) {
      const trimmedSection = section.trim();
      if (!trimmedSection || trimmedSection.length < 20) {
        continue;
      }

      const lines = trimmedSection.split('\n');
      const firstLine = lines[0].trim();

      // 第一行作为标题，其余作为内容
      let title = removeEmoji(firstLine);
      let content = lines.slice(1).join('\n').trim();

      // 如果内容太短，可能是误判，跳过
      if (content.length < 10) {
        continue;
      }

      // 检查标题是否包含冒号，可能包含分类信息
      let rawCategory = '';
      if (title.includes('：') || title.includes(':')) {
        const separator = title.includes('：') ? '：' : ':';
        const parts = title.split(separator);
        if (parts.length >= 2 && parts[0].length < 20) {
          rawCategory = parts[0].trim();
          title = parts.slice(1).join(separator).trim();
        }
      }

      // AI 推荐分类
      const categorySuggestion = buildCategorySuggestion(rawCategory, title, content);

      topics.push({
        id: generateId(),
        title,
        content,
        rawCategory,
        suggestedSlug: categorySuggestion.slug,
        suggestedName: categorySuggestion.name,
        confidence: categorySuggestion.confidence,
      });
    }
  }
  // 尝试 ## 格式
  else if (markdown.includes('\n## ') || markdown.startsWith('## ')) {
    console.log('[Parser] 检测到标题格式（##）');
    const sections = markdown.split(/^##\s+/gm).filter(Boolean);

    for (const section of sections) {
      const lines = section.split('\n');
      const headerLine = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();

      if (!content || content.length < 10) {
        continue;
      }

      let rawCategory = '';
      let title = '';

      if (headerLine.includes('|')) {
        const parts = headerLine.split('|');
        rawCategory = parts[0].trim();
        title = parts.slice(1).join('|').trim();
      } else if (headerLine.match(/【(.+?)】/)) {
        const match = headerLine.match(/【(.+?)】(.+)/);
        rawCategory = match?.[1]?.trim() || '';
        title = match?.[2]?.trim() || '';
      } else {
        title = headerLine;
      }

      title = removeEmoji(title);

      if (!title) continue;

      const categorySuggestion = buildCategorySuggestion(rawCategory, title, content);

      topics.push({
        id: generateId(),
        title,
        content,
        rawCategory,
        suggestedSlug: categorySuggestion.slug,
        suggestedName: categorySuggestion.name,
        confidence: categorySuggestion.confidence,
      });
    }
  }
  // 自然段落格式：通过识别小标题来分割话题
  else {
    console.log('[Parser] 检测到自然段落格式，尝试智能识别话题');

    const paragraphs = markdown.split(/\n\s*\n+/); // 按空行分段
    let currentTopic: { title: string; content: string[]; rawCategory: string } | null = null;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      const lines = trimmed.split('\n');
      const firstLine = lines[0].trim();

      // 判断是否是新话题的标题
      if (isTopicTitle(firstLine)) {
        // 保存上一个话题
        if (currentTopic && currentTopic.content.length > 0) {
          const content = currentTopic.content.join('\n\n').trim();
          if (content.length >= 50) { // 至少50字才算有效话题
            const categorySuggestion = buildCategorySuggestion(
              currentTopic.rawCategory,
              currentTopic.title,
              content
            );

            topics.push({
              id: generateId(),
              title: currentTopic.title,
              content,
              rawCategory: currentTopic.rawCategory,
              suggestedSlug: categorySuggestion.slug,
              suggestedName: categorySuggestion.name,
              confidence: categorySuggestion.confidence,
            });
          }
        }

        // 开始新话题
        let title = removeEmoji(firstLine);
        let rawCategory = '';

        // 提取分类信息
        if (title.includes('：') || title.includes(':')) {
          const separator = title.includes('：') ? '：' : ':';
          const parts = title.split(separator);
          if (parts.length >= 2 && parts[0].length < 20) {
            rawCategory = parts[0].trim();
            title = parts.slice(1).join(separator).trim();
          }
        }

        currentTopic = {
          title,
          rawCategory,
          content: lines.length > 1 ? [lines.slice(1).join('\n').trim()] : []
        };
      } else if (currentTopic) {
        // 添加到当前话题的内容
        currentTopic.content.push(trimmed);
      } else {
        // 如果还没有开始任何话题，这段内容可能是引言，跳过
        continue;
      }
    }

    // 保存最后一个话题
    if (currentTopic && currentTopic.content.length > 0) {
      const content = currentTopic.content.join('\n\n').trim();
      if (content.length >= 50) {
      const categorySuggestion = buildCategorySuggestion(
        currentTopic.rawCategory,
        currentTopic.title,
        content
      );

      topics.push({
        id: generateId(),
        title: currentTopic.title,
        content,
        rawCategory: currentTopic.rawCategory,
        suggestedSlug: categorySuggestion.slug,
        suggestedName: categorySuggestion.name,
        confidence: categorySuggestion.confidence,
      });
    }
  }
  }

  console.log(`[Parser] 共解析出 ${topics.length} 个话题`);
  topics.forEach((topic, index) => {
    console.log(`[Parser] 话题${index + 1}: ${topic.title} (${topic.suggestedName})`);
  });

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
  const safeTitle = normalizeTitle(topic.title);
  const tags = topic.tags && topic.tags.length > 0
    ? `[${topic.tags.map(t => `"${t}"`).join(', ')}]`
    : '[]';

  return `---
title: ${safeTitle}
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
  const titleSlug = slugify(normalizeTitle(title));
  // 限制标题长度，避免文件名过长
  const shortTitle = titleSlug.slice(0, 30);
  return `${dateSlug}-${shortTitle}.zh.mdx`;
}
function resolveManualCategory(rawCategory: string) {
  const cleaned = rawCategory
    .replace(/^[【\[]+|[】\]]+$/g, '')
    .replace(/分类|类别|主题/g, '')
    .trim();

  if (!cleaned) return null;

  const direct = getCategoryByName(cleaned);
  if (direct) return direct;

  const normalized = cleaned.replace(/[\s·]+/g, '').trim();
  if (normalized) {
    const compact = getCategoryByName(normalized);
    if (compact) return compact;
  }

  const lower = cleaned.toLowerCase();
  const slugMatch =
    getCategoryBySlug(cleaned) ||
    getCategoryBySlug(normalized) ||
    getCategoryBySlug(lower);

  return slugMatch || null;
}
