import {
  getCollectionsByCategory,
  getFeaturedCollections,
} from '@/actions/unified-reports';
import { getCategoryName } from '@/lib/category-helpers';
import { CollectionCard } from './collection-card';

interface TopicViewProps {
  category: string | null;
}

export async function TopicView({ category }: TopicViewProps) {
  // Get collections based on category filter
  const collections = category
    ? await getCollectionsByCategory(category)
    : await getFeaturedCollections();

  const categoryName = category ? getCategoryName(category) : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {categoryName || '精选合集'}
        </h2>
        <p className="text-muted-foreground">
          {categoryName
            ? `${categoryName} 相关的系统化学习内容`
            : '从群聊精华中整理的系统化学习资料'}
        </p>
        {collections.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            共 {collections.length} 个知识库合集
          </div>
        )}
      </div>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              featured={!category && collection.isFeatured}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">暂无合集</h3>
          <p className="text-muted-foreground mb-6">
            {categoryName
              ? `"${categoryName}" 分类下暂无知识库合集`
              : '暂无精选知识库合集'}
          </p>
          {category && (
            <p className="text-sm text-muted-foreground">
              提示：切换到"按日期浏览"可以查看该分类的所有日报话题
            </p>
          )}
        </div>
      )}
    </div>
  );
}
