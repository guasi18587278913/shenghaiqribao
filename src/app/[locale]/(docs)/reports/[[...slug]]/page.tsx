import { getMDXComponents } from '@/components/docs/mdx-components';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
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

    return (
      <div className="container max-w-4xl py-12">
        <article className="prose prose-slate dark:prose-invert prose-chinese max-w-none">
          <h1>{t('title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('description')}
          </p>
          <div className="mt-8 space-y-6">
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
                  <h2 className="mb-2">
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
        </article>
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
    <div className="container max-w-4xl py-12">
      {/*
        排版样式对比说明:
        - prose-premium: 高级排版风格 - Notion + Medium + Apple 风格融合
        - prose-chinese: 🌟 中文阅读优化版(当前使用)
        - prose-fumadocs: 专业文档风格

        要切换样式,在浏览器开发者工具中修改下面 article 的 className:
        方案一(高级版): prose prose-slate dark:prose-invert prose-premium max-w-none
        方案二(中文优化): prose prose-slate dark:prose-invert prose-chinese max-w-none
        方案三(专业文档): prose prose-slate dark:prose-invert prose-fumadocs max-w-none
      */}
      <article className="prose prose-slate dark:prose-invert prose-chinese max-w-none">
        <h1>{page.data.title}</h1>
        {page.data.description && (
          <p className="text-xl text-muted-foreground">
            {page.data.description}
          </p>
        )}
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
  );
}
