import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
    const diffInHours =
      (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 48 && diffInHours >= 0; // Extended to 48h for better visibility
  })();

  // Format date parts for display
  const dateObj = report.data.date ? new Date(report.data.date) : null;
  const monthDisplay = dateObj ? (dateObj.getMonth() + 1).toString() : '';
  const dayDisplay = dateObj
    ? dateObj.getDate().toString().padStart(2, '0')
    : '';

  return (
    <Link href={report.url} className="group block h-full">
      <div className="relative flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 overflow-hidden">
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/40 via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Header: Large Date Display */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground group-hover:text-primary transition-colors">
              {dayDisplay}
            </span>
            <span className="text-lg font-medium text-muted-foreground">
              /{monthDisplay}月
            </span>
          </div>

          {isNew && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3" />
              <span>NEW</span>
            </div>
          )}
        </div>

        {/* Description */}
        {report.data.description && (
          <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {report.data.description}
          </p>
        )}

        {/* Footer: Tags & Arrow */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          <div className="flex flex-wrap gap-2">
            {report.data.tags &&
              report.data.tags.slice(0, 2).map((tag: string) => (
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
