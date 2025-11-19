import { XTwitterIcon } from '@/components/icons/x';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { websiteConfig } from '@/config/website';
import { docsI18nConfig } from '@/lib/docs/i18n';
import { knowledgeSource, reportsSource } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import type { Locale } from 'next-intl';
import type { ReactNode } from 'react';

import '@/styles/mdx.css';
import 'fumadocs-ui/style.css';

interface DocsLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

/**
 * Shared Layout for Reports and Knowledge Base
 *
 * Unified sidebar with reports timeline and knowledge categories
 * This layout is shared between /reports and /knowledge routes to prevent re-rendering
 */
export default async function SharedDocsLayout({
  children,
  params,
}: DocsLayoutProps) {
  const { locale } = await params;

  // 合并导航树: 日报时间线 + 知识库分类
  const reportsTree = reportsSource.pageTree[locale] || reportsSource.pageTree;
  const knowledgeTree = knowledgeSource.pageTree[locale] || knowledgeSource.pageTree;

  // 创建合并的导航树
  const mergedTree = {
    ...(typeof reportsTree === 'object' && reportsTree !== null ? reportsTree : {}),
    name: 'Docs',
    children: [
      // 添加日报分隔符
      {
        type: 'separator' as const,
        name: '📰 日报',
      },
      // 日报页面列表
      ...(reportsTree && typeof reportsTree === 'object' && 'children' in reportsTree && Array.isArray(reportsTree.children) ? reportsTree.children : []),
      // 添加知识分类分隔符
      {
        type: 'separator' as const,
        name: '📚 知识分类',
      },
      // 知识库分类列表
      ...(knowledgeTree && typeof knowledgeTree === 'object' && 'children' in knowledgeTree && Array.isArray(knowledgeTree.children) ? knowledgeTree.children : []),
    ],
  };

  // Shared layout configurations
  const showLocaleSwitch = Object.keys(websiteConfig.i18n.locales).length > 1;
  const docsOptions: BaseLayoutProps = {
    i18n: showLocaleSwitch ? docsI18nConfig : undefined,
    githubUrl: websiteConfig.metadata.social?.github ?? undefined,
    nav: {
      enabled: false, // 隐藏导航标题
    },
    links: [
      ...(websiteConfig.metadata.social?.twitter
        ? [
            {
              type: 'icon' as const,
              icon: <XTwitterIcon />,
              text: 'X',
              url: websiteConfig.metadata.social.twitter,
              secondary: true,
            },
          ]
        : []),
    ],
    themeSwitch: {
      enabled: false,
    },
  };

  return (
    <DocsLayout
      tree={mergedTree}
      {...docsOptions}
    >
      <div className="container mx-auto px-4 max-w-[65ch]">
        {children}
      </div>
    </DocsLayout>
  );
}
