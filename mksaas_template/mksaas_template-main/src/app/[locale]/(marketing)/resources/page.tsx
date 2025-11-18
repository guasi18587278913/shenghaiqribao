import { UsersIcon } from 'lucide-react';

/**
 * Resources Page
 * 圈友资源页面 - 占位页面
 */
export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UsersIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">圈友资源</h1>
          <p className="text-lg text-muted-foreground">
            汇聚社群精英力量，实现资源高效对接
          </p>
        </div>

        {/* Coming Soon */}
        <div className="rounded-lg border bg-card p-12 text-center">
          <h2 className="mb-4 text-2xl font-semibold">功能开发中</h2>
          <p className="text-muted-foreground mb-4">
            圈友资源对接平台即将上线！
          </p>
          <div className="text-sm text-muted-foreground/80">
            <p>即将支持：</p>
            <ul className="mt-2 space-y-1">
              <li>💻 技术开发类资源</li>
              <li>📊 产品运营类资源</li>
              <li>🎨 设计创意类资源</li>
              <li>🏢 行业专家对接</li>
              <li>🌟 特殊资源共享</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
