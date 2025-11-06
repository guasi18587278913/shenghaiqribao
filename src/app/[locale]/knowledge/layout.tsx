import { XTwitterIcon } from '@/components/icons/x';
import { Logo } from '@/components/layout/logo';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { websiteConfig } from '@/config/website';
import { docsI18nConfig } from '@/lib/docs/i18n';
import { knowledgeSource } from '@/lib/source';
import { getUrlWithLocale } from '@/lib/urls/urls';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpenIcon, HomeIcon } from 'lucide-react';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import '@/styles/mdx.css';

interface KnowledgeLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

/**
 * Knowledge Base Layout
 *
 * Similar to docs layout but for the knowledge base section
 */
export default async function KnowledgeRootLayout({
  children,
  params,
}: KnowledgeLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'KnowledgePage' });

  // Knowledge base layout configurations
  const showLocaleSwitch = Object.keys(websiteConfig.i18n.locales).length > 1;
  const knowledgeOptions: BaseLayoutProps = {
    i18n: showLocaleSwitch ? docsI18nConfig : undefined,
    githubUrl: websiteConfig.metadata.social?.github ?? undefined,
    nav: {
      url: getUrlWithLocale('/knowledge', locale),
      title: (
        <>
          <Logo className="size-6" />
          {t('title')}
        </>
      ),
    },
    links: [
      {
        text: t('homepage'),
        url: getUrlWithLocale('/', locale),
        icon: <HomeIcon />,
        active: 'none',
        external: false,
      },
      {
        text: t('reports'),
        url: getUrlWithLocale('/reports', locale),
        icon: <BookOpenIcon />,
        active: 'none',
        external: false,
      },
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
      enabled: true,
      mode: 'light-dark-system',
      component: <ModeSwitcher />,
    },
  };

  return (
    <DocsLayout tree={knowledgeSource.pageTree[locale]} {...knowledgeOptions}>
      {children}
    </DocsLayout>
  );
}
