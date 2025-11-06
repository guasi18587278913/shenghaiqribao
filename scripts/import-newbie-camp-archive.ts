/**
 * 批量导入新手营群聊精华
 *
 * 功能：
 * 1. 读取所有 markdown 文件
 * 2. AI 智能去重和合并
 * 3. 提取核心话题（不预设数量）
 * 4. 自动生成标签和知识点分类
 * 5. 创建一篇完整的日报
 */

import 'dotenv/config';
import * as path from 'path';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject, generateText } from 'ai';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as fs from 'fs/promises';
import postgres from 'postgres';
import { z } from 'zod';
import { dailyReport, dailyTopic, user } from '../src/db/schema';

// 数据库连接
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

// AI 配置
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// 文件夹路径
const ARCHIVE_FOLDER =
  '/Users/liyadong/Documents/GitHub/日报网站-mksaas/新人营群聊精华（10月24日-11月3日）';

/**
 * 读取所有 markdown 文件
 */
async function readAllMarkdownFiles(): Promise<
  { filename: string; content: string }[]
> {
  console.log('📂 读取文件夹:', ARCHIVE_FOLDER);

  const files = await fs.readdir(ARCHIVE_FOLDER);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  console.log(`✅ 找到 ${mdFiles.length} 个 markdown 文件`);

  const fileContents = await Promise.all(
    mdFiles.map(async (filename) => {
      const filePath = path.join(ARCHIVE_FOLDER, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(`  📄 ${filename}: ${content.length} 字符`);
      return { filename, content };
    })
  );

  return fileContents;
}

// 定义话题的 Schema
const TopicSchema = z.object({
  title: z.string().describe('话题标题'),
  category: z
    .enum([
      'technical_tutorial',
      'product_case',
      'overseas_experience',
      'tool_recommendation',
      'industry_news',
      'qa_selection',
    ])
    .describe('话题分类'),
  content: z.string().describe('话题的完整内容'),
  summary: z.string().describe('话题摘要'),
  tags: z.array(z.string()).describe('标签列表'),
  knowledgePoints: z.array(z.string()).describe('知识点分类'),
  importance: z.number().min(1).max(5).describe('重要程度'),
  source: z.string().describe('来源文件'),
});

const FileTopicsSchema = z.object({
  topics: z.array(TopicSchema),
});

/**
 * AI 第一步：分析每个文件，提取初步话题
 */
async function extractTopicsFromFile(file: {
  filename: string;
  content: string;
}) {
  const prompt = `你是一位专业的内容编辑，负责整理AI产品出海社群的精华内容。

现在你收到了一个文件：${file.filename}

请分析这个文件的内容，提取其中的核心话题。每个话题应该是一个独立的知识单元。

要求：
- 每个话题的 content 要保留完整的详细信息（步骤、案例、经验等）
- tags 应该是具体的技术标签或主题关键词
- knowledgePoints 是更高层级的知识分类（如"工具使用"、"支付配置"等）

文件内容：

${file.content}`;

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.5-pro'),
    schema: FileTopicsSchema,
    prompt,
    temperature: 0.3,
  });

  return object;
}

/**
 * AI 第二步：合并和去重所有话题
 */
async function mergeAndDeduplicateTopics(allTopics: any[]) {
  console.log(`\n🔄 开始合并和去重 ${allTopics.length} 个初步话题...`);

  const topicsJson = JSON.stringify(allTopics, null, 2);

  const prompt = `你是一位专业的内容编辑，现在需要合并和去重话题。

你收到了 ${allTopics.length} 个初步提取的话题。

你的任务是：
1. **识别相同主题**：如果多个话题讨论的是同一个主题（如"Cursor使用技巧"），合并为一个话题
2. **保留差异**：合并时要整合所有有价值的信息，不同角度的讨论都要保留
3. **去除重复**：删除完全重复的内容
4. **完整性**：确保每个话题都是完整的知识单元

请按以下 JSON 格式输出最终的话题列表（只输出 JSON，不要其他文字）：

{
  "summary": "本期新手营精华汇总的整体概述（100-200字）",
  "topics": [
    {
      "title": "话题标题",
      "category": "分类",
      "content": "合并后的完整内容",
      "summary": "话题摘要",
      "tags": ["标签1", "标签2"],
      "knowledgePoints": ["知识点1", "知识点2"],
      "importance": 4,
      "sources": ["来源文件1", "来源文件2"]
    }
  ]
}

初步话题列表：

${topicsJson}`;

  const { text } = await generateText({
    model: openrouter('google/gemini-2.5-pro'),
    prompt,
    temperature: 0.3,
    maxTokens: 16000,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 返回的内容不是有效的 JSON');
  }

  const result = JSON.parse(jsonMatch[0]);
  console.log(`✅ 合并后剩余 ${result.topics.length} 个核心话题`);

  return result;
}

/**
 * 完整的 AI 处理流程
 */
async function extractTopicsFromArchive(
  files: { filename: string; content: string }[]
) {
  console.log('\n🤖 开始 AI 分析和话题提取...');
  console.log('策略：先逐个文件提取，再合并去重\n');

  // 第一步：逐个文件提取话题
  const allTopics: any[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`📄 处理文件 ${i + 1}/${files.length}: ${file.filename}`);

    try {
      const fileResult = await extractTopicsFromFile(file);
      allTopics.push(...fileResult.topics);
      console.log(`  ✅ 提取了 ${fileResult.topics.length} 个话题`);

      // 添加延迟，避免 API 限流
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`  ❌ 处理失败:`, error);
      throw error;
    }
  }

  console.log(`\n📊 第一轮提取完成，共 ${allTopics.length} 个初步话题`);

  // 第二步：合并和去重
  const finalResult = await mergeAndDeduplicateTopics(allTopics);

  return finalResult;
}

