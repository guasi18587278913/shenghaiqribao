'use client';

import { Button } from '@/components/ui/button';
import type { DailyReport } from '@/types/daily-report';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Edit, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import Link from 'next/link';

interface ReportListProps {
  reports: DailyReport[];
}

export function ReportList({ reports }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">暂无日报</p>
        <Link href="/dashboard/reports/create">
          <Button className="mt-4">创建第一份日报</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between p-6 transition-colors hover:bg-muted/50"
        >
          <div className="flex-1">
            <Link href={`/reports/${report.id}`} className="group">
              <h3 className="mb-1 font-semibold group-hover:text-primary">
                {report.title}
              </h3>
              <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                {report.summary}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {new Date(report.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {report.views}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {report.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {report.commentCount}
                </span>
              </div>
            </Link>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                report.status === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
              }`}
            >
              {report.status === 'published' ? '已发布' : '草稿'}
            </span>
            <Link href={`/dashboard/reports/${report.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
