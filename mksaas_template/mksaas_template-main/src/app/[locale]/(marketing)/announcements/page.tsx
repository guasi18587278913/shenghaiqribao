import { getAnnouncements } from '@/actions/announcements';
import { cn } from '@/lib/utils';
import {
  BellIcon,
  CalendarIcon,
  ExternalLinkIcon,
  PinIcon,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Announcements Page
 * 官方通知页面
 */
export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { announcements, total, hasMore } = await getAnnouncements(page, 20);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BellIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">官方通知</h1>
          <p className="text-lg text-muted-foreground">
            社群重要公告和活动信息
          </p>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-semibold">暂无通知</h2>
            <p className="text-muted-foreground">
              还没有发布任何通知，请稍后再来查看。
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((item) => {
              const isPinned = item.isPinned;
              const isEvent = item.type === 'event';
              const eventDate = item.eventDate
                ? new Date(item.eventDate)
                : null;
              const isUpcoming = eventDate && eventDate > new Date();

              return (
                <article
                  key={item.id}
                  className={cn(
                    'relative rounded-xl border bg-gradient-to-br from-card to-card/50 p-6 transition-all',
                    'hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50',
                    isPinned &&
                      'border-primary/30 bg-gradient-to-br from-primary/5 to-card'
                  )}
                >
                  {/* Pinned Badge */}
                  {isPinned && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <PinIcon className="h-3 w-3" />
                        <span>置顶</span>
                      </div>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="mb-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium',
                        item.type === 'event' &&
                          'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                        item.type === 'update' &&
                          'bg-green-500/10 text-green-600 dark:text-green-400',
                        item.type === 'notice' &&
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {item.type === 'event' && '📅 活动通知'}
                      {item.type === 'update' && '🔔 更新公告'}
                      {item.type === 'notice' && '📢 重要通知'}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-3 text-xl font-bold">{item.title}</h2>

                  {/* Event Date */}
                  {isEvent && eventDate && (
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {eventDate.toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isUpcoming && (
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                          即将开始
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="mb-4 text-muted-foreground whitespace-pre-wrap">
                    {item.content}
                  </div>

                  {/* Event Link */}
                  {item.eventLink && (
                    <div className="mt-4">
                      <Link
                        href={item.eventLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                          'bg-primary text-primary-foreground',
                          'hover:bg-primary/90 transition-colors',
                          'text-sm font-medium'
                        )}
                      >
                        <span>查看详情</span>
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      发布于{' '}
                      {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <span>{item.views} 次浏览</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            {page > 1 && (
              <Link
                href={`/announcements?page=${page - 1}`}
                className="px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
              >
                上一页
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              第 {page} 页，共 {Math.ceil(total / 20)} 页
            </span>
            {hasMore && (
              <Link
                href={`/announcements?page=${page + 1}`}
                className="px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
              >
                下一页
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
