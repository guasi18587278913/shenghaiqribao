'use client';

import { cn } from '@/lib/utils';
import type { ArchiveMonth } from '@/types/daily-report';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TimeArchiveProps {
  archives: ArchiveMonth[];
  currentReportId?: string;
}

const MONTH_NAMES = [
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

export function TimeArchive({ archives, currentReportId }: TimeArchiveProps) {
  // Track expanded months (default: expand current month and last month)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    return new Set([currentKey]);
  });

  const toggleMonth = (year: number, month: number) => {
    const key = `${year}-${month}`;
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (archives.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
        <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">暂无日报</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          等待发布第一篇日报
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {archives.map((archive) => {
        const key = `${archive.year}-${archive.month}`;
        const isExpanded = expandedMonths.has(key);
        const isCurrentMonth =
          new Date().getFullYear() === archive.year &&
          new Date().getMonth() + 1 === archive.month;

        return (
          <div key={key} className="space-y-1">
            {/* Month Header */}
            <button
              onClick={() => toggleMonth(archive.year, archive.month)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-all',
                'hover:bg-primary/10 hover:text-primary',
                'border border-transparent hover:border-primary/20',
                isCurrentMonth && 'font-semibold bg-primary/5'
              )}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 transition-transform" />
                )}
                <span>
                  {archive.year}年{MONTH_NAMES[archive.month - 1]}
                </span>
                {isCurrentMonth && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded font-medium">
                    本月
                  </span>
                )}
              </div>
              <span className="px-2 py-0.5 text-xs bg-muted/50 rounded-full font-medium">
                {archive.count}
              </span>
            </button>

            {/* Days List */}
            {isExpanded && (
              <div className="ml-6 space-y-0.5">
                {archive.days.map((day) => {
                  const date = new Date(day.date);
                  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                  const isActive = day.reportId === currentReportId;
                  const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][
                    date.getDay()
                  ];

                  return (
                    <Link
                      key={day.reportId}
                      href={`/reports/${day.reportId}`}
                      className={cn(
                        'block px-3 py-2 text-sm rounded-md transition-all group',
                        'hover:bg-primary/10 hover:text-primary hover:pl-4',
                        isActive &&
                          'bg-primary text-primary-foreground font-medium shadow-sm'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 opacity-60" />
                          <span>{dateStr}</span>
                          <span className="text-xs opacity-60">
                            周{dayOfWeek}
                          </span>
                        </span>
                        {day.topicCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 font-medium opacity-70 group-hover:opacity-100">
                            {day.topicCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
