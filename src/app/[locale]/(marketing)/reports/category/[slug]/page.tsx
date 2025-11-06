import { getAllCategories, getCategoryBySlug } from '@/actions/category-stats';
import { getTopicsByCategory } from '@/actions/daily-report';
import { TopicCard } from '@/components/daily-report/topic-card';
import { BottomTabNav } from '@/components/reports/bottom-tab-nav';
import { MobileSidebar } from '@/components/reports/mobile-sidebar';
import { Sidebar } from '@/components/reports/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar, Folder, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

/**
 * Category Browse Page
 * Shows all topics from a specific category across all reports
 */

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const searchP = await searchParams;
  const page = Number(searchP.page) || 1;

  // Get category info
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Get topics in this category
  const { topics, totalCount, totalPages } = await getTopicsByCategory(
    category.name,
    page,
    20
  );

  // Get data for sidebar
  const categories = await getAllCategories(20);

  // Group topics by date (topics are already serialized by getTopicsByCategory)
  const topicsByDate = topics.reduce(
    (acc, topic) => {
      const dateKey = new Date(topic.reportDate).toLocaleDateString('zh-CN');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(topic);
      return acc;
    },
    {} as Record<string, typeof topics>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <Sidebar categories={categories} currentCategorySlug={slug} />

        {/* Mobile Sidebar */}
        <MobileSidebar categories={categories} currentCategorySlug={slug} />

        {/* Main Content */}
        <main className="flex-1 pb-16 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <Button asChild variant="ghost" size="sm" className="mb-6">
                <Link href="/reports">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回首页
                </Link>
              </Button>

              {/* Enhanced Category Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <Folder className="h-5 w-5 text-primary" />
                    <Badge variant="secondary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {totalCount} 个话题
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold">
                    {category.name}
                  </CardTitle>
                </CardHeader>

                {(category as any).description && (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">
                      {(category as any).description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Topics List */}
            {topics.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Folder className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">该分类暂无话题</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/reports">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      浏览其他分类
                    </Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(topicsByDate).map(([dateKey, dateTopics]) => (
                  <div key={dateKey} className="space-y-6">
                    {/* Date Header */}
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{dateKey}</span>
                      <span className="text-xs">
                        ({dateTopics.length} 个话题)
                      </span>
                    </div>

                    {/* Topics for this date - Using TopicCard */}
                    <div className="space-y-6">
                      {dateTopics.map((topic, index) => (
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Button asChild variant="outline">
                    <Link href={`/reports/category/${slug}?page=${page - 1}`}>
                      上一页
                    </Link>
                  </Button>
                )}

                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    第 {page} / {totalPages} 页
                  </span>
                </div>

                {page < totalPages && (
                  <Button asChild variant="outline">
                    <Link href={`/reports/category/${slug}?page=${page + 1}`}>
                      下一页
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomTabNav />
      </div>
    </SidebarProvider>
  );
}
