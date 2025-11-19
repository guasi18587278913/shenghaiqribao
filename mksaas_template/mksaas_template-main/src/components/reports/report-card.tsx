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

        {/* 元信息（简化：去掉日期和作者徽章，避免冗余信息） */}
        {/* 保留标签展示（如后续需要可启用） */}
      </div>
    </Link>
  );
}
