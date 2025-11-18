import type { ToolCategoryListWithSubCategoryQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { toolCategoryListWithSubCategoryQuery } from "@/sanity/lib/queries";
import { HomeCategoryListClient } from "./home-category-list-client";

export async function HomeCategoryList({
  urlPrefix,
}: {
  urlPrefix: string;
}) {
  // const categoryList = await sanityFetch<ToolCategoryListQueryResult>({
  //   query: toolCategoryListQuery,
  // });
  // console.log("toolCategoryListWithSubCategoryQuery", toolCategoryListWithSubCategoryQuery);
  const categoryList = await sanityFetch<ToolCategoryListWithSubCategoryQueryResult>({
    query: toolCategoryListWithSubCategoryQuery,
  });
  // console.log("categoryList", categoryList);

  return (
    <HomeCategoryListClient categoryList={categoryList} urlPrefix={urlPrefix} />
  );
}
