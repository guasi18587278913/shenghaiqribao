'use client';

import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { CategoryStat } from '@/types/daily-report';
import { ChevronDown, ChevronUp, Folder } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface CategoryNavProps {
  categories: CategoryStat[];
  currentSlug?: string;
  maxVisible?: number; // Default: 8
}

export function CategoryNav({
  categories,
  currentSlug,
  maxVisible = 8,
}: CategoryNavProps) {
  const [showAll, setShowAll] = useState(false);

  // 按 order 排序（如果有的话），否则保持原顺序
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = (a as any).order ?? 999;
    const orderB = (b as any).order ?? 999;
    return orderA - orderB;
  });

  const visibleCategories = showAll
    ? sortedCategories
    : sortedCategories.slice(0, maxVisible);
  const hasMore = sortedCategories.length > maxVisible;

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
        <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">暂无分类</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          发布日报后自动生成
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {visibleCategories.map((category) => {
        const isActive = category.slug === currentSlug;
        const icon = (category as any).icon || '📁';
        const description = (category as any).description;
        const order = (category as any).order;

        const categoryLink = (
          <Link
            key={category.id}
            href={`/reports/category/${category.slug}`}
            className={cn(
              'flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all group',
              'hover:bg-primary/10 hover:text-primary hover:border-primary/20',
              'border border-transparent',
              isActive &&
                'bg-primary/10 text-primary border-primary/30 font-medium shadow-sm'
            )}
          >
            <div className="flex items-center gap-3 truncate flex-1">
              {/* Icon (Emoji) */}
              <span className="text-lg flex-shrink-0" aria-hidden="true">
                {icon}
              </span>

              {/* Category Name */}
              <span className="truncate flex-1">{category.name}</span>

              {/* Order Number (subtle) */}
              {order && (
                <span className="text-[10px] text-muted-foreground/40 font-mono flex-shrink-0">
                  {String(order).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Count Badge */}
            <Badge
              variant="secondary"
              className="ml-2 flex-shrink-0 bg-muted/50 hover:bg-muted group-hover:bg-primary/20 transition-colors"
            >
              {category.count}
            </Badge>
          </Link>
        );

        // 如果有描述，用 HoverCard 包裹
        if (description) {
          return (
            <HoverCard key={category.id} openDelay={300}>
              <HoverCardTrigger asChild>{categoryLink}</HoverCardTrigger>
              <HoverCardContent side="right" align="start" className="w-64 p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h4 className="text-sm font-semibold">{category.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t">
                    <span className="text-xs text-muted-foreground">
                      共 {category.count} 篇日报
                    </span>
                    {order && (
                      <span className="text-xs text-muted-foreground/60">
                        #{order}
                      </span>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        }

        return categoryLink;
      })}

      {/* Show More/Less Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={cn(
            'w-full flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
          )}
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              收起
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              更多分类 ({sortedCategories.length - maxVisible})
            </>
          )}
        </button>
      )}
    </div>
  );
}
