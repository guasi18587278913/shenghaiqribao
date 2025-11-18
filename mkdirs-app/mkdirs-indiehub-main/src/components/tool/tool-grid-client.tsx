import { SUPPORT_TOOL_ICON } from "@/lib/constants";
import type { ToolListQueryResult } from "@/sanity.types";
import ToolCard from "./item-card";
import ToolCard2 from "./item-card-2";
import SponsorItemCard from "./item-card-sponsor";

interface ToolGridClientProps {
  items: ToolListQueryResult;
}

/**
 * ToolGrid Client Component
 *
 * 1. show sponsor item card when item.sponsor is true
 * 2. show item card with icon when SUPPORT_ITEM_ICON is true
 * otherwise show item card with image
 */
export default function ToolGridClient({ items }: ToolGridClientProps) {
  return (
    <div>
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) =>
            /* item.sponsor ? (
              <SponsorItemCard key={item._id} item={item} />
            ) : */ 
            SUPPORT_TOOL_ICON ? (
              <ToolCard2 key={item._id} item={item} />
            ) : (
              <ToolCard key={item._id} item={item} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
