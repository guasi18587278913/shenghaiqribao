import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AdjacentNavProps {
  prev?: {
    title: string;
    url: string;
    date: string;
  };
  next?: {
    title: string;
    url: string;
    date: string;
  };
}

export function AdjacentNav({ prev, next }: AdjacentNavProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 mt-12 border-t pt-8">
      {prev ? (
        <Link
          href={prev.url}
          className="group flex flex-col gap-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>上一篇</span>
          </div>
          <div className="font-medium line-clamp-2">
            📅 {new Date(prev.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}: {prev.title}
          </div>
        </Link>
      ) : <div />}

      {next && (
        <Link
          href={next.url}
          className="group flex flex-col gap-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors text-right items-end"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>下一篇</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-medium line-clamp-2">
            📅 {new Date(next.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}: {next.title}
          </div>
        </Link>
      )}
    </div>
  );
}
