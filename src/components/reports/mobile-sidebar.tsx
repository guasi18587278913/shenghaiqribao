'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { CategoryStat } from '@/types/daily-report';
import { Folder, Home, Menu, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface MobileSidebarProps {
  categories: CategoryStat[];
  currentCategorySlug?: string;
}

export function MobileSidebar({
  categories,
  currentCategorySlug,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 按 order 排序
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = (a as any).order ?? 999;
    const orderB = (b as any).order ?? 999;
    return orderA - orderB;
  });

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">打开菜单</span>
      </Button>

      {/* Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          {/* Content */}
          <div className="overflow-y-auto h-full px-3 pt-6">
            {/* Home Link */}
            <SidebarGroup className="mb-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="h-10 px-3 hover:bg-accent/50"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/reports">
                      <Home className="h-4 w-4" />
                      <span className="flex-1 text-sm font-medium">
                        所有日报
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Knowledge Essentials Section */}
            <SidebarGroup className="mb-4">
              <SidebarGroupLabel className="px-3 py-2 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                精华合集
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'h-9 px-3 hover:bg-amber-50 dark:hover:bg-amber-950/20',
                      'transition-all duration-200'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/reports/special-knowledge-essentials-2024-10">
                      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="flex-1 text-sm font-medium text-amber-900 dark:text-amber-100">
                        新人营精华
                      </span>
                      <span className="text-xs font-normal tabular-nums text-amber-600 dark:text-amber-400">
                        63
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

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
                        onClick={() => setIsOpen(false)}
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
