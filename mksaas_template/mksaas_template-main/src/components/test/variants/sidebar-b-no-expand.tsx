'use client';

import type { KnowledgeCategory } from '@/lib/knowledge-categories';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { BookOpen, Home, Star } from 'lucide-react';
import Link from 'next/link';

/**
 * Sidebar Variant B: No Expand (Only Categories)
 *
 * 方案B - 只显示分类,无二级
 * 特点:
 * - 完全不显示二级文章列表
 * - 只点击分类进行筛选
 * - 更简洁紧凑
 * - 减少视觉复杂度
 */

interface SidebarBNoExpandProps {
  knowledgeCategories: KnowledgeCategory[];
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  className?: string;
}

export function SidebarBNoExpand({
  knowledgeCategories,
  selectedCategory = null,
  onSelectCategory = () => {},
  className,
}: SidebarBNoExpandProps) {
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

          {/* Category List - No Expand */}
          <div className="space-y-1">
            {knowledgeCategories.map((category) => {
              const Icon =
                (LucideIcons as Record<string, any>)[category.icon] ||
                LucideIcons.Folder;
              const isActive = selectedCategory === category.slug;

              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => onSelectCategory(category.slug)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-2 rounded text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent/50'
                  )}
                >
                  {/* Category Icon */}
                  <Icon className="h-4 w-4 flex-shrink-0" />

                  {/* Category Title */}
                  <span className="flex-1 text-left truncate">
                    {category.title}
                  </span>

                  {/* Article Count Badge */}
                  <span
                    className={cn(
                      'text-xs rounded px-2 py-0.5 font-normal',
                      isActive
                        ? 'bg-accent-foreground/20'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {category.articles.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="pt-4 mt-4 border-t space-y-2">
            <div className="text-xs text-muted-foreground px-2">
              <div className="flex justify-between mb-2">
                <span>总分类数</span>
                <span className="font-semibold text-foreground">
                  {knowledgeCategories.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>总文章数</span>
                <span className="font-semibold text-foreground">
                  {knowledgeCategories.reduce(
                    (sum, cat) => sum + cat.articles.length,
                    0
                  )}
                </span>
              </div>
            </div>
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
