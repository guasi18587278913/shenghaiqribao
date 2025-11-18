import { SubmitFormTool } from "@/components/submit/submit-form-tool";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import type {
  ToolCategoryListWithSubCategoryQueryResult,
  ToolTagListQueryResult
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { toolCategoryListWithSubCategoryQuery, toolTagListQuery } from "@/sanity/lib/queries";

export const metadata = constructMetadata({
  title: "Submit your tool (1/3)",
  description: "Submit your tool (1/3) – Enter tool details",
  canonicalUrl: `${siteConfig.url}/submitTool`,
});

export default async function SubmitPage() {
  const [categoryList, tagList] = await Promise.all([
    sanityFetch<ToolCategoryListWithSubCategoryQueryResult>({
      query: toolCategoryListWithSubCategoryQuery,
    }),
    sanityFetch<ToolTagListQueryResult>({
      query: toolTagListQuery,
    }),
  ]);

  return <SubmitFormTool tagList={tagList} categoryList={categoryList} />;
}
