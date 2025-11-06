import { getAllCategories } from '@/actions/category-stats';
import {
  getAdjacentReports,
  getDailyReportWithTopics,
} from '@/actions/daily-report';
import { TopicCard } from '@/components/daily-report/topic-card';
import { BottomTabNav } from '@/components/reports/bottom-tab-nav';
import { CategoryFilter } from '@/components/reports/category-filter';
import { MobileSidebar } from '@/components/reports/mobile-sidebar';
import { ReportDateNav } from '@/components/reports/report-date-nav';
import { Sidebar } from '@/components/reports/sidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TopicCategory } from '@/types/daily-report';
import { BookOpen, Folder, Sparkles, Star } from 'lucide-react';
import { notFound } from 'next/navigation';

/**
 * Test Page - Step 4: Full page structure test
 */
export default async function TestSpecialPage() {
  const report = await getDailyReportWithTopics(
    'special-knowledge-essentials-2024-10'
  );

  if (!report) {
    notFound();
  }

  // Get sidebar data
  const categories = await getAllCategories(20);

  // Get adjacent reports for navigation
  const { prevReportId, nextReportId } = await getAdjacentReports(report.date);

  // Group topics by category
  const topicsByCategory = report.topics.reduce(
    (acc, topic) => {
      if (!acc[topic.category]) {
        acc[topic.category] = [];
      }
      acc[topic.category].push(topic);
      return acc;
    },
    {} as Record<TopicCategory, typeof report.topics>
  );

  const reportCategories = Object.keys(topicsByCategory) as TopicCategory[];

  // Calculate statistics
  const totalTopics = report.topics.length;
  const totalCategories = reportCategories.length;
  const avgImportance =
    report.topics.length > 0
      ? (
          report.topics.reduce((sum, topic) => sum + topic.importance, 0) /
          report.topics.length
        ).toFixed(1)
      : '0';

  // Log data types
  console.log('=== TEST PAGE FULL STRUCTURE ===');
  console.log('report.date type:', typeof report.date);
  console.log('report.date value:', report.date);
  console.log('categories count:', categories.length);
  console.log('totalTopics:', totalTopics);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar categories={categories} />

      {/* Mobile Sidebar */}
      <MobileSidebar categories={categories} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        {/* Date Navigation */}
        <ReportDateNav
          currentDate={report.date}
          prevReportId={prevReportId}
          nextReportId={nextReportId}
        />

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Special Report Header */}
          <div className="mb-8">
            <Card
              className={cn(
                'border-amber-200/50 shadow-md shadow-amber-500/5',
                'bg-gradient-to-br from-amber-50 via-card to-amber-50/30',
                'dark:from-amber-950/20 dark:via-card dark:to-amber-950/10 dark:border-amber-800/30'
              )}
            >
              <CardHeader className="pb-4">
                {/* Special Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    精华合集
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    知识库
                  </Badge>
                </div>

                <CardTitle className="text-3xl md:text-4xl font-bold mb-3">
                  {report.title}
                </CardTitle>
              </CardHeader>

              {report.summary && (
                <CardContent className="pt-0">
                  <div className="rounded-lg border bg-background/50 p-6">
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {report.summary}
                    </p>
                  </div>

                  {/* Statistics Panel */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    <div className="rounded-lg border bg-background/50 p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {totalTopics}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        篇精华话题
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background/50 p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Folder className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {totalCategories}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        个主题分类
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background/50 p-4 text-center col-span-2 md:col-span-1">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {avgImportance}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        平均重要度
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="text-sm font-medium mb-3 text-muted-foreground">
              🏷️ 分类筛选：
            </div>
            <CategoryFilter categories={reportCategories} />
          </div>

          {/* Topics Grouped by Category (First 2 categories only for test) */}
          <div className="space-y-12">
            {Object.entries(topicsByCategory)
              .slice(0, 2)
              .map(([category, topics]) => (
                <div key={category} id={category}>
                  {/* Category Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <span className="text-primary">{category}</span>
                      <span className="text-lg text-muted-foreground font-normal">
                        ({topics.length}个话题)
                      </span>
                    </h2>
                    <div className="mt-2 h-1 w-16 bg-primary rounded-full" />
                  </div>

                  {/* Topics (first 2 only for test) */}
                  <div className="space-y-6">
                    {topics
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .slice(0, 2)
                      .map((topic, index) => (
                        <TopicCard
                          key={topic.id}
                          topic={topic}
                          index={index + 1}
                        />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomTabNav />
    </div>
  );
}
