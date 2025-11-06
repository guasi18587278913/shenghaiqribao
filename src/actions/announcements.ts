'use server';

import { db } from '@/db';
import { announcement } from '@/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Announcement type definition
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'event' | 'update' | 'notice';
  isPinned: boolean;
  status: 'draft' | 'published' | 'archived';
  eventDate: Date | null;
  eventLink: string | null;
  views: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all published announcements with pagination
 * Pinned announcements always appear first
 */
export async function getAnnouncements(page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;

    // Get announcements ordered by pinned status and creation date
    const announcements = await db
      .select()
      .from(announcement)
      .where(eq(announcement.status, 'published'))
      .orderBy(desc(announcement.isPinned), desc(announcement.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(announcement)
      .where(eq(announcement.status, 'published'));

    // Serialize Date objects to strings for React Server Components
    const serializedAnnouncements = announcements.map((a) => ({
      ...a,
      eventDate: a.eventDate?.toISOString() || null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

    return {
      announcements: serializedAnnouncements,
      total: Number(count),
      hasMore: offset + announcements.length < Number(count),
    };
  } catch (error) {
    console.error('Failed to get announcements:', error);
    throw new Error('获取官方通知失败');
  }
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncementById(id: string) {
  try {
    const [announcementData] = await db
      .select()
      .from(announcement)
      .where(eq(announcement.id, id));

    if (!announcementData) {
      throw new Error('通知不存在');
    }

    // Increment view count
    await db
      .update(announcement)
      .set({
        views: sql`${announcement.views} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(announcement.id, id));

    // Serialize Date objects to strings for React Server Components
    return {
      ...announcementData,
      eventDate: announcementData.eventDate?.toISOString() || null,
      createdAt: announcementData.createdAt.toISOString(),
      updatedAt: announcementData.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Failed to get announcement:', error);
    throw new Error('获取通知详情失败');
  }
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(data: {
  title: string;
  content: string;
  type: 'event' | 'update' | 'notice';
  isPinned?: boolean;
  status?: 'draft' | 'published';
  eventDate?: Date;
  eventLink?: string;
  createdBy: string;
}) {
  try {
    const id = nanoid();

    const [newAnnouncement] = await db
      .insert(announcement)
      .values({
        id,
        title: data.title,
        content: data.content,
        type: data.type,
        isPinned: data.isPinned || false,
        status: data.status || 'published',
        eventDate: data.eventDate || null,
        eventLink: data.eventLink || null,
        createdBy: data.createdBy,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newAnnouncement;
  } catch (error) {
    console.error('Failed to create announcement:', error);
    throw new Error('创建通知失败');
  }
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    type: 'event' | 'update' | 'notice';
    isPinned: boolean;
    status: 'draft' | 'published' | 'archived';
    eventDate: Date | null;
    eventLink: string | null;
  }>
) {
  try {
    const [updated] = await db
      .update(announcement)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(announcement.id, id))
      .returning();

    if (!updated) {
      throw new Error('通知不存在');
    }

    return updated;
  } catch (error) {
    console.error('Failed to update announcement:', error);
    throw new Error('更新通知失败');
  }
}

/**
 * Delete an announcement (soft delete by archiving)
 */
export async function deleteAnnouncement(id: string) {
  try {
    await db
      .update(announcement)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(announcement.id, id));

    return { success: true };
  } catch (error) {
    console.error('Failed to delete announcement:', error);
    throw new Error('删除通知失败');
  }
}

/**
 * Get upcoming events (announcements with future event dates)
 */
export async function getUpcomingEvents(limit = 5) {
  try {
    const now = new Date();

    const events = await db
      .select()
      .from(announcement)
      .where(
        and(
          eq(announcement.status, 'published'),
          eq(announcement.type, 'event'),
          sql`${announcement.eventDate} >= ${now}`
        )
      )
      .orderBy(announcement.eventDate)
      .limit(limit);

    // Serialize Date objects to strings for React Server Components
    return events.map((e) => ({
      ...e,
      eventDate: e.eventDate?.toISOString() || null,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to get upcoming events:', error);
    throw new Error('获取即将到来的活动失败');
  }
}
