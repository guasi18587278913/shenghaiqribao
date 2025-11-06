import { getCollectionWithTopics } from '@/actions/unified-reports';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getCategoryName } from '@/lib/category-helpers';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Eye,
  Lightbulb,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface KnowledgeDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function KnowledgeDetailPage({
  params,
}: KnowledgeDetailPageProps) {
  const { slug } = await params;

  // Get collection with all its topics
  const data = await getCollectionWithTopics(slug);

  if (!data) {
    notFound();
  }

  const { collection, topics } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/reports">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/reports?view=topic">知识库</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/reports?view=topic&category=${getCategoryName(collection.category)}`}
              >
                {collection.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{collection.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Collection Header */}
        <div className="mb-8 max-w-4xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-6xl">{collection.icon}</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{collection.title}</h1>
              {collection.description && (
                <p className="text-lg text-muted-foreground mb-4">
                  {collection.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{collection.topicCount} 个精华话题</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{collection.views} 次阅读</span>
                </div>
                {collection.periodStart && collection.periodEnd && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(collection.periodStart), 'yyyy.MM.dd', {
                        locale: zhCN,
                      })}{' '}
                      -{' '}
                      {format(new Date(collection.periodEnd), 'yyyy.MM.dd', {
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Curator's Note */}
          {collection.curatorNote && (
            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>编辑者的话</AlertTitle>
              <AlertDescription>{collection.curatorNote}</AlertDescription>
            </Alert>
          )}
        </div>

        <Separator className="my-8" />

        {/* Topics List */}
        <div className="max-w-5xl space-y-6">
          <h2 className="text-2xl font-bold mb-6">📚 话题列表</h2>

          {topics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              该合集暂无话题
            </div>
          ) : (
            topics.map((topic, index) => (
              <Card
                key={topic.id}
                id={`topic-${topic.id}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className="font-mono">
                          #{index + 1}
                        </Badge>
                        <Badge>{topic.category}</Badge>
                        {topic.importance >= 4 && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <span>🔥</span>
                            <span>高价值</span>
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">
                        {topic.title}
                      </CardTitle>
                    </div>
                    <Link
                      href={`/reports/${topic.reportId}#topic-${topic.id}`}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>查看原讨论</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Curator Note for this topic */}
                  {topic.curatorNote && (
                    <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <Pencil className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {topic.curatorNote}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Topic Summary */}
                  <div className="prose dark:prose-invert max-w-none mb-4">
                    <p className="text-muted-foreground">{topic.summary}</p>
                  </div>

                  {/* Tags */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-muted-foreground mt-4 pt-4 border-t flex items-center gap-4">
                    <span>
                      来源：
                      <Link
                        href={`/reports/${topic.reportId}`}
                        className="hover:underline text-foreground"
                      >
                        {format(new Date(topic.createdAt), 'yyyy年MM月dd日', {
                          locale: zhCN,
                        })}{' '}
                        日报
                      </Link>
                    </span>
                    <span>👁️ {topic.views} 次浏览</span>
                    <span>👍 {topic.likes} 个赞</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Back to Collection List */}
        <div className="mt-12 text-center">
          <Link
            href="/reports?view=topic"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>返回知识库列表</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
