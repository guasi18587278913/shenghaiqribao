'use server';

import {
  STATIC_CATEGORIES,
  suggestCategoryByKeywords,
} from '@/config/knowledge-categories';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

interface TopicInput {
  title: string;
  summary?: string;
  content: string;
}

interface ClassifiedTopic {
  slug: string;
  name: string;
  confidence: number;
}

const openrouterApiKey = process.env.OPENROUTER_API_KEY;

const openrouter = openrouterApiKey
  ? createOpenRouter({ apiKey: openrouterApiKey })
  : null;

const CATEGORY_GUIDE = STATIC_CATEGORIES.map(
  (cat) => `- ${cat.name} (${cat.slug}): ${cat.description}`
).join('\n');

function fallbackClassification(topic: TopicInput): ClassifiedTopic {
  const { category, confidence } = suggestCategoryByKeywords(
    `${topic.title} ${topic.summary ?? ''} ${topic.content}`
  );
  return {
    slug: category?.slug || '',
    name: category?.name || '',
    confidence,
  };
}

export async function classifyTopics(
  topics: TopicInput[]
): Promise<ClassifiedTopic[]> {
  if (!topics || topics.length === 0) return [];

  if (!openrouter) {
    return topics.map((topic) => fallbackClassification(topic));
  }

  const prompt = `你是一个资深内容编辑，请从以下分类中为每个话题选择最匹配的一项：\n${CATEGORY_GUIDE}\n\n请用 JSON 返回 {"topics": [{"index":0,"slug":"dev-tools","confidence":0.92}]}，confidence 取 0-1。`;

  const body = topics
    .map(
      (topic, index) =>
        `话题 ${index}:\n标题:${topic.title}\n摘要:${topic.summary ?? ''}\n内容:${topic.content.slice(0, 800)}\n`
    )
    .join('\n');

  try {
    const { text } = await generateText({
      model: openrouter('google/gemini-2.5-flash'),
      prompt: `${prompt}\n\n${body}`,
      temperature: 0.2,
      maxTokens: 800,
    });

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Missing JSON');
    const parsed = JSON.parse(match[0]);
    const results: ClassifiedTopic[] = topics.map((topic, index) => {
      const aiResult = parsed.topics?.find((item: any) => item.index === index);
      if (aiResult && typeof aiResult.slug === 'string') {
        const cat = STATIC_CATEGORIES.find((c) => c.slug === aiResult.slug);
        if (cat) {
          return {
            slug: cat.slug,
            name: cat.name,
            confidence: Math.min(Math.max(aiResult.confidence ?? 0.5, 0), 1),
          };
        }
      }
      return fallbackClassification(topic);
    });

    return results;
  } catch (error) {
    console.error('AI 分类失败，回退关键字规则:', error);
    return topics.map((topic) => fallbackClassification(topic));
  }
}
