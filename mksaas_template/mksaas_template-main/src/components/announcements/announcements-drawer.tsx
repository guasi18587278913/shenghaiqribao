'use client';

import type { Announcement } from '@/actions/announcements';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import {
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AnnouncementsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcements: Announcement[];
}

/**
 * Announcements Drawer - 优雅的通知抽屉
 * 设计理念：简洁、聚焦、流畅
 */
export function AnnouncementsDrawer({
  open,
  onOpenChange,
  announcements,
}: AnnouncementsDrawerProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  // 当抽屉关闭时，重置选中的通知
  useEffect(() => {
    if (!open) {
      // 延迟重置，等待动画完成
      const timer = setTimeout(() => setSelectedAnnouncement(null), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full sm:w-[480px] sm:max-w-[90vw]">
        {/* Header - 极简设计 */}
        <DrawerHeader className="border-b border-border/50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BellIcon className="h-5 w-5 text-primary" />
              </div>
              <DrawerTitle className="text-xl font-semibold">
                {selectedAnnouncement ? '通知详情' : '官方通知'}
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Content - 双视图切换 */}
        <div className="flex-1 overflow-hidden">
          {selectedAnnouncement ? (
            // 详情视图
            <AnnouncementDetail
              announcement={selectedAnnouncement}
              onBack={() => setSelectedAnnouncement(null)}
            />
          ) : (
            // 列表视图
            <AnnouncementsList
              announcements={announcements}
              onSelect={setSelectedAnnouncement}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * 通知列表视图 - 极简卡片设计
 */
function AnnouncementsList({
  announcements,
  onSelect,
}: {
  announcements: Announcement[];
  onSelect: (announcement: Announcement) => void;
}) {
  if (announcements.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BellIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">暂无通知</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <div className="space-y-3">
        {announcements.map((announcement) => {
          const isPinned = announcement.isPinned;
          const eventDate = announcement.eventDate
            ? new Date(announcement.eventDate)
            : null;
          const isUpcoming = eventDate && eventDate > new Date();

          return (
            <button
              key={announcement.id}
              onClick={() => onSelect(announcement)}
              className={cn(
                'group relative w-full rounded-2xl border p-4 text-left transition-all',
                'hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary/20',
                isPinned && 'border-primary/30 bg-primary/5'
              )}
            >
              {/* 置顶标记 */}
              {isPinned && (
                <div className="absolute top-3 right-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}

              {/* 类型标签 */}
              <div className="mb-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide uppercase',
                    announcement.type === 'event' &&
                      'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                    announcement.type === 'update' &&
                      'bg-green-500/10 text-green-600 dark:text-green-400',
                    announcement.type === 'notice' &&
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  )}
                >
                  {announcement.type === 'event' && '活动'}
                  {announcement.type === 'update' && '更新'}
                  {announcement.type === 'notice' && '通知'}
                </span>
              </div>

              {/* 标题 */}
              <h3 className="mb-2 font-semibold text-base line-clamp-2 pr-4">
                {announcement.title}
              </h3>

              {/* 活动时间 */}
              {announcement.type === 'event' && eventDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <CalendarIcon className="h-3 w-3" />
                  <span>
                    {eventDate.toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isUpcoming && (
                    <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-medium">
                      即将开始
                    </span>
                  )}
                </div>
              )}

              {/* 内容预览 */}
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {announcement.content}
              </p>

              {/* 查看更多 */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground/70">
                  {new Date(announcement.createdAt).toLocaleDateString('zh-CN')}
                </span>
                <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  查看详情
                  <ChevronRightIcon className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 通知详情视图 - 沉浸式阅读体验
 */
function AnnouncementDetail({
  announcement,
  onBack,
}: {
  announcement: Announcement;
  onBack: () => void;
}) {
  const eventDate = announcement.eventDate
    ? new Date(announcement.eventDate)
    : null;
  const isUpcoming = eventDate && eventDate > new Date();

  return (
    <div className="h-full overflow-y-auto">
      {/* 返回按钮 */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 py-3 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4 rotate-180" />
          <span>返回列表</span>
        </button>
      </div>

      {/* 详情内容 */}
      <div className="px-6 py-6 space-y-6">
        {/* 类型标签 */}
        <div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
              announcement.type === 'event' &&
                'bg-blue-500/10 text-blue-600 dark:text-blue-400',
              announcement.type === 'update' &&
                'bg-green-500/10 text-green-600 dark:text-green-400',
              announcement.type === 'notice' &&
                'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            )}
          >
            {announcement.type === 'event' && '📅 活动通知'}
            {announcement.type === 'update' && '🔔 更新公告'}
            {announcement.type === 'notice' && '📢 重要通知'}
          </span>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold leading-tight">
          {announcement.title}
        </h2>

        {/* 活动时间 */}
        {announcement.type === 'event' && eventDate && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {eventDate.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {isUpcoming && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                  · 即将开始
                </p>
              )}
            </div>
          </div>
        )}

        {/* 分隔线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* 内容 */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {announcement.content}
          </div>
        </div>

        {/* 活动链接 */}
        {announcement.eventLink && (
          <div className="pt-4">
            <Link
              href={announcement.eventLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 active:scale-[0.98]',
                'transition-all duration-200',
                'font-medium text-sm shadow-sm'
              )}
            >
              <span>查看详情</span>
              <ExternalLinkIcon className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* 元信息 */}
        <div className="pt-6 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            发布于{' '}
            {new Date(announcement.createdAt).toLocaleDateString('zh-CN')}
          </span>
          <span>{announcement.views} 次浏览</span>
        </div>
      </div>
    </div>
  );
}
