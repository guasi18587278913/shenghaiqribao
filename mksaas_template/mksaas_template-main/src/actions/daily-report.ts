'use server';

/**
 * Server Actions for Daily Report System
 */

import { db } from '@/db';
import {
  dailyReport,
  dailyTopic,
  rawMessage,
  userPreference,
} from '@/db/schema';
import type {
  CreateDailyReportInput,
  CreateTopicInput,
  DailyReportWithTopics,
  MessageType,
  TopicCategory,
  UpdateDailyReportInput,
  UpdateTopicInput,
  UpdateUserPreferenceInput,
  UploadMessagesInput,
} from '@/types/daily-report';
import { and, desc, eq, gte, lte, lt, inArray, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { updateCategoryStats } from './category-stats';
import {
  mergeConsecutiveMessages,
  stage1Filter,
  type ParsedMessage,
} from '@/lib/daily-report/message-parser';
import {
  stage2AIScreening,
  stage3TopicGeneration,
  generateDailySummary,
} from '@/lib/daily-report/ai-processor';

// ============================================================================
// Daily Report Operations
// ============================================================================

/**
 * Create a new daily report
 */
export async function createDailyReport(
  input: CreateDailyReportInput,
  userId: string
) {
  const reportId = `report_${Date.now()}`;
  const date = new Date(input.date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  await db.insert(dailyReport).values({
    id: reportId,
    date: input.date,
    title: input.title,
    summary: input.summary,
    status: 'draft',
    views: 0,
    likes: 0,
    commentCount: 0,
    year,
    month,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath('/dashboard/reports');
  return { success: true, reportId };
}

/**
 * Update a daily report
 */
export async function updateDailyReport(
  reportId: string,
  input: UpdateDailyReportInput
) {
  await db
    .update(dailyReport)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dailyReport.id, reportId));

  revalidatePath('/dashboard/reports');
  revalidatePath(`/reports/${reportId}`);
  return { success: true };
}

/**
 * Publish a daily report
 */
export async function publishDailyReport(reportId: string) {
  await db
    .update(dailyReport)
    .set({
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(dailyReport.id, reportId));

  revalidatePath('/dashboard/reports');
  revalidatePath('/reports');
  return { success: true };
}

/**
 * Get a daily report with its topics
 */
export async function getDailyReportWithTopics(
  reportId: string
): Promise<DailyReportWithTopics | null> {
  const report = await db.query.dailyReport.findFirst({
    where: eq(dailyReport.id, reportId),
  });

  if (!report) return null;

  const topics = await db.query.dailyTopic.findMany({
    where: eq(dailyTopic.reportId, reportId),
    orderBy: [desc(dailyTopic.sortOrder)],
  });

  // Serialize Date objects to strings for React Server Components
  // IMPORTANT: Must explicitly list all fields to avoid passing Date objects to client components
  const serializedTopics = topics.map((topic) => ({
    id: topic.id,
    reportId: topic.reportId,
    title: topic.title,
    summary: topic.summary,
    content: topic.content,
    editorNote: topic.editorNote,
    category: topic.category,
    importance: topic.importance,
    tags: topic.tags || [],
    sourceMessages: topic.sourceMessages,
    sourceGroup: topic.sourceGroup,
    views: topic.views,
    likes: topic.likes,
    commentCount: topic.commentCount,
    sortOrder: topic.sortOrder,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
  }));

  const result = {
    id: report.id,
    date: report.date.toISOString(),
    title: report.title,
    summary: report.summary,
    status: report.status,
    publishedAt: report.publishedAt?.toISOString() || null,
    views: report.views,
    likes: report.likes,
    commentCount: report.commentCount,
    year: report.year,
    month: report.month,
    createdBy: report.createdBy,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    topics: serializedTopics,
  };

  // Force deep serialization to catch any non-serializable values
  return JSON.parse(JSON.stringify(result)) as any;
}

/**
 * Get all published reports (paginated)
 */
export async function getPublishedReports(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const reports = await db.query.dailyReport.findMany({
    where: eq(dailyReport.status, 'published'),
    orderBy: [desc(dailyReport.date)],
    limit: pageSize,
    offset,
  });

  const totalCount = await db
    .select({ count: sql`count(*)` })
    .from(dailyReport)
    .where(eq(dailyReport.status, 'published'));

  // Serialize Date objects to strings for React Server Components
  const serializedReports = reports.map((report) => ({
    ...report,
    date: report.date.toISOString(),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    publishedAt: report.publishedAt?.toISOString() || null,
  }));

  return {
    reports: serializedReports,
    totalCount: Number(totalCount[0]?.count || 0),
    totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / pageSize),
  };
}

// ============================================================================
// Topic Operations
// ============================================================================

/**
 * Create a topic
 */
export async function createTopic(input: CreateTopicInput) {
  const topicId = `topic_${Date.now()}`;

  await db.insert(dailyTopic).values({
    id: topicId,
    reportId: input.reportId,
    title: input.title,
    summary: input.summary,
    editorNote: input.editorNote,
    category: input.category,
    importance: input.importance || 3,
    tags: input.tags || [],
    sourceMessages: input.sourceMessages,
    sourceGroup: input.sourceGroup,
    views: 0,
    likes: 0,
    commentCount: 0,
    sortOrder: input.sortOrder || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Update category statistics
  await updateCategoryStats(input.category);

  revalidatePath(`/reports/${input.reportId}`);
  return { success: true, topicId };
}

/**
 * Update a topic
 */
export async function updateTopic(topicId: string, input: UpdateTopicInput) {
  await db
    .update(dailyTopic)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dailyTopic.id, topicId));

  revalidatePath('/dashboard/reports');
  return { success: true };
}

/**
 * Delete a topic
 */
export async function deleteTopic(topicId: string) {
  await db.delete(dailyTopic).where(eq(dailyTopic.id, topicId));

  revalidatePath('/dashboard/reports');
  return { success: true };
}

// ============================================================================
// Message Upload and Processing
// ============================================================================



// ============================================================================
// User Preference Operations
// ============================================================================

/**
 * Update user preferences
 */
export async function updateUserPreference(
  userId: string,
  input: UpdateUserPreferenceInput
) {
  await db
    .insert(userPreference)
    .values({
      userId,
      subscribedTags: input.subscribedTags || [],
      emailNotification: input.emailNotification ?? true,
      notificationTime: input.notificationTime || '08:00',
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreference.userId,
      set: {
        ...input,
        updatedAt: new Date(),
      },
    });

  revalidatePath('/settings');
  return { success: true };
}

/**
 * Get user preference
 */
export async function getUserPreference(userId: string) {
  const result = await db.query.userPreference.findFirst({
    where: eq(userPreference.userId, userId),
  });

  if (!result) return null;

  // Serialize Date objects to strings for React Server Components
  return {
    ...result,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  };
}

// ============================================================================
// Category Browse Operations
// ============================================================================

/**
 * Get all topics for a specific category
 */
export async function getTopicsByCategory(
  category: string,
  page = 1,
  pageSize = 20
) {
  const offset = (page - 1) * pageSize;

  // Get topics with their report information
  const topics = await db
    .select({
      topic: dailyTopic,
      report: dailyReport,
    })
    .from(dailyTopic)
    .innerJoin(dailyReport, eq(dailyTopic.reportId, dailyReport.id))
    .where(
      and(
        eq(dailyTopic.category, category),
        eq(dailyReport.status, 'published')
      )
    )
    .orderBy(desc(dailyReport.date))
    .limit(pageSize)
    .offset(offset);

  // Get total count
  const totalCount = await db
    .select({ count: sql`count(*)` })
    .from(dailyTopic)
    .innerJoin(dailyReport, eq(dailyTopic.reportId, dailyReport.id))
    .where(
      and(
        eq(dailyTopic.category, category),
        eq(dailyReport.status, 'published')
      )
    );

  // Serialize Date objects to strings for React Server Components
  // IMPORTANT: Must explicitly list all fields to avoid passing Date objects to client components
  const result = {
    topics: topics.map((t) => ({
      id: t.topic.id,
      reportId: t.topic.reportId,
      title: t.topic.title,
      summary: t.topic.summary,
      content: t.topic.content,
      editorNote: t.topic.editorNote,
      category: t.topic.category,
      importance: t.topic.importance,
      tags: t.topic.tags || [],
      sourceMessages: t.topic.sourceMessages,
      sourceGroup: t.topic.sourceGroup,
      views: t.topic.views,
      likes: t.topic.likes,
      commentCount: t.topic.commentCount,
      sortOrder: t.topic.sortOrder,
      createdAt: t.topic.createdAt.toISOString(),
      updatedAt: t.topic.updatedAt.toISOString(),
      reportDate: t.report.date.toISOString(),
    })),
    totalCount: Number(totalCount[0]?.count || 0),
    totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / pageSize),
  };

  // Force deep serialization to catch any non-serializable values
  return JSON.parse(JSON.stringify(result));
}

/**
 * Get adjacent reports (prev/next) for navigation
 */
export async function getAdjacentReports(currentDate: Date | string) {
  const date =
    typeof currentDate === 'string' ? new Date(currentDate) : currentDate;

  // Convert Date to ISO string for postgres compatibility
  const dateString = date.toISOString();

  // Get previous report
  const prevReports = await db.query.dailyReport.findMany({
    where: and(
      sql`${dailyReport.date} < ${dateString}`,
      eq(dailyReport.status, 'published')
    ),
    orderBy: [desc(dailyReport.date)],
    limit: 1,
  });

  // Get next report
  const nextReports = await db.query.dailyReport.findMany({
    where: and(
      sql`${dailyReport.date} > ${dateString}`,
      eq(dailyReport.status, 'published')
    ),
    orderBy: [dailyReport.date],
    limit: 1,
  });

  return {
    prevReportId: prevReports[0]?.id,
    nextReportId: nextReports[0]?.id,
  };
}

// ============================================================================
// Comment Operations (Stubs - To be implemented)
// ============================================================================

/**
 * Create a comment on a report or topic
 * TODO: Implement comment functionality when comment schema is added
 */
export async function createComment(input: any) {
  console.warn('createComment: Comment functionality not yet implemented');
  throw new Error('Comment functionality is not yet implemented');
}

/**
 * Get comments for a report or topic
 * TODO: Implement comment functionality when comment schema is added
 */
export async function getComments(targetType: string, targetId: string) {
  console.warn('getComments: Comment functionality not yet implemented');
  return [];
}

// ============================================================================
// Message Upload Operations (Stubs - To be implemented)
// ============================================================================

/**
 * Upload and process messages
 * TODO: Implement message upload functionality
 */
function normalizeMessageType(type?: MessageType | string | null): MessageType {
  if (type === 'image' || type === 'link' || type === 'file') {
    return type;
  }
  return 'text';
}

const CATEGORY_NORMALIZATION: Record<string, TopicCategory> = {
  'overseas-experience': '出海经验',
  'qa-selection': '问答精选',
  'industry-trends': '行业动态',
  'network-proxy': '网络与代理',
  'tech-tools': '工具推荐',
  技术教程: '技术教程',
  产品案例: '产品案例',
  出海经验: '出海经验',
  工具推荐: '工具推荐',
  行业动态: '行业动态',
  问答精选: '问答精选',
  账号与设备: '账号与设备',
  网络与代理: '网络与代理',
  支付与订阅: '支付与订阅',
  开发工具: '开发工具',
  项目执行: '项目执行',
  产品与增长: '产品与增长',
  社群与学习: '社群与学习',
  学习认知与避坑: '学习认知与避坑',
  成本规划: '成本规划',
  设备与环境: '设备与环境',
};

function normalizeCategory(category?: string | null): TopicCategory {
  if (!category) return '工具推荐';
  const trimmed = category.trim();
  return CATEGORY_NORMALIZATION[trimmed] ?? ('工具推荐' as TopicCategory);
}

function toParsedMessages(
  input: UploadMessagesInput,
): ParsedMessage[] {
  return input.messages
    .map((message) => {
      const timestamp = new Date(message.timestamp);
      if (Number.isNaN(timestamp.getTime())) {
        return null;
      }

      return {
        id: nanoid(),
        groupName: input.groupName,
        senderName: message.senderName?.trim() || '未知用户',
        senderId: message.senderId || undefined,
        content: (message.content || '').trim(),
        timestamp,
        type: normalizeMessageType(message.messageType),
      } satisfies ParsedMessage;
    })
    .filter(Boolean) as ParsedMessage[];
}

export async function uploadMessages(input: UploadMessagesInput) {
  const parsed = toParsedMessages(input);

  if (parsed.length === 0) {
    return { success: false, error: '未检测到有效的聊天记录' };
  }

  const cleaned = mergeConsecutiveMessages(stage1Filter(parsed));

  if (cleaned.length === 0) {
    return { success: false, error: '全部消息被过滤，请检查文件内容' };
  }

  const rows = cleaned.map((message) => ({
    id: message.id,
    groupName: message.groupName,
    senderName: message.senderName,
    senderId: message.senderId,
    content: message.content,
    messageType: message.type,
    timestamp: message.timestamp,
  }));

  const inserted = await db
    .insert(rawMessage)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: rawMessage.id });

  return {
    success: true,
    count: inserted.length,
    totalMessages: parsed.length,
    filteredMessages: cleaned.length,
  };
}

