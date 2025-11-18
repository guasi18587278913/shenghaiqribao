import Link from 'next/link';
import { getPublishedReports } from '@/actions/daily-report';
import { DailyReportCard } from '@/components/daily-report/daily-report-card';
import { Button } from '@/components/ui/button';

/**
 * 测试页面：数据库版本 - 卡片列表风格
 *
 * 特点：
 * - 从 PostgreSQL 数据库读取数据
 * - 卡片网格布局
 * - 动态内容管理
 * - 分页功能
 */
export default async function TestDbPage() {
  const { reports, totalPages } = await getPublishedReports(1, 12);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {/* 标识横幅 */}
          <div className="mb-8 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-500 p-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  数据库版本 (PostgreSQL)
                </h2>
                <p className="text-blue-800 dark:text-blue-200 mb-3">
                  这是从数据库读取的卡片列表风格。特点是可以动态管理，通过后台上传、编辑、发布日报。
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-1 text-blue-900 dark:text-blue-100">
                    ✅ 动态管理
                  </span>
                  <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-1 text-blue-900 dark:text-blue-100">
                    ✅ 卡片网格布局
                  </span>
                  <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-1 text-blue-900 dark:text-blue-100">
                    ✅ 数据库查询
                  </span>
                  <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-1 text-blue-900 dark:text-blue-100">
                    ✅ 分页功能
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              数据库版本演示
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight">
              AI产品出海社群日报
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              卡片网格布局，数据来自 PostgreSQL 数据库
            </p>
          </div>

          {/* Reports Grid */}
          {reports.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">暂无日报发布</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map(report => (
                <DailyReportCard key={report.id} report={report} />
              ))}
            </div>
          )}

          {/* 对比链接 */}
          <div className="mt-12 flex justify-center gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/zh/test-mdx">
                查看 MDX 文档版本 →
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/zh/reports">
                返回正式页面
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
