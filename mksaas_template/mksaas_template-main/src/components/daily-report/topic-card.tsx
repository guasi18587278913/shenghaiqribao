'use client';

import { Button } from '@/components/ui/button';
import type { DailyTopic } from '@/types/daily-report';
import { ChevronDown, ChevronUp, FileText, Flame, Tag } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TopicCardProps {
  topic: DailyTopic;
  index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  技术教程: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  产品案例: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  出海经验:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  工具推荐:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  行业动态: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  问答精选:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  // 新增的10个分类
  账号与设备: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
  网络与代理: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
  支付与订阅:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  开发工具: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  项目执行:
    'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100',
  产品与增长:
    'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-100',
  社群与学习: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
  学习认知与避坑:
    'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
  成本规划:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  设备与环境:
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
};

export function TopicCard({ topic, index }: TopicCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const importanceStars = '🔥'.repeat(Math.min(topic.importance, 5));

  return (
    <div className="rounded-lg border bg-card p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index}
            </span>
            <h3 className="text-xl font-bold">{topic.title}</h3>
            {topic.importance >= 4 && (
              <span className="text-lg" title={`重要度: ${topic.importance}/5`}>
                {importanceStars}
              </span>
            )}
          </div>

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                CATEGORY_COLORS[topic.category] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {topic.category}
            </span>

            {topic.tags && topic.tags.length > 0 && (
              <>
                {topic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <p className="leading-relaxed text-muted-foreground">{topic.summary}</p>
      </div>

      {/* Editor Note */}
      {topic.editorNote && (
        <div className="mb-4 rounded-lg border-l-4 border-primary bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground">
            💡 编辑点评: {topic.editorNote}
          </p>
        </div>
      )}

      {/* Source Group */}
      {topic.sourceGroup && (
        <div className="mb-4 text-sm text-muted-foreground">
          来源: {topic.sourceGroup}
        </div>
      )}

      {/* Full Content (expandable) - for imported knowledge base articles */}
      {topic.content && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullContent(!showFullContent)}
            className="gap-2"
          >
            {showFullContent ? (
              <>
                <ChevronUp className="h-4 w-4" />
                收起完整内容
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                查看完整内容
              </>
            )}
          </Button>

          {showFullContent && (
            <div className="mt-4 rounded-lg border bg-muted/30 p-6">
              <div className="prose prose-sm dark:prose-invert prose-premium max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {topic.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Original Messages (expandable) */}
      {topic.sourceMessages && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                隐藏原始讨论
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                查看原始讨论
              </>
            )}
          </Button>

          {isExpanded && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm">
                {topic.sourceMessages}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
