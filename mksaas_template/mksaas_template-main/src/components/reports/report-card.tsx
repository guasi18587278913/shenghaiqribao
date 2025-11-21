import Link from 'next/link';
import { Calendar, User, Tag } from 'lucide-react';
import type { PageTree } from 'fumadocs-core/server';

interface ReportCardProps {
  report: {
    url: string;
    data: {
      title: string;
      description?: string;
      date?: string;
      tags?: string[];
    };
  };
}

/**
 * Report Card Component for MDX Reports
 *
 * 日报卡片组件 - 用于展示 MDX 日报的卡片样式
 */
export function ReportCard({ report }: ReportCardProps) {
  // Check if report is new (within 24 hours)
  const isNew = (() => {
    if (!report.data.date) return false;
    const reportDate = new Date(report.data.date);
    const now = new Date();
    const diffInHours = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24 && diffInHours >= 0;
  })();

  return (
    <Link
      href={report.url}
      className="group block h-full"
    >
      <div className="relative flex h-full flex-col rounded-xl border bg-linear-to-br from-muted/40 to-muted/20 p-6 transition-all hover:shadow-xl hover:border-primary/60 hover:-translate-y-1">
        {/* 装饰条 */}
        <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl bg-primary/80 opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* New Badge */}
        {isNew && (
          <div className="absolute -right-2 -top-2 z-10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="absolute top-0 right-0 mt-4 mr-1 text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 shadow-sm transform rotate-12">
              NEW
            </span>
          </div>
        )}

        {/* 标题 */}
        <h3 className="mb-2 text-2xl font-bold leading-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70">
          {report.data.title}
        </h3>

        {/* 描述 */}
        {report.data.description && (
          <p className="mb-4 flex-1 text-base text-muted-foreground line-clamp-3">
            {report.data.description}
          </p>
        )}

        {/* Tags */}
        {report.data.tags && report.data.tags.length > 0 && (
          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            {report.data.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
