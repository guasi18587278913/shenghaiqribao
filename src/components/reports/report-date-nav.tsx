'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ReportDateNavProps {
  currentDate: Date | string;
  prevReportId?: string;
  nextReportId?: string;
  className?: string;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const MONTHS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];

export function ReportDateNav({
  currentDate,
  prevReportId,
  nextReportId,
  className,
}: ReportDateNavProps) {
  const date = new Date(currentDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const weekday = date.getDay();

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-6 md:px-8 py-4 bg-card border-b sticky top-16 z-10',
        className
      )}
    >
      {/* Previous Button */}
      <div className="flex-shrink-0">
        {prevReportId ? (
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/reports/${prevReportId}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">上一天</span>
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">上一天</span>
          </Button>
        )}
      </div>

      {/* Current Date Display */}
      <div className="flex-1 flex items-center justify-center gap-2 text-center">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">
            {year}年{MONTHS[month]}
            {day}日
          </div>
          <div className="text-xs text-muted-foreground">
            {WEEKDAYS[weekday]}
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex-shrink-0">
        {nextReportId ? (
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/reports/${nextReportId}`}>
              <span className="hidden sm:inline">下一天</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="gap-2">
            <span className="hidden sm:inline">下一天</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
