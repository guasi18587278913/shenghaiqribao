'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface MonthOption {
  value: string;
  label: string;
}

interface MonthSelectorProps {
  availableMonths: MonthOption[];
  defaultMonth?: string;
  defaultValue?: string; // Controlled mode support
  onValueChange?: (value: string) => void; // Controlled mode support
}

export function MonthSelector({
  availableMonths,
  defaultMonth,
  defaultValue,
  onValueChange,
}: MonthSelectorProps) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(
    defaultValue || defaultMonth || availableMonths[0]?.value
  );

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    // If onValueChange is provided (controlled mode), call it
    if (onValueChange) {
      onValueChange(value);
    } else {
      // Legacy behavior: just log
      console.log('Selected month:', value);
    }
  };

  return (
    <Select value={selectedMonth} onValueChange={handleMonthChange}>
      <SelectTrigger className="w-[180px] border-none shadow-none hover:bg-accent/50">
        <Calendar className="mr-2 h-4 w-4" />
        <SelectValue placeholder="选择月份" />
      </SelectTrigger>
      <SelectContent>
        {availableMonths.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
