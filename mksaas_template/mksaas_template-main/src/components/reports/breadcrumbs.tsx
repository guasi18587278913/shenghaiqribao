import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link
            href={item.href}
            className={`hover:text-foreground transition-colors ${
              index === items.length - 1 ? 'font-medium text-foreground' : ''
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
