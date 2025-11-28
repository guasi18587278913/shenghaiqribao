'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { parseReportMarkdown } from '@/lib/report-parser';
import { Eye, Loader2, Upload } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Report Upload Form Component
 *
 * 日报上传表单组件
 */
export function ReportUploadForm() {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  // 表单数据
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState(`${date} AI产品出海日报`);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [markdown, setMarkdown] = useState('');

  // 自动更新标题
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setTitle(`${newDate} AI产品出海日报`);
  };

  // 预览和解析
  const handlePreview = () => {
    if (!markdown.trim()) {
      toast.error('请输入日报内容');
      return;
    }

    // 解析 Markdown
    const topics = parseReportMarkdown(markdown);

    if (topics.length === 0) {
      toast.error('未能解析出任何话题，请检查格式');
      return;
    }

    // 保存到 sessionStorage 供预览页使用
    sessionStorage.setItem(
      'report-preview',
      JSON.stringify({
        metadata: {
          date,
          title,
          description,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        },
        markdown,
        topics,
      })
    );

    // 跳转到预览页
    router.push(`/${locale}/dashboard/reports/upload/preview`);
  };

  return (
    <div className="rounded-lg border bg-card p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">上传新日报</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          粘贴整理好的 Markdown 日报，系统将自动解析话题和分类
        </p>
      </div>

      <div className="space-y-6">
        {/* 日期 */}
        <div className="space-y-2">
          <Label htmlFor="date">日期 *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            required
          />
        </div>

        {/* 标题 */}
        <div className="space-y-2">
          <Label htmlFor="title">标题 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：2024-11-10 AI产品出海日报"
            required
          />
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label htmlFor="description">日报摘要</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简要描述本日报的主要内容..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            可选，会显示在日报列表中
          </p>
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <Label htmlFor="tags">标签</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Cursor, Claude, 支付"
          />
          <p className="text-xs text-muted-foreground">多个标签用逗号分隔</p>
        </div>

        {/* Markdown 内容 */}
        <div className="space-y-2">
          <Label htmlFor="markdown">日报内容（Markdown 格式）*</Label>
          <Textarea
            id="markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={`# 2024-11-10 AI产品出海日报

今天讨论了多个有价值的话题...

## 开发工具 | Cursor 新功能体验

【话题摘要】
多位用户分享了 Cursor 的最新功能...

【详细内容】
- 用户A: 新版本的代码补全更智能了
- 用户B: 支持多模型切换很方便
...

---

## 账号设备 | Claude 注册避坑指南

【话题摘要】
...`}
            rows={20}
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            支持格式：
            <code className="mx-1 rounded bg-muted px-1 py-0.5">
              ## 分类 | 话题标题
            </code>
            或
            <code className="mx-1 rounded bg-muted px-1 py-0.5">
              ## 【分类】话题标题
            </code>
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handlePreview}
            disabled={isLoading || !markdown.trim()}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                解析并预览
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
          💡 使用提示
        </h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>
            使用 <code>##</code> 标记每个话题的标题
          </li>
          <li>
            在标题中用 <code>|</code> 或 <code>【】</code> 标记分类
          </li>
          <li>系统会自动识别分类并推荐归档位置</li>
          <li>预览页面可以人工调整每个话题的分类和设置</li>
          <li>确认无误后再发布到网站</li>
        </ul>
      </div>
    </div>
  );
}
