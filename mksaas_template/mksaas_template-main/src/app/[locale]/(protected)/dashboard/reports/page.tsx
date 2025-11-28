import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { reportsSource } from '@/lib/source';
import { Routes } from '@/routes';
import { FileText, Plus, Upload } from 'lucide-react';
import Link from 'next/link';

/**
 * Daily Reports Management Page
 */
export default async function DailyReportsPage() {
  // Get all reports from MDX source
  const allReports = reportsSource.getPages();
  const publishedReports = allReports.filter(
    (report) => report.url !== '/reports'
  );
  const totalCount = publishedReports.length;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '日报管理', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Link href={Routes.ReportsUpload}>
              <Button size="sm">
                <Upload className="mr-2 h-4 w-4" />
                上传日报
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 md:gap-6 md:py-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      总日报数
                    </p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      最新日报
                    </p>
                    <p className="text-lg font-medium">
                      {publishedReports[0]?.data?.title || '暂无'}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <h2 className="text-lg font-semibold">所有日报</h2>
              </div>
              <div className="divide-y">
                {publishedReports.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p className="mb-2 text-lg font-medium">暂无日报</p>
                    <p className="text-sm">
                      点击右上角"上传日报"按钮开始创建你的第一篇日报
                    </p>
                  </div>
                ) : (
                  publishedReports.map((report) => (
                    <Link
                      key={report.url}
                      href={report.url}
                      className="block p-6 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold text-lg">
                            {report.data?.title || '无标题'}
                          </h3>
                          {report.data?.description && (
                            <p className="mb-2 text-sm text-muted-foreground">
                              {report.data.description}
                            </p>
                          )}
                          {report.data?.tags && report.data.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {report.data.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 text-sm text-muted-foreground">
                          {report.data?.date || ''}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
