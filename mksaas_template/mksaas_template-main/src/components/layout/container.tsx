import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export default function Container({
  className,
  children,
}: {
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  // add mx-auto to make it center
  return (
    <div
      className={cn('container', 'mx-auto w-full max-w-[1440px]', className)}
    >
      {children}
    </div>
  );
}
