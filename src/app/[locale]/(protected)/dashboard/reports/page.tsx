import { getPublishedReports } from '@/actions/daily-report';
import { ReportList } from '@/components/daily-report/report-list';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Clock, Eye, FileText, Plus } from 'lucide-react';
import Link from 'next/link';

/**
 * Daily Reports Management Page
 */
export default async function DailyReportsPage() {
  const { reports, totalCount } = await getPublishedReports(1, 20);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '日报管理', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs}>
        <div className="flex gap-2">
          <Link href="/dashboard/reports/create">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              创建日报
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 md:gap-6 md:py-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
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
                      待处理消息
                    </p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      总浏览量
                    </p>
                    <p className="text-2xl font-bold">
                      {reports.reduce((sum, r) => sum + r.views, 0)}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <h2 className="text-lg font-semibold">所有日报</h2>
              </div>
              <ReportList reports={reports} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
