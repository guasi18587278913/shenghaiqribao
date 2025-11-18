'use client';

import { DailyReportCard } from '@/components/daily-report/daily-report-card';
import { KnowledgeCategorySidebar } from '@/components/reports/knowledge-category-sidebar';
import type { KnowledgeCategory } from '@/lib/knowledge-categories';
import { cn } from '@/lib/utils';
import type { DailyReport } from '@/types/daily-report';
import { Calendar, ChevronDown } from 'lucide-react';
import type { Locale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface ReportsPageClientProps {
  locale: Locale;
  reports: DailyReport[];
  knowledgeCategories: KnowledgeCategory[];
  title: string;
  subtitle: string;
}

/**
 * Reports Page Client Component
 *
 * Handles client-side filtering and interactions
 */
export function ReportsPageClient({
  locale,
  reports,
  knowledgeCategories,
  title,
  subtitle,
}: ReportsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );

  // Handle category selection
  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`/${locale}/reports?${params.toString()}`);
  };

  // Filter reports by category if selected
  const filteredReports = selectedCategory
    ? reports.filter((report) => {
        // Filter logic would check if report belongs to category
        // For now, show all reports
        return true;
      })
    : reports;

  // Group reports by date
  const reportsByDate = filteredReports.reduce(
    (acc, report) => {
      const dateKey = new Date(report.date).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(report);
      return acc;
    },
    {} as Record<string, DailyReport[]>
  );

  const sortedDates = Object.keys(reportsByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Knowledge Categories */}
      <KnowledgeCategorySidebar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        knowledgeCategories={knowledgeCategories}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar with Date Selector */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Title Section */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              </div>

              {/* Date Selector - Future enhancement */}
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md',
                  'bg-accent/50 hover:bg-accent transition-colors',
                  'text-sm font-medium'
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>选择日期</span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </button>
            </div>
          </div>
        </div>

        {/* Reports List - Grouped by Date */}
        <div className="container max-w-5xl mx-auto px-6 py-8">
          <div className="space-y-12">
            {sortedDates.map((dateKey) => {
              const reportsForDate = reportsByDate[dateKey];
              const dateObj = new Date(dateKey);
              const dateDisplay = dateObj.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              });

              return (
                <div key={dateKey} className="space-y-4">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {dateDisplay}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Reports for this date */}
                  <div className="space-y-4">
                    {reportsForDate.map((report) => (
                      <DailyReportCard
                        key={report.id}
                        report={report}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {sortedDates.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">暂无日报内容</h3>
              <p className="text-sm text-muted-foreground">
                请选择其他日期或分类查看
              </p>
            </div>
          )}

          {/* Load More - For future pagination */}
          {sortedDates.length > 0 && (
            <div className="text-center pt-8">
              <button
                type="button"
                className={cn(
                  'px-6 py-2.5 rounded-md',
                  'bg-accent hover:bg-accent/80 transition-colors',
                  'text-sm font-medium'
                )}
              >
                加载更多
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