/**
 * 将分类英文转换为数据库枚举
 */
function mapCategoryToEnum(
  category: string
):
  | 'technical_tutorial'
  | 'product_case'
  | 'overseas_experience'
  | 'tool_recommendation'
  | 'industry_news'
  | 'qa_selection' {
  const categoryMap: Record<string, any> = {
    technical_tutorial: 'technical_tutorial',
    product_case: 'product_case',
    overseas_experience: 'overseas_experience',
    tool_recommendation: 'tool_recommendation',
    industry_news: 'industry_news',
    qa_selection: 'qa_selection',
  };

  return categoryMap[category] || 'qa_selection';
}

/**
 * 创建测试用户（如果不存在）
 */
async function ensureTestUser() {
  const testUserId = 'newbie_camp_admin';

  await db
    .insert(user)
    .values({
      id: testUserId,
      name: '新手营管理员',
      email: 'admin@newbiecamp.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'admin',
      banned: false,
      banReason: null,
      banExpires: null,
      customerId: null,
    })
    .onConflictDoNothing();

  return testUserId;
}

/**
 * 将处理后的内容存入数据库
 */
async function saveToDatabase(extractedData: any, userId: string) {
  console.log('\n💾 开始存入数据库...');

  // 1. 创建日报
  const reportId = `newbie_camp_archive_${Date.now()}`;
  const reportDate = new Date('2024-11-03');

  await db.insert(dailyReport).values({
    id: reportId,
    title: '新手营群聊精华（10月14日-11月3日）',
    date: reportDate,
    summary: extractedData.summary,
    status: 'draft', // 设为草稿，等待你审核
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ 日报创建成功:', reportId);

  // 2. 创建所有话题
  for (let i = 0; i < extractedData.topics.length; i++) {
    const topic = extractedData.topics[i];
    const topicId = `topic_${Date.now()}_${i}`;

    await db.insert(dailyTopic).values({
      id: topicId,
      reportId: reportId,
      title: topic.title,
      category: mapCategoryToEnum(topic.category),
      content: topic.content,
      summary: topic.summary,
      editorComment: null, // 编辑点评留空，等你添加
      importance: topic.importance,
      tags: topic.tags,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      order: i,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(
      `✅ 话题 ${i + 1}/${extractedData.topics.length}: ${topic.title}`
    );
  }

  console.log('\n🎉 所有内容已成功存入数据库！');
  console.log(`📊 统计：1 篇日报，${extractedData.topics.length} 个话题`);

  return reportId;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始批量导入新手营群聊精华\n');
  console.log('='.repeat(50));

  try {
    // 第1步：读取所有文件
    const files = await readAllMarkdownFiles();

    // 第2步：AI 分析和提取话题
    const extractedData = await extractTopicsFromArchive(files);

    // 第3步：确保测试用户存在
    const userId = await ensureTestUser();

    // 第4步：存入数据库
    const reportId = await saveToDatabase(extractedData, userId);

    console.log('\n' + '='.repeat(50));
    console.log('✨ 导入完成！\n');
    console.log('📋 接下来你可以：');
    console.log('1. 访问：http://localhost:3000/dashboard/reports');
    console.log('2. 找到草稿状态的"新手营群聊精华"');
    console.log('3. 审核调整内容');
    console.log('4. 添加编辑点评');
    console.log('5. 点击发布');
    console.log('\n🎯 日报 ID:', reportId);
  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// 运行
main();
