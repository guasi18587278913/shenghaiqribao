import { DateView } from '@/components/reports/date-view';
import { TopicView } from '@/components/reports/topic-view';
import { ViewSwitcher } from '@/components/reports/view-switcher';

interface ReportsPageProps {
  searchParams: Promise<{
    view?: 'date' | 'topic';
    category?: string;
    month?: string;
  }>;
}

/**
 * Unified Reports Page - Date View + Topic View
 */
export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  // 🔐 权限检查：验证星球成员身份
  // ⚠️ 临时注释以便预览分类效果 - 生产环境请取消注释
  // const { verified } = await checkPlanetVerification();
  // if (!verified) {
  //   redirect('/verify-planet');
  // }

  const params = await searchParams;
  const viewMode = (params.view as 'date' | 'topic') || 'date';
  const category = params.category || null;
  const monthParam = params.month || undefined;

  // Parse month from query param (format: "2025-11")
  const selectedMonth = monthParam ? new Date(monthParam + '-01') : new Date();

  // Generate available months
  const availableMonths = generateAvailableMonths();

  return (
    <div className="flex min-h-screen">
      {/* Main Content with Integrated Sidebar and View Switcher */}
      <ViewSwitcher
        viewMode={viewMode}
        category={category}
        selectedMonth={selectedMonth}
        availableMonths={availableMonths}
      >
        {/* Render the appropriate view based on mode */}
        {viewMode === 'date' ? (
          <DateView category={category} month={selectedMonth} />
        ) : (
          <TopicView category={category} />
        )}
      </ViewSwitcher>
    </div>
  );
}

/**
 * Generate available months for the month selector
 */
function generateAvailableMonths() {
  const months = [];
  const now = new Date();

  // Generate last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    months.push({
      value: `${year}-${month.toString().padStart(2, '0')}`,
      label: `${year}年${month}月`,
    });
  }

  return months;
}
