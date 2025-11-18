/**
 * AI 辅助增强日报脚本
 *
 * 用途：为手动创建的日报（草稿状态）自动生成：
 * 1. 每个话题的摘要 (summary)
 * 2. 每个话题的标签 (tags)
 * 3. 整篇日报的总体摘要 (summary)
 *
 * 使用方法：
 * 1. 先在后台手动创建日报和话题（草稿状态）
 * 2. 运行：pnpm tsx scripts/ai-enhance-report.ts <报告ID>
 * 3. AI 会自动生成所有摘要和标签
 * 4. 回到后台审核和调整
 */

import 'dotenv/config';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject, generateText } from 'ai';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';
import * as schema from '../src/db/schema';
import { dailyReport, dailyTopic } from '../src/db/schema';

// ============================================================================
// 配置
// ============================================================================

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// 使用性价比高的模型：Gemini 2.5 Pro (高质量) 或 DeepSeek (更便宜)
const AI_MODEL = 'google/gemini-2.5-pro'; // 或 'deepseek/deepseek-chat'

// ============================================================================
// Schema 定义
// ============================================================================

const TopicEnhancementSchema = z.object({
  summary: z
    .string()
    .describe('话题摘要（100-200字，简明扼要，突出核心内容和价值）'),
  tags: z
    .array(z.string())
    .describe('3-6个相关标签，如：AI编程、Cursor、工具订阅、魔法上网等'),
});

const ReportSummarySchema = z.object({
  summary: z
    .string()
    .describe('日报整体摘要（150-300字，概括本期所有话题的核心内容）'),
});

// ============================================================================
// AI 增强函数
// ============================================================================

/**
 * 为单个话题生成摘要和标签
 */
async function enhanceTopic(topic: any) {
  console.log(`\n📝 增强话题：${topic.title}`);

  const prompt = `你是一位专业的内容编辑，负责为技术社群的精华内容生成摘要和标签。

话题标题：${topic.title}
话题分类：${topic.category}
话题内容：
${topic.content || '（内容为空）'}

请为这个话题生成：
1. 摘要：100-200字，简明扼要地总结核心内容和价值，让读者快速了解这个话题讲什么
2. 标签：3-6个相关标签，要具体且有搜索价值（如"Cursor"、"AI编程"、"魔法上网"等）

注意：
- 摘要要有吸引力，突出亮点和价值
- 标签要准确反映内容主题
- 如果内容涉及工具，工具名要作为标签`;

  try {
    const { object } = await generateObject({
      model: openrouter(AI_MODEL),
      schema: TopicEnhancementSchema,
      prompt,
      temperature: 0.3,
    });

    console.log(`  ✅ 摘要：${object.summary.substring(0, 50)}...`);
    console.log(`  ✅ 标签：${object.tags.join(', ')}`);

    return object;
  } catch (error) {
    console.error(`  ❌ 生成失败:`, error);
    throw error;
  }
}

/**
 * 为整个日报生成总体摘要
 */
async function enhanceReportSummary(report: any, topics: any[]) {
  console.log(`\n📋 生成日报总体摘要...`);

  const topicsSummary = topics
    .map(
      (t, i) => `${i + 1}. ${t.title}${t.summary ? `\n   ${t.summary}` : ''}`
    )
    .join('\n\n');

  const prompt = `你是一位专业的内容编辑，负责为技术社群的日报撰写总体摘要。

日报标题：${report.title}
日期：${new Date(report.date).toLocaleDateString('zh-CN')}

本期包含以下话题：
${topicsSummary}

请生成一个 150-300 字的日报整体摘要，要求：
1. 概括本期所有话题的核心内容
2. 突出重点和亮点
3. 语言简洁有力，吸引读者阅读
4. 可以提及话题数量和主要主题`;

  try {
    const { object } = await generateObject({
      model: openrouter(AI_MODEL),
      schema: ReportSummarySchema,
      prompt,
      temperature: 0.4,
    });

    console.log(`  ✅ 摘要：${object.summary}`);

    return object.summary;
  } catch (error) {
    console.error(`  ❌ 生成失败:`, error);
    throw error;
  }
}

// ============================================================================
// 数据库操作
// ============================================================================

/**
 * 获取日报及其话题
 */
