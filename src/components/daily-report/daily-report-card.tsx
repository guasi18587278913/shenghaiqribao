import { Badge } from '@/components/ui/badge';
import type { DailyReport } from '@/types/daily-report';
import {
  BookOpen,
  Calendar,
  Eye,
  MessageSquare,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import Link from 'next/link';

interface DailyReportCardProps {
  report: DailyReport;
}

export function DailyReportCard({ report }: DailyReportCardProps) {
  const date = new Date(report.date);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  // 检测是否是特殊日报（精华合集）
  const isSpecialReport = report.id.startsWith('special-');

  // 清理标题中的重复信息和日期
  const cleanTitle = (title: string) => {
    return title
      .replace(/AI出海社群日报/g, '')
      .replace(/AI出海日报/g, '')
      .replace(/\d{4}年\d{1,2}月\d{1,2}日/g, '') // 2024年11月5日
      .replace(/\d{4}-\d{1,2}-\d{1,2}/g, '') // 2024-11-05
      .replace(/\d{1,2}月\d{1,2}日/g, '') // 11月5日
      .trim();
  };

  // 从摘要中提取关键词作为标签
  const extractTags = (summary = '', title = '') => {
    const text = `${title} ${summary}`;
    const keywords = [
      'Cursor',
      'AI',
      'SEO',
      'ChatGPT',
      'Claude',
      'GPT',
      '独立开发',
      '客服',
      '营销',
      '支付',
      '账号',
      '代理',
      'Vercel',
      'Stripe',
      'API',
      '工具',
      '教程',
      '出海',
      '产品',
      '增长',
      '技术',
      '开发',
    ];

    const found: string[] = [];
    for (const keyword of keywords) {
      if (text.includes(keyword) && found.length < 3) {
        found.push(keyword);
      }
    }
    return found;
  };

  const tags = extractTags(report.summary || '', report.title);

  return (
    <Link href={`/reports/${report.id}`} className="group block h-full">
      <div
        className={`relative h-full rounded-2xl p-7 transition-all duration-300 ${
          isSpecialReport
            ? 'bg-gradient-to-br from-amber-50 via-card to-amber-50/30 dark:from-amber-950/20 dark:via-card dark:to-amber-950/10 shadow-md shadow-amber-500/5 hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1'
            : 'bg-card shadow-sm shadow-black/5 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1'
        }`}
      >
        {/* Special Badge */}
        {isSpecialReport && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg">
            <Sparkles className="h-3 w-3" />
            <span>精华合集</span>
          </div>
        )}

        {/* Date Badge */}
        <div
          className={`mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
            isSpecialReport
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {isSpecialReport ? (
            <>
              <BookOpen className="h-3.5 w-3.5" />
              <span>知识库</span>
            </>
          ) : (
            <>
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {date.toLocaleDateString('zh-CN', {
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="text-xs opacity-75">
                {weekdays[date.getDay()]}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-bold leading-tight group-hover:text-primary transition-colors">
          {cleanTitle(report.title)}
        </h3>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Summary */}
        {report.summary && (
          <p className="mb-8 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {report.summary}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-5 pt-4 border-t border-border/40 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors">
            <Eye className="h-3.5 w-3.5" />
            <span className="tabular-nums">{report.views}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="tabular-nums">{report.likes}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="tabular-nums">{report.commentCount}</span>
          </span>
        </div>

        {/* Hover indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </Link>
  );
}
