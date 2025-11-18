import EmptyGrid from "@/components/shared/empty-grid";
import CustomPagination from "@/components/shared/pagination";
import ToolGrid from "@/components/tool/tool-grid";
import { siteConfig } from "@/config/site";
import { getTools } from "@/data/tool";
import {
  DEFAULT_SORT,
  SORT_FILTER_LIST,
  TOOLS_PER_PAGE,
} from "@/lib/constants";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "",
  canonicalUrl: `${siteConfig.url}/`,
});

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  console.log("HomePage, searchParams", searchParams);

  const {
    category,
    tag,
    sort,
    page,
    q: query,
    f: filter,
  } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    SORT_FILTER_LIST.find((item) => item.slug === sort) || DEFAULT_SORT;
  const currentPage = page ? Number(page) : 1;
  const { items, totalCount } = await getTools({
    category,
    tag,
    sortKey,
    reverse,
    query,
    filter,
    currentPage,
  });
  const totalPages = Math.ceil(totalCount / TOOLS_PER_PAGE);
  console.log("HomePage, totalCount", totalCount, ", totalPages", totalPages);

  return (
    <div>
      {/* when no items are found */}
      {items?.length === 0 && <EmptyGrid />}

      {/* when items are found */}
      {items && items.length > 0 && (
        <section className="">
          <ToolGrid items={items} />

          <div className="mt-8 flex items-center justify-center">
            <CustomPagination routePreix="/tool" totalPages={totalPages} />
          </div>
        </section>
      )}
    </div>
  );
}
