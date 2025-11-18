import { getMDXComponents } from '@/components/docs/mdx-components';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ReportCard } from '@/components/reports/report-card';
import { LOCALES } from '@/i18n/routing';
import { constructMetadata } from '@/lib/metadata';
import { reportsSource } from '@/lib/source';
import Link from 'fumadocs-core/link';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const slugParams = reportsSource.generateParams();
  const params = LOCALES.flatMap((locale) =>
    slugParams.map((param) => ({
      locale,
      slug: param.slug,
    }))
  );

  return params;
}

export async function generateMetadata({ params }: ReportPageProps) {
  const { slug, locale } = await params;
  const language = locale as string;

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  // Handle index page metadata
  if (!slug || slug.length === 0) {
    return constructMetadata({
      title: t('reports'),
      description: '每日社群精华内容整理',
      locale,
      pathname: '/reports',
    });
  }

  const page = reportsSource.getPage(slug, language);
  if (!page) {
    console.warn('report page not found', slug, language);
    notFound();
  }

  return constructMetadata({
    title: `${page.data.title} | ${t('reports')}`,
    description: page.data.description,
    locale,
    pathname: `/reports/${page.slugs.join('/')}`,
  });
}

export const revalidate = false;

interface ReportPageProps {
  params: Promise<{
    slug?: string[];
    locale: Locale;
  }>;
}

/**
 * Daily Reports Page
 *
 * Displays daily report articles with proper navigation and TOC
 * If no slug is provided, displays an index page with all reports
 */
export default async function ReportPage({ params }: ReportPageProps) {
  const { slug, locale } = await params;
  const language = locale as string;

  // Handle index page (no slug)
  if (!slug || slug.length === 0) {
    const allReports = reportsSource.getPages(language);
    const t = await getTranslations({ locale, namespace: 'ReportsPage' });

    const sortedReports = allReports
      .filter((report) => report.data.published !== false)
      .sort(
        (a, b) =>
          new Date(b.data.date).getTime() -
          new Date(a.data.date).getTime()
      );

    return (
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('subtitle')}
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              每日精选社群讨论精华,帮你高效获取关键信息
            </p>
          </div>

          {/* Reports Grid */}
          {sortedReports.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">暂无日报发布</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedReports.map((report) => (
                <ReportCard key={report.url} report={report} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const page = reportsSource.getPage(slug, language);

  if (!page) {
    console.warn('report page not found', slug, language);
    notFound();
  }

  const MDX = page.data.body;

  return (
    <div className="container max-w-5xl py-20 px-6">
      {/* 标题区域 - 居中设计 */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {page.data.title}
        </h1>
        {page.data.description && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {page.data.description}
          </p>
        )}
        {page.data.date && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time>{new Date(page.data.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          </div>
        )}
      </div>

      {/* 内容区域 - 带背景卡片 */}
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg p-8 md:p-12">
        <article className="prose prose-lg prose-slate dark:prose-invert prose-premium prose-compact max-w-none mx-auto">{/*
        排版样式: prose-premium prose-compact
        - prose-compact: 使用紧凑模式，减少段落间距
        - 解决文字太分散的问题
      */}
          <MDX
            components={getMDXComponents({
              a: ({ href, ...props }: { href?: string; [key: string]: any }) => {
                const found = reportsSource.getPageByHref(href ?? '', {
                  dir: page.file?.dirname,
                });

                if (!found) return <Link href={href} {...props} />;

                return (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Link
                        href={
                          found.hash
                            ? `${found.page.url}#${found.hash}`
                            : found.page.url
                        }
                        {...props}
                      />
                    </HoverCardTrigger>
                    <HoverCardContent className="text-sm">
                      <p className="font-medium">{found.page.data.title}</p>
                      <p className="text-fd-muted-foreground">
                        {found.page.data.description}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                );
              },
            })}
          />
        </article>
      </div>
    </div>
  );
}
