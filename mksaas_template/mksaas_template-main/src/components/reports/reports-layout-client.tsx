'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';

interface ReportsLayoutClientProps {
  children: ReactNode;
}

export function ReportsLayoutClient({ children }: ReportsLayoutClientProps) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
