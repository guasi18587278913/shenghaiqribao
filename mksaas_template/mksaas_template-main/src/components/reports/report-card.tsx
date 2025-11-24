import Link from 'next/link';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';

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
    return diffInHours < 48 && diffInHours >= 0; // Extended to 48h for better visibility
  })();

  // Format date: "11-23" or "2025-11-23"
  const dateDisplay = report.data.date ? new Date(report.data.date).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-') : '';

  // Clean title: Remove "AI产品出海日报" suffix/prefix to reduce noise
  const cleanTitle = report.data.title.replace(/AI产品出海日报/g, '').replace(/^\d{2}-\d{2}\s*/, '').trim() || '社群精华';

  return (
    <Link
      href={report.url}
      className="group block h-full"
    >
      <div className="relative flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 overflow-hidden">
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/40 via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Header: Date & New Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Calendar className="w-4 h-4" />
            <span>{dateDisplay}</span>
          </div>

          {isNew && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3" />
              <span>NEW</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
          {cleanTitle}
        </h3>

        {/* Description */}
        {report.data.description && (
          <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {report.data.description}
          </p>
        )}

        {/* Footer: Tags & Arrow */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          <div className="flex flex-wrap gap-2">
            {report.data.tags && report.data.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="text-primary/0 -translate-x-2 group-hover:text-primary group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
