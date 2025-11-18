import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import type { ToolCollectionListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { collectionFields } from "@/sanity/lib/queries";

/**
 * get collections from sanity
 */
export async function getToolCollections({
  currentPage,
}: {
  currentPage: number;
}) {
  const { countQuery, dataQuery } = buildQuery(currentPage);
  const [totalCount, collections] = await Promise.all([
    sanityFetch<number>({ query: countQuery }),
    sanityFetch<ToolCollectionListQueryResult>({ query: dataQuery }),
  ]);
  return { collections, totalCount };
}

/**
 * build count and data query for get collections from sanity
 */
const buildQuery = (currentPage = 1) => {
  const offsetStart = (currentPage - 1) * COLLECTIONS_PER_PAGE;
  const offsetEnd = offsetStart + COLLECTIONS_PER_PAGE;

  // @sanity-typegen-ignore
  const countQuery = `count(*[_type == "toolCollection" && defined(slug.current) ])`;
  // @sanity-typegen-ignore
  const dataQuery = `*[_type == "toolCollection" && defined(slug.current) ] 
      | order(priority desc, publishDate desc) [${offsetStart}...${offsetEnd}] {
        ${collectionFields}
    }`;
  // console.log('buildQuery, countQuery', countQuery);
  // console.log('buildQuery, dataQuery', dataQuery);
  return { countQuery, dataQuery };
};
