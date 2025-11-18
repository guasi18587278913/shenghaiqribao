'use server';

import { db } from '@/db/index';
import { announcement } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';

/**
 * 获取欢迎消息
 * 优先返回最新的置顶公告，如果没有则返回默认欢迎消息
 */
export async function getWelcomeMessage(userId: string) {
  try {
    // 查找最新的置顶公告（status = published）
    const latestAnnouncement = await db.query.announcement.findFirst({
      where: and(
        eq(announcement.status, 'published'),
        eq(announcement.isPinned, true)
      ),
      orderBy: [desc(announcement.createdAt)],
    });

    if (latestAnnouncement) {
      return {
        success: true,
        message: latestAnnouncement.content,
        title: latestAnnouncement.title,
        type: latestAnnouncement.type,
      };
    }

    // 如果没有置顶公告，返回默认消息
    return {
      success: true,
      message: `欢迎回来！很高兴再次见到你。

我们为你准备了最新的日报内容，包含了社区中最有价值的讨论和分享。

希望这些内容能为你带来启发和帮助。如果有任何问题或建议，随时欢迎与我们交流。

祝你今天有美好的收获！`,
      title: '欢迎',
      type: 'notice',
    };
  } catch (error) {
    console.error('获取欢迎消息失败:', error);
    return {
      success: false,
      error: '获取欢迎消息失败',
    };
  }
}

/**
 * 获取所有已发布的公告
 */
export async function getPublishedAnnouncements() {
  try {
    const announcements = await db.query.announcement.findMany({
      where: eq(announcement.status, 'published'),
      orderBy: [desc(announcement.isPinned), desc(announcement.createdAt)],
    });

    return {
      success: true,
      announcements,
    };
  } catch (error) {
    console.error('获取公告失败:', error);
    return {
      success: false,
      error: '获取公告失败',
      announcements: [],
    };
  }
}
