'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { KnowledgeCategory } from '@/lib/knowledge-categories';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { BookOpen, ChevronDown, ChevronRight, Home, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

/**
 * Sidebar Variant D: Auto Collapse (Recommended)
 *
 * 方案D - 推荐方案 (自动收起)
 * 特点:
 * - 默认全部收起
 * - 点击某个分类时,展开该分类并自动收起其他已展开的分类
 * - 每个分类最多显示8篇文章,超过显示 "查看更多..."
 * - 文字 text-sm,层级清晰
 * - 同时最多只有一个分类展开,节省空间
 */

interface SidebarDAutoCollapseProps {
  knowledgeCategories: KnowledgeCategory[];
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  className?: string;
}

const ARTICLES_LIMIT = 8;

export function SidebarDAutoCollapse({
  knowledgeCategories,
  selectedCategory = null,
  onSelectCategory = () => {},
  className,
}: SidebarDAutoCollapseProps) {
  // 只记录当前展开的分类(同时最多一个)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleToggleCategory = (slug: string) => {
    // 如果点击的是已展开的分类,则收起
    // 否则,展开该分类并收起其他
    if (expandedCategory === slug) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(slug);
    }
  };

  return (
    <aside
      className={cn(
        'w-64 border-r bg-card/50 backdrop-blur-sm overflow-y-auto sticky top-0 h-screen',
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Logo / Header */}
        <div className="mb-6 pb-4 border-b">
          <Link
            href="/reports"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold text-sm">AI产品出海日报</div>
              <div className="text-xs text-muted-foreground">社群精华内容</div>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1">
          {/* All Content */}
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
              selectedCategory === null
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/50'
            )}
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            <span>全部内容</span>
          </button>

          {/* Category Section Label */}
          <div className="pt-4 pb-2 px-2">
            <div className="text-xs font-semibold text-muted-foreground">
              分类
            </div>
          </div>

          {/* Category List - Auto Collapse */}
          <div className="space-y-0">
            {knowledgeCategories.map((category) => {
              const Icon =
                (LucideIcons as Record<string, any>)[category.icon] ||
                LucideIcons.Folder;
              const isExpanded = expandedCategory === category.slug;
              const isActive = selectedCategory === category.slug;
              const displayArticles = category.articles.slice(
                0,
                ARTICLES_LIMIT
              );
              const hasMore = category.articles.length > ARTICLES_LIMIT;

              return (
                <Collapsible
                  key={category.slug}
                  open={isExpanded}
                  onOpenChange={() => handleToggleCategory(category.slug)}
                >
                  {/* Category Header */}
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-2 rounded text-sm font-semibold transition-colors group',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-accent/50'
                      )}
                      onClick={(e) => {
                        onSelectCategory(category.slug);
                      }}
                    >
                      {/* Expand/Collapse Icon */}
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      )}

                      {/* Category Icon */}
                      <Icon className="h-4 w-4 flex-shrink-0" />

                      {/* Category Title */}
                      <span className="flex-1 text-left truncate">
                        {category.title}
                      </span>

                      {/* Article Count Badge */}
                      <span
                        className={cn(
                          'text-xs rounded px-1.5 py-0.5 font-normal',
                          isActive
                            ? 'bg-accent-foreground/20'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {category.articles.length}
                      </span>
                    </button>
                  </CollapsibleTrigger>

                  {/* Article List - Limited to 8 items */}
                  <CollapsibleContent>
                    <div className="ml-6 space-y-0.5 py-1 pl-2">
                      {displayArticles.length > 0 ? (
                        <>
                          {displayArticles.map((article) => (
                            <div
                              key={article.slug}
                              className={cn(
                                'flex items-start gap-2 px-2 py-1 rounded text-sm font-normal',
                                'text-muted-foreground/80 hover:text-muted-foreground/100',
                                'hover:bg-accent/30 transition-colors cursor-default'
                              )}
                              title={article.title}
                            >
                              <span className="text-muted-foreground/40 mt-0.5 flex-shrink-0">
                                •
                              </span>
                              <span className="truncate leading-relaxed">
                                {article.title}
                              </span>
                            </div>
                          ))}

                          {/* Show More Button */}
                          {hasMore && (
                            <div className="px-2 py-2 rounded text-xs text-primary hover:bg-accent/30 transition-colors cursor-pointer font-medium">
                              查看全部 {category.articles.length} 篇
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground/50 px-2 py-1">
                          暂无文章
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </nav>

        {/* Featured / Special Sections */}
        <div className="mt-auto pt-4 border-t space-y-2">
          {/* Knowledge Base Link */}
          <Link href="/knowledge" className="block group">
            <div className="p-3 rounded-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-sm hover:shadow">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-xs text-amber-900 dark:text-amber-100">
                  知识库精华
                </span>
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                系统化的AI出海经验总结
              </div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
