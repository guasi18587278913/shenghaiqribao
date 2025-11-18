import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import type { CollectionListQueryResult } from "@/sanity.types";
import CollectionCard, { CollectionCardSkeleton } from "./collection-card";

interface CollectionGridProps {
  collections: CollectionListQueryResult;
}

export default function CollectionGrid({ collections }: CollectionGridProps) {
  return (
    <div>
      {collections && collections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((collection) => (
            <CollectionCard key={collection._id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CollectionGridSkeleton({
  count = COLLECTIONS_PER_PAGE,
}: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(count)].map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <CollectionCardSkeleton key={index} />
      ))}
    </div>
  );
}