async function getReportWithTopics(reportId: string) {
  console.log(`\n🔍 查找日报：${reportId}`);

  const report = await db.query.dailyReport.findFirst({
    where: eq(dailyReport.id, reportId),
  });

  if (!report) {
    throw new Error(`找不到日报：${reportId}`);
  }

  console.log(`✅ 找到日报：${report.title}`);
  console.log(`   状态：${report.status}`);
  console.log(`   创建时间：${report.createdAt}`);

  const topics = await db.query.dailyTopic.findMany({
    where: eq(dailyTopic.reportId, reportId),
    orderBy: (topics, { asc }) => [asc(topics.sortOrder)],
  });

  console.log(`✅ 找到 ${topics.length} 个话题`);

  return { report, topics };
}

/**
 * 更新话题的摘要和标签
 */
async function updateTopic(topicId: string, enhancement: any) {
  await db
    .update(dailyTopic)
    .set({
      summary: enhancement.summary,
      tags: enhancement.tags,
      updatedAt: new Date(),
    })
    .where(eq(dailyTopic.id, topicId));
}

/**
 * 更新日报摘要
 */
async function updateReportSummary(reportId: string, summary: string) {
  await db
    .update(dailyReport)
    .set({
      summary,
      updatedAt: new Date(),
    })
    .where(eq(dailyReport.id, reportId));
}

// ============================================================================
// 主函数
// ============================================================================

async function main() {
  console.log('🤖 AI 辅助增强日报工具');
  console.log('='.repeat(60));

  // 获取命令行参数
  const reportId = process.argv[2];

  if (!reportId) {
    console.error('\n❌ 错误：缺少日报 ID');
    console.log('\n使用方法：');
    console.log('  pnpm tsx scripts/ai-enhance-report.ts <日报ID>');
    console.log('\n示例：');
    console.log('  pnpm tsx scripts/ai-enhance-report.ts report_1234567890');
    console.log('\n提示：');
    console.log('  - 先在后台创建日报和话题（草稿状态）');
    console.log('  - 然后运行此脚本自动生成摘要和标签');
    console.log(
      '  - 在 http://localhost:3000/dashboard/reports 查看日报列表获取 ID'
    );
    process.exit(1);
  }

  try {
    // 第 1 步：获取日报和话题
    const { report, topics } = await getReportWithTopics(reportId);

    if (topics.length === 0) {
      console.log('\n⚠️  警告：这个日报没有任何话题');
      console.log('   请先在后台添加话题，然后再运行此脚本');
      process.exit(0);
    }

    // 第 2 步：为每个话题生成摘要和标签
    console.log('\n' + '='.repeat(60));
    console.log('步骤 1/2：为每个话题生成摘要和标签');
    console.log('='.repeat(60));

    const enhancements: any[] = [];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      console.log(`\n[${i + 1}/${topics.length}] ${topic.title}`);

      try {
        const enhancement = await enhanceTopic(topic);
        enhancements.push({ topicId: topic.id, enhancement });

        // 更新数据库
        await updateTopic(topic.id, enhancement);
        console.log('  💾 已保存到数据库');

        // 延迟，避免 API 限流
        if (i < topics.length - 1) {
          console.log('  ⏳ 等待 2 秒...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`  ❌ 处理失败，跳过该话题`);
        continue;
      }
    }

    // 第 3 步：生成日报整体摘要
    console.log('\n' + '='.repeat(60));
    console.log('步骤 2/2：生成日报整体摘要');
    console.log('='.repeat(60));

    // 重新获取话题（因为已经更新了摘要）
    const updatedTopics = await db.query.dailyTopic.findMany({
      where: eq(dailyTopic.reportId, reportId),
      orderBy: (topics, { asc }) => [asc(topics.sortOrder)],
    });

    const reportSummary = await enhanceReportSummary(report, updatedTopics);
    await updateReportSummary(reportId, reportSummary);
    console.log('  💾 已保存到数据库');

    // 完成
    console.log('\n' + '='.repeat(60));
    console.log('✨ 增强完成！');
    console.log('='.repeat(60));
    console.log('\n📊 统计：');
    console.log(`  - 日报 ID: ${reportId}`);
    console.log(`  - 话题数量: ${topics.length}`);
    console.log(`  - 成功增强: ${enhancements.length} 个话题`);
    console.log('\n📋 接下来：');
    console.log('  1. 访问：http://localhost:3000/dashboard/reports');
    console.log(`  2. 找到日报：${report.title}`);
    console.log('  3. 审核 AI 生成的摘要和标签');
    console.log('  4. 根据需要调整内容');
    console.log('  5. 添加编辑点评');
    console.log('  6. 发布日报');
    console.log('');
  } catch (error: any) {
    console.error('\n❌ 执行失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// 运行
main();
