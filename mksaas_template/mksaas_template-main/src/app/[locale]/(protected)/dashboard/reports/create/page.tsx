import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Create Daily Report Page
 *
 * Manual report creation interface
 */
export default function CreateReportPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '日报管理', href: '/dashboard/reports' },
    { label: '创建日报', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 md:gap-6 md:py-6">
            <div className="mx-auto w-full max-w-4xl">
              <div className="rounded-lg border bg-card p-6">
                <h1 className="mb-6 text-2xl font-bold">创建新日报</h1>

                <form className="space-y-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">日期 *</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">标题 *</Label>
                    <Input
                      id="title"
                      placeholder="例如：2025-01-06 AI出海社群日报"
                      required
                    />
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <Label htmlFor="summary">日报摘要</Label>
                    <Textarea
                      id="summary"
                      placeholder="简要描述本日报的主要内容..."
                      rows={3}
                    />
                  </div>

                  {/* Topics Section */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">话题列表</h3>

                    {/* Topic 1 */}
                    <div className="space-y-3 rounded-lg bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">话题 1</span>
                        <Button variant="ghost" size="sm" type="button">
                          删除
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>话题标题 *</Label>
                        <Input placeholder="话题标题" required />
                      </div>

                      <div className="space-y-2">
                        <Label>分类 *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overseas-experience">
                              出海经验
                            </SelectItem>
                            <SelectItem value="qa-selection">
                              问答精选
                            </SelectItem>
                            <SelectItem value="industry-trends">
                              行业动态
                            </SelectItem>
                            <SelectItem value="network-proxy">
                              网络代理
                            </SelectItem>
                            <SelectItem value="tech-tools">
                              技术工具
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>摘要 *</Label>
                        <Textarea
                          placeholder="话题摘要（从群聊精华中提取）"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>详细内容（可选，支持 Markdown）</Label>
                        <Textarea
                          placeholder="可以添加更详细的内容、代码示例等..."
                          rows={6}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>重要性（1-5）</Label>
                          <Select defaultValue="3">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - 一般</SelectItem>
                              <SelectItem value="2">2 - 较低</SelectItem>
                              <SelectItem value="3">3 - 普通</SelectItem>
                              <SelectItem value="4">4 - 重要</SelectItem>
                              <SelectItem value="5">5 - 非常重要</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>标签（逗号分隔）</Label>
                          <Input placeholder="AI编程, 产品出海" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>编辑点评</Label>
                        <Textarea
                          placeholder="可选：添加你的点评或补充说明..."
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Add Topic Button */}
                    <Button type="button" variant="outline" className="w-full">
                      + 添加话题
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      发布日报
                    </Button>
                    <Button type="button" variant="outline" className="flex-1">
                      保存草稿
                    </Button>
                  </div>
                </form>

                {/* Usage Tips */}
                <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
                  <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                    💡 使用提示
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>从群聊精华中提取有价值的讨论，整理成话题</li>
                    <li>每个话题要有清晰的标题和摘要</li>
                    <li>选择合适的分类，方便用户查找</li>
                    <li>重要的内容可以设置更高的重要性</li>
                    <li>保存草稿后可以随时编辑，发布后用户即可看到</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
