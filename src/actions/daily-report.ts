'use server';

/**
 * Server Actions for Daily Report System
 */

import { db } from '@/db';
import {
  dailyReport,
  dailyTopic,
  userPreference,
} from '@/db/schema';
import type {
  CreateDailyReportInput,
  CreateTopicInput,
  DailyReportWithTopics,
  UpdateDailyReportInput,
  UpdateTopicInput,
  UpdateUserPreferenceInput,
} from '@/types/daily-report';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { updateCategoryStats } from './category-stats';

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
