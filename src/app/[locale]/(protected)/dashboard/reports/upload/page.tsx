import { MessageUploadForm } from '@/components/daily-report/message-upload-form';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

/**
 * Message Upload Page
 */
export default function MessageUploadPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '日报管理', href: '/dashboard/reports' },
    { label: '上传消息', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 md:gap-6 md:py-6">
            <div className="mx-auto w-full max-w-3xl">
              <div className="rounded-lg border bg-card p-6">
                <h1 className="mb-6 text-2xl font-bold">上传微信群聊记录</h1>

                <div className="mb-6 rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-semibold">使用说明</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>支持导出的 .txt 或 .html 格式的微信聊天记录</li>
                    <li>建议每天晚上10点导出当天的聊天记录</li>
                    <li>一次可以上传多个群的记录</li>
                    <li>系统会自动去重，避免重复导入</li>
                  </ul>
                </div>

                <MessageUploadForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
