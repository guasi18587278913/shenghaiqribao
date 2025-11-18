import { SHOW_QUERY_LOGS, TOOLS_PER_PAGE } from "@/lib/constants";
import type { Tool, ToolListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { toolSimpleFields } from "@/sanity/lib/queries";

/**
 * get item by id
 */
export async function getToolById(id: string) {
  try {
    // @sanity-typegen-ignore
    const itemQry = `*[_type == "tool" && _id == "${id}"][0]`;
    const item = await sanityFetch<Tool>({
      query: itemQry,
      disableCache: true,
    });
    if (SHOW_QUERY_LOGS) {
      console.log("getToolById, item:", item);
    }
    return item;
  } catch (error) {
    console.error("getToolById, error:", error);
    return null;
  }
}

/**
 * get items from sanity
 */
export async function getTools({
  collection,
  category,
  tag,
  sortKey,
  reverse,
  query,
  filter,
  currentPage,
}: {
  collection?: string;
  category?: string;
  tag?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
  filter?: string;
  currentPage: number;
}) {
  console.log(
    "getTools, collection",
    collection,
    "category",
    category,
    "tag",
    tag,
  );
  const { countQuery, dataQuery } = buildQuery(
    collection,
    category,
    tag,
    sortKey,
    reverse,
    query,
    filter,
    currentPage,
  );
  const [totalCount, items] = await Promise.all([
    sanityFetch<number>({ query: countQuery }),
    sanityFetch<ToolListQueryResult>({ query: dataQuery }),
  ]);
  return { items, totalCount };
}

/**
 * build count and data query for get items from sanity
 */
const buildQuery = (
  collection?: string,
  category?: string,
  tag?: string,
  sortKey?: string,
  reverse?: boolean,
  query?: string,
  filter?: string,
  currentPage = 1,
) => {
  const orderDirection = reverse ? "desc" : "asc";
  const sortOrder = sortKey
    ? `| order(coalesce(featured, false) desc, ${sortKey} ${orderDirection})`
    : "| order(coalesce(featured, false) desc, publishDate desc)";
  const queryPattern = query ? `*${query}*` : "";
  const queryKeywords = query
    ? `&& (name match "${queryPattern}" 
    || description match "${queryPattern}"
    || introduction match "${queryPattern}")`
    : "";
  const filterCondition = filter ? `&& ${filter}` : "";
  const queryCondition = [queryKeywords, filterCondition]
    .filter(Boolean)
    .join(" ");
  const collectionCondition = collection
    ? `&& "${collection}" in collections[]->slug.current`
    : "";
  const categoryCondition = category
    ? `&& subcategory->slug.current == "${category}"`
    : "";
  // condition for single tag
  // const tagCondition = tag ? `&& "${tag}" in tags[]->slug.current` : "";
  // condition for multiple tags
  // split tag by comma and check if each tag is in tags[]->slug.current
  const tagList = tag ? tag.split(",") : [];
  const tagCondition =
    tagList && tagList.length > 0
      ? `&& count((tags[]->slug.current)[@ in [${tagList.map((t) => `"${t}"`).join(", ")}]]) == ${tagList.length}`
      : "";
  const offsetStart = (currentPage - 1) * TOOLS_PER_PAGE;
  const offsetEnd = offsetStart + TOOLS_PER_PAGE;

  // @sanity-typegen-ignore
  const countQuery = `count(*[_type == "tool" && defined(slug.current) 
      && defined(publishDate) && forceHidden != true && sponsor != true
      ${queryCondition} ${collectionCondition} ${categoryCondition} ${tagCondition}])`;
  // @sanity-typegen-ignore
  const dataQuery = `*[_type == "tool" && defined(slug.current) 
      && defined(publishDate) && forceHidden != true && sponsor != true
      ${queryCondition} ${collectionCondition} ${categoryCondition} ${tagCondition}] ${sortOrder} 
      [${offsetStart}...${offsetEnd}] {
      ${toolSimpleFields}
    }`;
  // console.log('buildQuery, countQuery', countQuery);
  // console.log("buildQuery, dataQuery", dataQuery);
  return { countQuery, dataQuery };
};
