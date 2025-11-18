import { QUERY_FILTER_LIST, SORT_FILTER_LIST } from "@/lib/constants";
import type {
  ToolCategoryListQueryResult,
  ToolCategoryListWithSubCategoryQueryResult,
  ToolTagListQueryResult
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  toolCategoryListQuery,
  toolCategoryListWithSubCategoryQuery,
  toolTagListQuery
} from "@/sanity/lib/queries";
import { HomeSearchFilterClient } from "./home-search-filter-client";

interface HomeSearchFilterProps {
  urlPrefix: string;
}

export async function HomeSearchFilter({ urlPrefix }: HomeSearchFilterProps) {
  const [categoryList, tagList] = await Promise.all([
    // sanityFetch<ToolCategoryListQueryResult>({
    //   query: toolCategoryListQuery,
    // }),
    sanityFetch<ToolCategoryListWithSubCategoryQueryResult>({
      query: toolCategoryListWithSubCategoryQuery,
    }),
    sanityFetch<ToolTagListQueryResult>({
      query: toolTagListQuery,
    }),
  ]);

  // const categories = categoryList.map((category) => ({
  //   slug: category.slug.current,
  //   name: category.name,
  // }));
  const categories = categoryList.flatMap((category) => 
    category.subCategories?.map((subCategory) => ({
      slug: subCategory.slug.current,
      name: `${category.name} / ${subCategory.name}`,
    })) || []
  );
  const tags = tagList.map((tag) => ({
    slug: tag.slug.current,
    name: tag.name,
  }));

  return (
    <div>
      {/* Desktop View, has Container */}
      <div className="hidden md:flex md:flex-col">
        <div className="w-full">
          <HomeSearchFilterClient
            tagList={tags}
            categoryList={categories}
            sortList={SORT_FILTER_LIST}
            filterList={QUERY_FILTER_LIST}
            urlPrefix={urlPrefix}
          />
        </div>
      </div>

      {/* Mobile View, no Container */}
      <div className="md:hidden flex flex-col">
        <div className="">
          <HomeSearchFilterClient
            tagList={tags}
            categoryList={categories}
            sortList={SORT_FILTER_LIST}
            filterList={QUERY_FILTER_LIST}
            urlPrefix={urlPrefix}
          />
        </div>
      </div>
    </div>
  );
}
