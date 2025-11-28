/**
 * AI Processing Engine for Daily Reports
 * Three-stage filtering and content generation
 */

import type { AIProcessingResult, TopicCategory } from '@/types/daily-report';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import type { ParsedMessage } from './message-parser';

// Initialize AI providers
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Stage 2: AI Initial Screening (using DeepSeek for cost efficiency)
 * Classifies messages as valuable (1), not valuable (0), or uncertain (2)
 */
export async function stage2AIScreening(
  messages: ParsedMessage[]
): Promise<{ valuable: ParsedMessage[]; scores: number[] }> {
  const valuable: ParsedMessage[] = [];
  const scores: number[] = [];

  // Process in batches of 20 to avoid token limits
  const batchSize = 20;

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);

    const prompt = `你是一个专业的内容筛选助手。请评估以下微信群聊消息是否有价值。
这是一个AI产品（编程）出海赚美金的学习社群。

有价值的内容包括：
- 技术教程和编程经验
- 产品案例和变现经验
- 工具推荐和使用心得
- 出海经验和市场洞察
- 有深度的问答讨论

无价值的内容包括：
- 纯闲聊和问候
- 无意义的表情符号
- 广告spam
- 重复内容

请对以下每条消息评分，只返回数字（用逗号分隔）：
1 = 有价值
0 = 无价值
2 = 不确定

消息列表：
${batch.map((msg, idx) => `${idx + 1}. [${msg.senderName}]: ${msg.content.substring(0, 200)}`).join('\n')}

只返回评分数字，例如：1,0,1,2,1,0`;

    try {
      const { text } = await generateText({
        model: deepseek('deepseek-chat'),
        prompt,
        temperature: 0.3,
        maxTokens: 100,
      });

      // Parse scores
      const batchScores = text
        .trim()
        .split(',')
        .map((s) => Number.parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n));

      // Add valuable messages
      batchScores.forEach((score, idx) => {
        if (idx < batch.length) {
          scores.push(score);
          if (score >= 1) {
            valuable.push(batch[idx]);
          }
        }
      });
    } catch (error) {
      console.error('Stage 2 AI screening error:', error);
      // On error, include all messages from this batch as uncertain
      batch.forEach((msg) => {
        valuable.push(msg);
        scores.push(2);
      });
    }

    // Rate limiting delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return { valuable, scores };
}

/**
 * Stage 3: AI Refinement (using GPT-4 for quality)
 * Clusters messages into topics and generates summaries
 */
export async function stage3TopicGeneration(
  messages: ParsedMessage[]
): Promise<AIProcessingResult['suggestedTopics']> {
  const prompt = `你是一个专业的内容编辑，负责整理AI产品出海学习社群的每日精华内容。

以下是今天群内的有价值讨论（共${messages.length}条消息）：

${messages
  .map(
    (msg, idx) =>
      `消息${idx + 1} [${msg.senderName} ${msg.timestamp.toLocaleTimeString('zh-CN')}]:
${msg.content.substring(0, 300)}
---`
  )
  .join('\n')}

请将这些消息聚类成3-8个核心话题，并为每个话题生成：
1. 简洁的标题（15字以内）
2. 内容摘要（100-200字）
3. 分类（从以下选择：技术教程、产品案例、出海经验、工具推荐、行业动态、问答精选、账号与设备、网络与代理、支付与订阅、开发工具、项目执行、产品与增长、社群与学习、学习认知与避坑、成本规划、设备与环境）
4. 重要度（1-5分，5分最高）
5. 相关标签（2-4个）
6. 相关消息序号（列出使用了哪些消息）

请以JSON格式返回，格式如下：
{
  "topics": [
    {
      "title": "话题标题",
      "summary": "话题摘要...",
      "category": "技术教程",
      "importance": 4,
      "tags": ["AI编程", "Cursor"],
      "messageIds": [1, 3, 5]
    }
  ]
}`;

  try {
    const { text } = await generateText({
      model: openrouter('google/gemini-2.5-pro'),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);

      return result.topics.map((topic: any) => ({
        title: topic.title,
        summary: topic.summary,
        category: topic.category as TopicCategory,
        importance: topic.importance,
        tags: topic.tags,
        relatedMessageIds:
          topic.messageIds
            ?.map((idx: number) => messages[idx - 1]?.id)
            .filter(Boolean) || [],
      }));
    }
  } catch (error) {
    console.error('Stage 3 topic generation error:', error);
  }

  return [];
}

/**
 * Generate daily summary
 */
export async function generateDailySummary(
  topics: AIProcessingResult['suggestedTopics']
): Promise<string> {
  const prompt = `请为今天的社群日报写一段简短的概览（50-100字）。

今天共有${topics.length}个核心话题：
${topics.map((t, i) => `${i + 1}. ${t.title} (${t.category})`).join('\n')}

请用一段话总结今天讨论的整体情况和亮点。`;

  try {
    const { text } = await generateText({
      model: openrouter('google/gemini-2.5-pro'),
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    });

    return text.trim();
  } catch (error) {
    console.error('Daily summary generation error:', error);
    return `今天社群共讨论了${topics.length}个核心话题，涵盖${topics.map((t) => t.category).join('、')}等方面。`;
  }
}

/**
 * Full AI processing pipeline
 */
export async function processMessagesWithAI(
  messages: ParsedMessage[]
): Promise<Omit<AIProcessingResult, 'filteredMessages'>> {
  console.log(`Starting AI processing for ${messages.length} messages...`);

  // Stage 2: AI screening with DeepSeek
  console.log('Stage 2: AI screening...');
  const { valuable: valuableMessages } = await stage2AIScreening(messages);
  console.log(
    `Stage 2 complete: ${valuableMessages.length} valuable messages found`
  );

  // Stage 3: Topic generation with GPT-4
  console.log('Stage 3: Generating topics...');
  const suggestedTopics = await stage3TopicGeneration(valuableMessages);
  console.log(`Stage 3 complete: ${suggestedTopics.length} topics generated`);

  // Generate daily summary
  console.log('Generating daily summary...');
  const dailySummary = await generateDailySummary(suggestedTopics);

  return {
    suggestedTopics,
    dailySummary,
  };
}

/**
 * Estimate AI processing cost
 */
export function estimateProcessingCost(messageCount: number): {
  stage2Cost: number;
  stage3Cost: number;
  totalCost: number;
} {
  // DeepSeek: ~$0.003 per 1k tokens
  // Assume avg 100 tokens per message, 20 messages per batch
  const stage2Batches = Math.ceil(messageCount / 20);
  const stage2Tokens = stage2Batches * 2000; // Input + output
  const stage2Cost = (stage2Tokens / 1000) * 0.003;

  // GPT-4o: ~$0.04 per 1k tokens (after stage 2 filtering ~40% remain)
  const stage3Messages = Math.ceil(messageCount * 0.4);
  const stage3Tokens = stage3Messages * 100 + 2000; // Messages + summary
  const stage3Cost = (stage3Tokens / 1000) * 0.04;

  return {
    stage2Cost: Number(stage2Cost.toFixed(3)),
    stage3Cost: Number(stage3Cost.toFixed(3)),
    totalCost: Number((stage2Cost + stage3Cost).toFixed(3)),
  };
}
