import { getReportsByMonth } from '@/actions/unified-reports';
import { DailyReportCard } from '@/components/daily-report/daily-report-card';
import { getCategoryName } from '@/lib/category-helpers';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface DateViewProps {
  category: string | null;
  month: Date;
}

export async function DateView({ category, month }: DateViewProps) {
  const year = month.getFullYear();
  const monthNum = month.getMonth() + 1;

  // Get reports for this month, optionally filtered by category
  const reports = await getReportsByMonth(year, monthNum, category);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {format(month, 'yyyy年MM月', { locale: zhCN })} 日报
        </h2>
        {category && (
          <p className="text-muted-foreground">
            筛选：
            <span className="font-medium text-foreground">
              {getCategoryName(category)}
            </span>{' '}
            相关内容
          </p>
        )}
        <div className="mt-2 text-sm text-muted-foreground">
          共 {reports.length} 篇日报
        </div>
      </div>

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <DailyReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">暂无日报</h3>
          <p className="text-muted-foreground">
            {category
              ? `该月暂无"${getCategoryName(category)}"相关日报`
              : '该月暂无日报内容'}
          </p>
        </div>
      )}
    </div>
  );
}
