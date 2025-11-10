'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  STATIC_CATEGORIES,
  type KnowledgeCategory,
} from '@/config/knowledge-categories';
import type { ParsedTopic } from '@/lib/report-parser';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PreviewData {
  metadata: {
    date: string;
    title: string;
    description: string;
    tags: string[];
  };
  markdown: string;
  topics: ParsedTopic[];
}

interface ApprovedTopic extends ParsedTopic {
  addToKnowledge: boolean;  // 是否加入知识库
  selectedSlug: string;       // 用户选择的分类slug
  selectedName: string;       // 用户选择的分类名称
  isExpanded: boolean;        // 是否展开详情
}

/**
 * Report Preview Client Component
 *
 * 日报预览和审核客户端组件
 */
export function ReportPreviewClient() {
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [approvedTopics, setApprovedTopics] = useState<ApprovedTopic[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 从 sessionStorage 加载数据
  useEffect(() => {
    const data = sessionStorage.getItem('report-preview');
    if (!data) {
      toast.error('没有找到预览数据');
      router.push('/dashboard/reports/upload');
      return;
    }

    try {
      const parsed = JSON.parse(data) as PreviewData;
      setPreviewData(parsed);

      // 初始化审核数据
      const approved: ApprovedTopic[] = parsed.topics.map((topic) => ({
        ...topic,
        addToKnowledge: topic.confidence > 0.5, // 置信度高的默认勾选
        selectedSlug: topic.suggestedSlug || '',
        selectedName: topic.suggestedName || '',
        isExpanded: false,
      }));

      setApprovedTopics(approved);
    } catch (error) {
      console.error('Failed to parse preview data:', error);
      toast.error('数据解析失败');
      router.push('/dashboard/reports/upload');
    }
  }, [router]);

  // 更新话题
  const updateTopic = (
    index: number,
    updates: Partial<ApprovedTopic>
  ) => {
    setApprovedTopics((prev) => {
      const newTopics = [...prev];
      newTopics[index] = { ...newTopics[index], ...updates };
      return newTopics;
    });
  };

  // 切换分类
  const handleCategoryChange = (index: number, slug: string) => {
    const category = STATIC_CATEGORIES.find((c) => c.slug === slug);
    if (category) {
      updateTopic(index, {
        selectedSlug: slug,
        selectedName: category.name,
      });
    }
  };

  // 提交生成
  const handleSubmit = async () => {
    if (!previewData) return;

    // 验证：至少有一个话题
    if (approvedTopics.length === 0) {
      toast.error('至少需要一个话题');
      return;
    }

    // 验证：加入知识库的话题必须选择分类
    const invalidTopics = approvedTopics.filter(
      (t) => t.addToKnowledge && !t.selectedSlug
    );
    if (invalidTopics.length > 0) {
      toast.error('加入知识库的话题必须选择分类');
      return;
    }

    setIsSubmitting(true);

    try {
      // 调用 Server Action 生成文件
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: previewData.metadata,
          markdown: previewData.markdown,
          approvedTopics: approvedTopics.map((t) => ({
            title: t.title,
            content: t.content,
            addToKnowledge: t.addToKnowledge,
            categorySlug: t.selectedSlug,
            categoryName: t.selectedName,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('日报生成成功！');
        sessionStorage.removeItem('report-preview');
        router.push('/dashboard/reports');
      } else {
        toast.error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('生成失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!previewData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const selectedCount = approvedTopics.filter((t) => t.addToKnowledge).length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* 日报元数据 */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-bold">📄 日报信息</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">日期</p>
            <p className="font-medium">{previewData.metadata.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">标题</p>
            <p className="font-medium">{previewData.metadata.title}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">描述</p>
            <p className="font-medium">
              {previewData.metadata.description || '（无）'}
            </p>
          </div>
          {previewData.metadata.tags.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">标签</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {previewData.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 话题列表 */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            📝 解析出的话题（共 {approvedTopics.length} 个）
          </h2>
          <p className="text-sm text-muted-foreground">
            已选择加入知识库：{selectedCount} 个
          </p>
        </div>

        <div className="space-y-4">
          {approvedTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="rounded-lg border bg-muted/30 p-4"
            >
              {/* 话题头部 */}
              <div className="flex items-start gap-4">
                <Checkbox
                  id={`topic-${index}`}
                  checked={topic.addToKnowledge}
                  onCheckedChange={(checked) =>
                    updateTopic(index, {
                      addToKnowledge: checked as boolean,
                    })
                  }
                  className="mt-1"
                />

                <div className="flex-1 space-y-3">
                  {/* 标题 */}
                  <div>
                    <Label htmlFor={`topic-${index}`} className="text-base font-semibold">
                      {topic.title}
                    </Label>
                  </div>

                  {/* AI推荐 */}
                  {topic.suggestedName && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        AI推荐分类：
                      </span>
                      <span className="font-medium">{topic.suggestedName}</span>
                      {topic.confidence > 0.7 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : topic.confidence > 0.4 ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        置信度：{Math.round(topic.confidence * 100)}%
                      </span>
                    </div>
                  )}

                  {/* 分类选择 */}
                  <div className="flex items-center gap-4">
                    <Label className="text-sm text-muted-foreground">
                      归档分类：
                    </Label>
                    <Select
                      value={topic.selectedSlug}
                      onValueChange={(value) =>
                        handleCategoryChange(index, value)
                      }
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATIC_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.slug} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 加入知识库勾选 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      加入知识库：
                    </span>
                    <span className="text-sm font-medium">
                      {topic.addToKnowledge ? '✅ 是' : '❌ 否'}
                    </span>
                  </div>

                  {/* 展开/收起按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateTopic(index, { isExpanded: !topic.isExpanded })
                    }
                  >
                    {topic.isExpanded ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        收起内容
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        展开内容
                      </>
                    )}
                  </Button>

                  {/* 内容预览 */}
                  {topic.isExpanded && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-4">
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        内容预览：
                      </p>
                      <div className="max-h-60 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm">
                          {topic.content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 生成预览 */}
      <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-6">
        <h3 className="mb-4 font-semibold text-green-900 dark:text-green-100">
          📊 将生成以下文件
        </h3>
        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
          <li>
            ✅ content/reports/{previewData.metadata.date}.mdx
          </li>
          {approvedTopics
            .filter((t) => t.addToKnowledge)
            .map((topic, index) => (
              <li key={index}>
                ✅ content/knowledge/{topic.selectedSlug}/{previewData.metadata.date}-
                {topic.title.slice(0, 20)}.zh.mdx
              </li>
            ))}
        </ul>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回编辑
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              确认生成并发布
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
