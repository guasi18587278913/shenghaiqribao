import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ReportPreviewClient } from '@/components/reports/report-preview-client';

/**
 * Report Preview Page
 *
 * 日报预览和审核页面
 */
export default function ReportPreviewPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '日报管理', href: '/dashboard/reports' },
    { label: '上传日报', href: '/dashboard/reports/upload' },
    { label: '预览审核', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 md:gap-6 md:py-6">
            <ReportPreviewClient />
          </div>
        </div>
      </div>
    </>
  );
}
