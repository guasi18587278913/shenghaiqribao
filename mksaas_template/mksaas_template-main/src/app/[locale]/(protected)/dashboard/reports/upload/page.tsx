import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ReportUploadForm } from '@/components/reports/report-upload-form';

/**
 * Upload Daily Report Page
 *
 * 上传日报页面 - 支持 Markdown 编辑和解析
 */
export default function UploadReportPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '日报管理', href: '/dashboard/reports' },
    { label: '上传日报', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 md:gap-6 md:py-6">
            <div className="mx-auto w-full max-w-5xl">
              <ReportUploadForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
