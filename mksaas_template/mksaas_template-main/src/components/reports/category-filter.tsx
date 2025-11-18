'use client';

import { cn } from '@/lib/utils';
import type { TopicCategory } from '@/types/daily-report';
import { useState } from 'react';

interface CategoryFilterProps {
  categories: TopicCategory[];
  onFilterChange?: (category: TopicCategory | null) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  onFilterChange,
  className,
}: CategoryFilterProps) {
  const [selected, setSelected] = useState<TopicCategory | null>(null);

  const handleSelect = (category: TopicCategory | null) => {
    setSelected(category);
    onFilterChange?.(category);
  };

  return (
    <div
      className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}
    >
      <button
        onClick={() => handleSelect(null)}
        className={cn(
          'px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors',
          'border border-input',
          selected === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent hover:text-accent-foreground'
        )}
      >
        全部
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleSelect(category)}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors',
            'border border-input',
            selected === category
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
