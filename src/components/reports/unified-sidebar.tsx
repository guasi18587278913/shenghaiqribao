'use client';

import { getCategoryStats } from '@/actions/unified-reports';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CategoryStat {
  name: string;
  slug: string;
  icon: string;
  count: number;
}

interface UnifiedSidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function UnifiedSidebar({
  selectedCategory,
  onSelectCategory,
}: UnifiedSidebarProps) {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoryStats().then((stats) => {
      setCategories(stats);
      setLoading(false);
    });
  }, []);

  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <aside className="w-80 border-r bg-card overflow-y-auto sticky top-0 h-screen">
      <div className="p-6">
        {/* Logo / Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="text-3xl">📚</div>
            <div>
              <div className="font-bold text-lg">AI产品出海日报</div>
              <div className="text-xs text-muted-foreground">社群精华内容</div>
            </div>
          </Link>
        </div>

        {/* All Content */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg mb-4 transition-colors',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="font-medium">全部内容</span>
          </div>
          <Badge variant={selectedCategory === null ? 'secondary' : 'outline'}>
            {totalCount}
          </Badge>
        </button>

        {/* Category List */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground px-3 py-2">
            主题分类
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              加载中...
            </div>
          ) : (
            categories.map((category) => (
              <button
                type="button"
                key={category.slug}
                onClick={() => onSelectCategory(category.slug)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                  selectedCategory === category.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <Badge
                  variant={
                    selectedCategory === category.slug ? 'secondary' : 'outline'
                  }
                >
                  {category.count}
                </Badge>
              </button>
            ))
          )}
        </div>

        {/* Featured / Special Sections */}
        <div className="mt-8 pt-8 border-t space-y-2">
          <Link href="/reports?featured=newcomer" className="block">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⭐</span>
                <span className="font-bold text-sm">新人必看</span>
              </div>
              <div className="text-xs text-muted-foreground">
                精选新人常见问题合集
              </div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
