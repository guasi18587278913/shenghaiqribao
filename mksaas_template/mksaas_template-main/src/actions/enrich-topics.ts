'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { slugify } from '@/config/knowledge-categories';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

interface TopicInput {
  title: string;
  content: string;
}

export interface EnrichedTopic {
  suggestedTitle: string;
  tags: string[];
  related: { title: string; url: string; score: number }[];
}

const openrouterApiKey = process.env.OPENROUTER_API_KEY;
const openrouter = openrouterApiKey
  ? createOpenRouter({ apiKey: openrouterApiKey })
  : null;

/**
 * 提炼更短更清晰的中文标题（无模型回退）
 */
function fallbackTitle(title: string, content: string): string {
  let t = title
    .replace(/^[一二三四五六七八九十]+[、.．]\s*/g, '') // 去掉中文编号
    .replace(/^\d+[\).．、]\s*/g, '') // 去掉数字编号
    .replace(/^今日要点.*$/g, '')
    .replace(/^今日.*(总结|小结|要点).*$/g, '')
    .trim();
  if (!t || t.length < 4) {
    // 从正文首段截取关键词式标题
    const plain = content
      .replace(/[#>*`*_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    t = plain.slice(0, 20);
  }
  // 限长
  return t.length > 24 ? `${t.slice(0, 24)}` : t;
}

/**
 * 读取知识库条目，提取 title 与 url，用于相似度匹配
 */
async function readKnowledgeIndex(): Promise<
  { title: string; url: string; file: string }[]
> {
  const baseDir = path.join(process.cwd(), 'content/knowledge');
  const results: { title: string; url: string; file: string }[] = [];

  async function walk(dir: string, category?: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        // 跳过备份目录
        if (e.name === 'meta.json') continue;
        await walk(path.join(dir, e.name), category ?? e.name);
      } else if (e.isFile() && e.name.endsWith('.mdx')) {
        const filePath = path.join(dir, e.name);
        try {
          const raw = await fs.readFile(filePath, 'utf-8');
          const match = raw.match(/^---\n([\s\S]*?)\n---/);
          let title = '';
          if (match) {
            const fm = match[1];
            const t = fm.match(/^\s*title:\s*(.+)\s*$/m);
            title = t ? t[1].trim() : '';
          }
          const fileSlug = e.name.replace(/\.mdx$/, '');
          const cat = category ?? path.basename(path.dirname(filePath));
          const url = `/knowledge/${encodeURIComponent(cat)}/${encodeURIComponent(fileSlug)}`;
          if (title) {
            results.push({ title, url, file: filePath });
          }
        } catch {
          // ignore single file errors
        }
      }
    }
  }

  try {
    await walk(baseDir);
  } catch {
    // knowledge 目录可能不存在
  }

  return results;
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[#`*_>~|[\](){}/\\\-.,!?，。；、“”‘’：:…]/g, ' ')
      .split(/\s+/)
      .filter((w) => w && w.length >= 2)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

async function findRelatedCandidates(
  title: string,
  content: string,
  index: { title: string; url: string; file: string }[]
) {
  const tokens = tokenize(`${title} ${content.slice(0, 400)}`);
  const scored = index
    .map((it) => ({
      title: it.title,
      url: it.url,
      score: jaccard(tokens, tokenize(it.title)),
    }))
    .filter((x) => x.score > 0.18) // 阈值：较松，便于提示
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return scored;
}

export async function enrichTopics(
  topics: TopicInput[]
): Promise<EnrichedTopic[]> {
  const index = await readKnowledgeIndex();

  if (!topics || topics.length === 0) return [];

  // 先准备回退结果，保证网络受限时也可用
  const fallback = await Promise.all(
    topics.map(async (t) => ({
      suggestedTitle: fallbackTitle(t.title, t.content),
      tags: [],
      related: await findRelatedCandidates(t.title, t.content, index),
    }))
  );

  if (!openrouter) {
    return fallback;
  }

  try {
    const system =
      '你是资深中文编辑。为每个话题生成不超过20字的精炼标题，要求：不带序号、不过度修饰、直击主题，适合知识库文档标题；同时给出1-4个简短标签（不带#）。仅返回JSON。';
    const items = topics
      .map(
        (t, i) =>
          `话题${i}：\n原始标题: ${t.title}\n内容节选: ${t.content.slice(0, 400)}`
      )
      .join('\n\n');
    const prompt = `${system}\n示例返回: {"topics":[{"index":0,"title":"Claude Code 快速上手","tags":["AI编程","入门"]}]}\n\n${items}`;

    const { text } = await generateText({
      model: openrouter('google/gemini-2.5-flash'),
      prompt,
      temperature: 0.2,
      maxTokens: 800,
    });

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return fallback;
    }
    const parsed = JSON.parse(match[0]);
    const enriched: EnrichedTopic[] = await Promise.all(
      topics.map(async (t, i) => {
        const ai = parsed.topics?.find((x: any) => x.index === i);
        let suggestedTitle = ai?.title
          ? String(ai.title).trim()
          : fallbackTitle(t.title, t.content);
        // 10 字内，防止过长
        if (suggestedTitle.length > 10) {
          suggestedTitle = suggestedTitle.slice(0, 10);
        }
        const tags: string[] = Array.isArray(ai?.tags)
          ? ai.tags
              .slice(0, 4)
              .map((x: any) => String(x).trim())
              .filter(Boolean)
          : [];
        const related = await findRelatedCandidates(
          suggestedTitle || t.title,
          t.content,
          index
        );
        return { suggestedTitle, tags, related };
      })
    );
    return enriched;
  } catch (e) {
    console.error('enrichTopics AI 失败，使用回退:', e);
    return fallback;
  }
}
