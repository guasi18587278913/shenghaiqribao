import Link from 'next/link';
import { Calendar, User, Tag } from 'lucide-react';
import type { PageTree } from 'fumadocs-core/server';

interface ReportCardProps {
  report: PageTree.Item;
}

/**
 * Report Card Component for MDX Reports
 *
 * 日报卡片组件 - 用于展示 MDX 日报的卡片样式
 */
export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link
      href={report.url}
      className="group block h-full"
    >
      <div className="relative flex h-full flex-col rounded-xl border bg-gradient-to-br from-muted/40 to-muted/20 p-6 transition-all hover:shadow-xl hover:border-primary/60">
        {/* 装饰条 */}
        <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl bg-primary/80 opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* 标题 */}
        <h3 className="mb-2 text-2xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70">
          {report.data.title}
        </h3>

        {/* 描述 */}
        {report.data.description && (
          <p className="mb-4 flex-1 text-base text-muted-foreground line-clamp-3">
            {report.data.description}
          </p>
        )}

        {/* 元信息 */}
        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {/* 日期 */}
          {report.data.date && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">{report.data.date}</span>
            </span>
          )}

          {/* 作者 */}
          {report.data.author && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
              <User className="h-3.5 w-3.5" />
              <span>{report.data.author}</span>
            </span>
          )}

          {/* 标签 */}
          {report.data.tags && report.data.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {report.data.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {report.data.tags.length > 3 && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                    +{report.data.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
