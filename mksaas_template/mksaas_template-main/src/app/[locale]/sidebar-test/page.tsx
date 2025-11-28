import { SidebarTestClient } from '@/components/test/sidebar-test-client';
import { getKnowledgeCategories } from '@/lib/knowledge-categories';
import type { Locale } from 'next-intl';

interface SidebarTestPageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * Sidebar Design Testing Page
 *
 * 用于测试和对比不同的侧边栏设计方案
 */
export default async function SidebarTestPage({
  params,
}: SidebarTestPageProps) {
  const { locale } = await params;

  // Get knowledge base categories
  const knowledgeCategories = await getKnowledgeCategories();

  return (
    <SidebarTestClient
      locale={locale}
      knowledgeCategories={knowledgeCategories}
    />
  );
}
