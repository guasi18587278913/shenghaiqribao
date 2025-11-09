import { getMDXComponents } from '@/components/docs/mdx-components';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { LOCALES } from '@/i18n/routing';
import { constructMetadata } from '@/lib/metadata';
import { knowledgeSource } from '@/lib/source';
import Link from 'fumadocs-core/link';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const slugParams = knowledgeSource.generateParams();
  const params = LOCALES.flatMap((locale) =>
    slugParams.map((param) => ({
      locale,
      slug: param.slug,
    }))
  );

  return params;
}

export async function generateMetadata({ params }: KnowledgePageProps) {
  const { slug, locale } = await params;
  const language = locale as string;

  // Decode URL-encoded slugs (for Chinese characters)
  const decodedSlug = slug?.map(s => decodeURIComponent(s));

  const page = knowledgeSource.getPage(decodedSlug, language);

  if (!page) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: `${page.data.title} | ${t('knowledge')}`,
    description: page.data.description,
    locale,
    pathname: `/knowledge/${page.slugs.join('/')}`,
  });
}

export const revalidate = false;

interface KnowledgePageProps {
  params: Promise<{
    slug?: string[];
    locale: Locale;
  }>;
}

/**
 * Knowledge Base Page
 *
 * Displays knowledge base articles with proper navigation and TOC
 */
export default async function KnowledgePage({ params }: KnowledgePageProps) {
  const { slug, locale } = await params;
  const language = locale as string;

  // Decode URL-encoded slugs (for Chinese characters)
  const decodedSlug = slug?.map(s => decodeURIComponent(s));

  const page = knowledgeSource.getPage(decodedSlug, language);

  if (!page) {
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
              const found = knowledgeSource.getPageByHref(href ?? '', {
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