export async function processMessagesAndCreateReport(
  reportDateInput: Date | string,
  groupNames: string[],
  userId: string
) {
  try {
    const reportDate = new Date(reportDateInput);
    if (Number.isNaN(reportDate.getTime())) {
      return { success: false, error: '无效的日期' };
    }

    const dayStart = new Date(reportDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const filters = [
      gte(rawMessage.timestamp, dayStart),
      lt(rawMessage.timestamp, dayEnd),
    ];

    if (groupNames.length > 0) {
      filters.push(inArray(rawMessage.groupName, groupNames));
    }

    const whereClause = filters.length > 1 ? and(...filters) : filters[0];

    const rawMessages = await db
      .select()
      .from(rawMessage)
      .where(whereClause)
      .orderBy(rawMessage.timestamp);

    if (rawMessages.length === 0) {
      return { success: false, error: '没有可处理的聊天记录' };
    }

    const parsedForAI: ParsedMessage[] = rawMessages.map((message) => ({
      id: message.id,
      groupName: message.groupName,
      senderName: message.senderName,
      senderId: message.senderId || undefined,
      content: message.content,
      timestamp: new Date(message.timestamp),
      type: normalizeMessageType(message.messageType as MessageType),
    }));

    const filtered = stage1Filter(parsedForAI);
    if (filtered.length === 0) {
      return { success: false, error: '过滤后没有有效消息' };
    }

    const { valuable } = await stage2AIScreening(filtered);
    if (!valuable || valuable.length === 0) {
      return { success: false, error: 'AI 未识别出有价值的讨论' };
    }

    const topics = await stage3TopicGeneration(valuable);
    if (!topics || topics.length === 0) {
      return { success: false, error: 'AI 未能生成话题，请稍后重试' };
    }

    const summary = await generateDailySummary(topics);
    const title = `${reportDate.getFullYear()}-${String(
      reportDate.getMonth() + 1
    ).padStart(2, '0')}-${String(reportDate.getDate()).padStart(2, '0')} AI出海社群日报`;

    const reportResult = await createDailyReport(
      {
        date: reportDate,
        title,
        summary,
      },
      userId
    );

    await Promise.all(
      topics.map((topic, index) =>
        createTopic({
          reportId: reportResult.reportId,
          title: topic.title,
          summary: topic.summary,
          category: normalizeCategory(topic.category),
          importance: topic.importance ?? 3,
          tags: topic.tags ?? [],
          sourceGroup: groupNames.join(', ') || '全部群组',
          sourceMessages: JSON.stringify(topic.relatedMessageIds || []),
          sortOrder: index,
        })
      )
    );

    const processedIds = valuable.map((message) => message.id);
    if (processedIds.length > 0) {
      await db
        .update(rawMessage)
        .set({ isProcessed: true, updatedAt: new Date() })
        .where(inArray(rawMessage.id, processedIds));
    }

    return {
      success: true,
      reportId: reportResult.reportId,
      stats: {
        totalMessages: parsedForAI.length,
        filteredMessages: filtered.length,
        topicsGenerated: topics.length,
      },
    };
  } catch (error) {
    console.error('processMessagesAndCreateReport error:', error);
    return { success: false, error: 'AI 处理失败，请检查日志' };
  }
}
