'use client';

import { getCategoryStats } from '@/actions/unified-reports';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Briefcase,
  FileText,
  Globe,
  Home,
  Lightbulb,
  Network,
  Star,
  TrendingUp,
} from 'lucide-react';
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

// Map category names to Lucide icons
const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  出海经验: Globe,
  问答精选: Lightbulb,
  行业动态: TrendingUp,
  网络与代理: Network,
  技术工具: Briefcase,
  default: FileText,
};

function getCategoryIcon(categoryName: string) {
  return CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
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
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm overflow-y-auto sticky top-0 h-screen">
      <div className="p-4 flex flex-col h-full">
        {/* Logo / Header */}
        <div className="mb-6 pb-4 border-b">
          <Link
            href="/"
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
              'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all',
              'hover:bg-accent/50',
              selectedCategory === null
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>全部内容</span>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                selectedCategory === null && 'bg-background/80'
              )}
            >
              {totalCount}
            </Badge>
          </button>

          {/* Category List */}
          <div className="pt-4">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              主题分类
            </div>

            <div className="space-y-0.5 mt-1">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  加载中...
                </div>
              ) : (
                categories.map((category) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <button
                      type="button"
                      key={category.slug}
                      onClick={() => onSelectCategory(category.slug)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all',
                        'hover:bg-accent/50',
                        selectedCategory === category.slug
                          ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{category.name}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs ml-2',
                          selectedCategory === category.slug &&
                            'bg-background/80'
                        )}
                      >
                        {category.count}
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </nav>

        {/* Featured / Special Sections */}
        <div className="mt-auto pt-4 border-t">
          <Link href="/reports?featured=newcomer" className="block group">
            <div className="p-3 rounded-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-sm hover:shadow">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-xs text-amber-900 dark:text-amber-100">
                  新人必看
                </span>
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                精选新人常见问题合集
              </div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
