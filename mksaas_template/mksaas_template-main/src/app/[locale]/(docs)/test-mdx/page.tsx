import Link from 'next/link';
import { reportsSource } from '@/lib/source';
import type { Locale } from 'next-intl';
import { Button } from '@/components/ui/button';

interface TestMdxPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

/**
 * 测试页面：MDX 文档版本 - Fumadocs 风格
 *
 * 特点：
 * - 从 MDX 文件读取内容
 * - 左侧边栏树形导航
 * - 文档风格排版
 * - 版本控制友好
 */
export default async function TestMdxPage({ params }: TestMdxPageProps) {
  const { locale } = await params;
  const allReports = reportsSource.getPages(locale as string);

  return (
    <div className="container max-w-4xl py-12">
      {/* 标识横幅 */}
      <div className="mb-8 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950/30 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-green-500 p-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
              MDX 文档版本 (Fumadocs)
            </h2>
            <p className="text-green-800 dark:text-green-200 mb-3">
              这是从 MDX 文件读取的文档风格。特点是有左侧边栏树形导航，排版精美，适合长期内容沉淀。
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-md bg-green-100 dark:bg-green-900 px-2 py-1 text-green-900 dark:text-green-100">
                ✅ 左侧边栏导航
              </span>
              <span className="rounded-md bg-green-100 dark:bg-green-900 px-2 py-1 text-green-900 dark:text-green-100">
                ✅ 文档风格排版
              </span>
              <span className="rounded-md bg-green-100 dark:bg-green-900 px-2 py-1 text-green-900 dark:text-green-100">
                ✅ MDX 文件管理
              </span>
              <span className="rounded-md bg-green-100 dark:bg-green-900 px-2 py-1 text-green-900 dark:text-green-100">
                ✅ 版本控制友好
              </span>
            </div>
          </div>
        </div>
      </div>

      <article className="prose prose-slate dark:prose-invert prose-premium max-w-none">
        <h1>MDX 文档版本演示</h1>
        <p className="text-xl text-muted-foreground">
          注意左侧边栏的树形导航结构，这是 Fumadocs 提供的专业文档布局
        </p>

        <div className="not-prose mt-8 space-y-6">
          {allReports
            .filter((report) => report.data.published !== false)
            .sort(
              (a, b) =>
                new Date(b.data.date).getTime() -
                new Date(a.data.date).getTime()
            )
            .map((report) => (
              <div
                key={report.url}
                className="border-b border-border pb-6 last:border-0"
              >
                <h2 className="mb-2 text-2xl font-semibold">
                  <Link
                    href={report.url}
                    className="no-underline hover:underline"
                  >
                    {report.data.title}
                  </Link>
                </h2>
                {report.data.description && (
                  <p className="text-muted-foreground">
                    {report.data.description}
                  </p>
                )}
                <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                  <span>{report.data.date}</span>
                  {report.data.author && <span>作者: {report.data.author}</span>}
                </div>
                {report.data.tags && report.data.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="not-prose mt-12 flex justify-center gap-4">
          <Button asChild variant="outline" size="lg">
            <Link href="/zh/test-db">
              ← 查看数据库卡片版本
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/zh/reports">
              返回正式页面
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
