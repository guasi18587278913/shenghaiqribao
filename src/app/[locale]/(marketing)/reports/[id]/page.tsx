import { getAllCategories } from '@/actions/category-stats';
import {
  getAdjacentReports,
  getDailyReportWithTopics,
} from '@/actions/daily-report';
import { checkPlanetVerification } from '@/actions/planet-auth';
import { CommentSection } from '@/components/daily-report/comment-section';
import { TopicCard } from '@/components/daily-report/topic-card';
import { BottomTabNav } from '@/components/reports/bottom-tab-nav';
import { CategoryFilter } from '@/components/reports/category-filter';
import { MobileSidebar } from '@/components/reports/mobile-sidebar';
import { ReportDateNav } from '@/components/reports/report-date-nav';
import { Sidebar } from '@/components/reports/sidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { TopicCategory } from '@/types/daily-report';
import {
  BookOpen,
  Eye,
  Folder,
  MessageSquare,
  Sparkles,
  Star,
  ThumbsUp,
} from 'lucide-react';
import { notFound, redirect } from 'next/navigation';

interface ReportDetailPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

/**
 * Daily Report Detail Page
 */
export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  // 🔐 权限检查：验证星球成员身份
  // ⚠️ 临时注释以便预览分类效果 - 生产环境请取消注释
  // const { verified } = await checkPlanetVerification();
  // if (!verified) {
  //   redirect('/verify-planet');
  // }

  const { id } = await params;
  const report = await getDailyReportWithTopics(id);

  if (!report || report.status !== 'published') {
    notFound();
  }

  // Get adjacent reports for navigation
  const { prevReportId, nextReportId } = await getAdjacentReports(report.date);

  // Get sidebar data
  const categories = await getAllCategories(20);

  // Group topics by category (topics are already serialized by getDailyReportWithTopics)
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

  // Get all unique categories in this report
  const reportCategories = Object.keys(topicsByCategory) as TopicCategory[];

  // IMPORTANT: report.date is already an ISO string from getDailyReportWithTopics
  const dateString = report.date;

  // Parse date parts from ISO string without creating persistent Date objects
  const parseDateParts = (isoString: string) => {
    const d = new Date(isoString);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      weekdayIndex: d.getDay(),
    };
  };

  const { year, month, day, weekdayIndex } = parseDateParts(dateString);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[weekdayIndex];

  // Check if this is a special report (Knowledge Essentials)
  const isSpecialReport = report.id.startsWith('special-');

  // Calculate statistics for special reports
  const totalTopics = report.topics.length;
  const totalCategories = reportCategories.length;
  const avgImportance =
    report.topics.length > 0
      ? (
          report.topics.reduce((sum, topic) => sum + topic.importance, 0) /
          report.topics.length
        ).toFixed(1)
      : '0';

  return (
    <SidebarProvider>
      <div className="min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar categories={categories} />

        {/* Mobile Sidebar */}
        <MobileSidebar categories={categories} />

        {/* Main Content */}
        <main className="md:ml-80 pb-16 md:pb-0">
          {/* Date Navigation */}
          <ReportDateNav
            currentDate={dateString}
            prevReportId={prevReportId}
            nextReportId={nextReportId}
          />

          <div className="px-6 md:px-8 py-8 w-full">
            {/* Report Header */}
            {isSpecialReport ? (
              // Special Report Header (Knowledge Essentials)
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

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {report.views} 浏览
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {report.likes} 点赞
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {report.commentCount} 评论
                      </span>
                    </div>
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
            ) : (
              // Regular Report Header
              <div className="mb-8">
                <div className="mb-4 flex flex-col gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {report.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {year}年{month}月{day}日 • {weekday}
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
                </div>

                {report.summary && (
                  <div className="rounded-lg border bg-muted/50 p-6">
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {report.summary}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Category Filter (Client Component - TODO: Add filtering logic) */}
            <div className="mb-6">
              <div className="text-sm font-medium mb-3 text-muted-foreground">
                🏷️ 分类筛选：
              </div>
              <CategoryFilter categories={reportCategories} />
            </div>

            {/* Topics Grouped by Category */}
            <div className="space-y-12">
              {Object.entries(topicsByCategory).map(([category, topics]) => (
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

                  {/* Topics in this category */}
                  <div className="space-y-6">
                    {topics
                      .sort((a, b) => a.sortOrder - b.sortOrder)
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

            {/* Comments */}
            <div className="mt-12 rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-xl font-bold">
                💬 评论区 ({report.commentCount})
              </h2>
              <CommentSection targetType="report" targetId={report.id} />
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomTabNav />
      </div>
    </SidebarProvider>
  );
}
