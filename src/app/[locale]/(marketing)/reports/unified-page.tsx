'use client';

import { DateView } from '@/components/reports/date-view';
import { MonthSelector } from '@/components/reports/month-selector';
import { TopicView } from '@/components/reports/topic-view';
import { UnifiedSidebar } from '@/components/reports/unified-sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BookOpen, Calendar } from 'lucide-react';
import { useState } from 'react';

interface AvailableMonth {
  value: string;
  label: string;
}

interface UnifiedReportsPageProps {
  availableMonths: AvailableMonth[];
}

export function UnifiedReportsPage({
  availableMonths,
}: UnifiedReportsPageProps) {
  const [viewMode, setViewMode] = useState<'date' | 'topic'>('date');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    setSelectedMonth(new Date(year, month - 1, 1));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar: Unified Category Navigation */}
      <UnifiedSidebar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Right Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Control Bar: View Switcher + Month Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            {/* View Mode Switcher */}
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as 'date' | 'topic')}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>按日期浏览</span>
                </TabsTrigger>
                <TabsTrigger value="topic" className="flex items-center gap-2">
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

          {/* Content Area: Dynamic View */}
          {viewMode === 'date' ? (
            <DateView category={selectedCategory} month={selectedMonth} />
          ) : (
            <TopicView category={selectedCategory} />
          )}
        </div>
      </main>
    </div>
  );
}
