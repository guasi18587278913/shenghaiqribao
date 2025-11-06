'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { BookOpen, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { MonthSelector } from './month-selector';
import { UnifiedSidebar } from './unified-sidebar';

interface AvailableMonth {
  value: string;
  label: string;
}

interface ViewSwitcherProps {
  viewMode: 'date' | 'topic';
  category: string | null;
  selectedMonth: Date;
  availableMonths: AvailableMonth[];
  children: ReactNode;
}

export function ViewSwitcher({
  viewMode,
  category,
  selectedMonth,
  availableMonths,
  children,
}: ViewSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewChange = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    router.push(`/reports?${params.toString()}`);
  };

  const handleCategoryChange = (newCategory: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }
    router.push(`/reports?${params.toString()}`);
  };

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', value);
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <>
      {/* Left Sidebar */}
      <UnifiedSidebar
        selectedCategory={category}
        onSelectCategory={handleCategoryChange}
      />

      {/* Right Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b">
              {/* View Mode Switcher */}
              <Tabs
                value={viewMode}
                onValueChange={handleViewChange}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                  <TabsTrigger value="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>按日期浏览</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="topic"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>按主题浏览</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Month Selector (only in date view) */}
              {viewMode === 'date' && (
                <div className="w-full sm:w-auto">
                  <MonthSelector
                    availableMonths={availableMonths}
                    defaultValue={format(selectedMonth, 'yyyy-MM')}
                    onValueChange={handleMonthChange}
                  />
                </div>
              )}
            </div>

            {/* Dynamic Content */}
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
