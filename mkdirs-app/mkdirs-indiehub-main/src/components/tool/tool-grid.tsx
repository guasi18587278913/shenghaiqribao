import { SUPPORT_TOOL_ICON, TOOLS_PER_PAGE } from "@/lib/constants";
import type {
  SponsorToolListQueryResult,
  ToolListQueryResult
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sponsorToolListQuery } from "@/sanity/lib/queries";
import { ToolCardSkeleton } from "./item-card-2";
import ToolGridClient from "./tool-grid-client";

interface ToolGridProps {
  items: ToolListQueryResult;
  showSponsor?: boolean;
}

/**
 * ToolGrid Server Component
 *
 * 1. show sponsor item card when item.sponsor is true
 * 2. show item card with icon when SUPPORT_ITEM_ICON is true
 * otherwise show item card with image
 */
export default async function ToolGrid({
  items,
  showSponsor = true,
}: ToolGridProps) {
  const sponsorItems = showSponsor
    ? (await sanityFetch<SponsorToolListQueryResult>({
        query: sponsorToolListQuery,
      })) || []
    : [];
  // console.log("ItemGrid, sponsorItems", sponsorItems);

  // show sponsor items at the top
  // const allItems = [...(Array.isArray(sponsorItems) ? sponsorItems : []), ...items];

  // show sponsor items from the 3rd item
  const allItems = [
    ...items.slice(0, 2),
    ...(Array.isArray(sponsorItems) ? sponsorItems : []),
    ...items.slice(2),
  ];

  return <ToolGridClient items={allItems} />;
}

export function ItemGridSkeleton({
  count = TOOLS_PER_PAGE,
}: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(count)].map((_, index) =>
        SUPPORT_TOOL_ICON ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: ignore
          <ToolCardSkeleton key={index} />
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: ignore
          <ToolCardSkeleton key={index} />
        ),
      )}
    </div>
  );
}
