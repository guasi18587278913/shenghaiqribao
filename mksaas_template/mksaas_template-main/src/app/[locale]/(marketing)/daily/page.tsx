import { getPublishedReports } from '@/actions/daily-report';
import { ReportsPageClient } from '@/components/reports/reports-page-client';
import { getKnowledgeCategories } from '@/lib/knowledge-categories';
import { constructMetadata } from '@/lib/metadata';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('reports'),
    description: '每日社群精华内容整理',
    locale,
    pathname: '/daily',
  });
}

export const revalidate = 3600; // Revalidate every hour

interface DailyPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

/**
 * Daily Reports List Page
 *
 * Displays all published daily reports from the database
 */
export default async function DailyPage({ params }: DailyPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ReportsPage' });

  // Fetch published reports from database
  const { reports } = await getPublishedReports(1, 100);

  // Fetch knowledge categories
  const knowledgeCategories = await getKnowledgeCategories();

  return (
    <ReportsPageClient
      locale={locale}
      reports={reports}
      knowledgeCategories={knowledgeCategories}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}
