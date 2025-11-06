'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { CategoryStat } from '@/types/daily-report';
import { Folder, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ReportsSidebarProps {
  categories: CategoryStat[];
  currentCategorySlug?: string;
  className?: string;
}

export function ReportsSidebar({
  categories,
  currentCategorySlug,
  className,
}: ReportsSidebarProps) {
  // 按 order 排序
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = (a as any).order ?? 999;
    const orderB = (b as any).order ?? 999;
    return orderA - orderB;
  });

  return (
    <Sidebar
      collapsible="offcanvas"
      className={cn('hidden md:flex', className)}
    >
      <SidebarContent className="px-3 pt-6">
        {/* Categories */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
            话题分类
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-0.5">
            {sortedCategories.map((category) => {
              const isActive = category.slug === currentCategorySlug;

              return (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      'group h-9 px-3 hover:bg-accent/50 data-[active=true]:bg-accent',
                      'transition-all duration-200'
                    )}
                    tooltip={(category as any).description || category.name}
                  >
                    <Link href={`/reports/category/${category.slug}`}>
                      <Folder className="h-4 w-4 opacity-60" />
                      {/* Category Name */}
                      <span className="flex-1 truncate text-sm font-medium">
                        {category.name}
                      </span>

                      {/* Count Badge - Ultra Minimalist */}
                      <span
                        className={cn(
                          'ml-auto shrink-0 text-xs font-normal tabular-nums',
                          'text-muted-foreground/60',
                          'group-data-[active=true]:text-foreground/80'
                        )}
                      >
                        {category.count}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// 为了向后兼容，导出为Sidebar
export { ReportsSidebar as Sidebar };
