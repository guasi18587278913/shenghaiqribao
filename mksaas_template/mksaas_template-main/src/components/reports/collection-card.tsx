import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BookOpen, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

interface CollectionCardProps {
  collection: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    icon: string;
    topicCount: number;
    views: number;
    isFeatured: boolean;
    periodStart: Date | null;
    periodEnd: Date | null;
  };
  featured?: boolean;
}

export function CollectionCard({
  collection,
  featured = false,
}: CollectionCardProps) {
  return (
    <Link href={`/knowledge/${collection.slug}`} className="group block h-full">
      <Card
        className={cn(
          'h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
          featured && 'border-2 border-amber-500'
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-3">
            <div className="text-5xl">{collection.icon}</div>
            {featured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                精选
              </Badge>
            )}
            {collection.isFeatured && !featured && (
              <Badge variant="secondary">推荐</Badge>
            )}
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {collection.title}
          </CardTitle>
          {collection.description && (
            <CardDescription className="line-clamp-2">
              {collection.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{collection.topicCount} 个话题</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{collection.views} 次阅读</span>
            </div>
          </div>
          {collection.periodStart && collection.periodEnd && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(collection.periodStart), 'yyyy.MM.dd', {
                  locale: zhCN,
                })}{' '}
                -{' '}
                {format(new Date(collection.periodEnd), 'yyyy.MM.dd', {
                  locale: zhCN,
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
