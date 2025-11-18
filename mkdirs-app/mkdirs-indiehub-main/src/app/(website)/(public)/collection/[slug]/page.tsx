import Container from "@/components/container";
import EmptyGrid from "@/components/shared/empty-grid";
import { HeaderSection } from "@/components/shared/header-section";
import CustomPagination from "@/components/shared/pagination";
import ToolGrid from "@/components/tool/tool-grid";
import { siteConfig } from "@/config/site";
import { getTools } from "@/data/tool";
import {
  DEFAULT_SORT,
  SORT_FILTER_LIST,
  TOOLS_PER_PAGE
} from "@/lib/constants";
import { constructMetadata } from "@/lib/metadata";
import type { ToolCollectionQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { toolCollectionQuery } from "@/sanity/lib/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  console.log("params", params);
  const collection = await sanityFetch<ToolCollectionQueryResult>({
    query: toolCollectionQuery,
    params: { slug: params.slug },
  });
  // console.log("collection", collection);
  if (!collection) {
    console.warn(
      `generateMetadata, collection not found for slug: ${params.slug}`,
    );
    return;
  }

  const ogImageUrl = new URL(`${siteConfig.url}/api/og`);
  ogImageUrl.searchParams.append("title", collection.name);
  ogImageUrl.searchParams.append("description", collection.description || "");
  ogImageUrl.searchParams.append("type", "Collection");

  return constructMetadata({
    title: `${collection.name}`,
    description: collection.description,
    canonicalUrl: `${siteConfig.url}/collection/${params.slug}`,
    // image: ogImageUrl.toString(),
  });
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const collection = await sanityFetch<ToolCollectionQueryResult>({
    query: toolCollectionQuery,
    params: { slug: params.slug },
  });
  if (!collection) {
    console.warn(
      `CollectionPage, collection not found for slug: ${params.slug}`,
    );
    return notFound();
  }

  const { sort, page } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    SORT_FILTER_LIST.find((item) => item.slug === sort) || DEFAULT_SORT;
  const currentPage = page ? Number(page) : 1;
  const { items, totalCount } = await getTools({
    collection: params.slug,
    sortKey,
    reverse,
    currentPage,
  });
  const totalPages = Math.ceil(totalCount / TOOLS_PER_PAGE);
  console.log(
    "CollectionPage, totalCount",
    totalCount,
    ", totalPages",
    totalPages,
  );

  return (
    <div className="mb-16">
      <div className="mt-8">
        <div className="w-full flex flex-col items-center justify-center gap-8">
          <HeaderSection
            labelAs="h1"
            label="Collection"
            titleAs="h2"
            title={`${collection?.name}`}
          />
        </div>
      </div>

      <Container className="mt-8">
        <div>
          {/* when no items are found */}
          {items?.length === 0 && <EmptyGrid />}

          {/* when items are found */}
          {items && items.length > 0 && (
            <section className="">
              <ToolGrid items={items} showSponsor={false} />

              <div className="mt-8 flex items-center justify-center">
                <CustomPagination
                  routePreix={`/collection/${params.slug}`}
                  totalPages={totalPages}
                />
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
