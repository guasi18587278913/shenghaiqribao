'use client';

import { cn } from '@/lib/utils';
import { Archive, Folder, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomTabNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: '最新',
      icon: Home,
      href: '/reports',
      active:
        pathname === '/reports' ||
        (pathname.startsWith('/reports/') && !pathname.includes('/category')),
    },
    {
      name: '归档',
      icon: Archive,
      href: '/reports',
      active: false, // Can be expanded to /reports/archive if created
    },
    {
      name: '分类',
      icon: Folder,
      href: '/reports',
      active: pathname.includes('/category'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1',
                'transition-colors',
                tab.active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
