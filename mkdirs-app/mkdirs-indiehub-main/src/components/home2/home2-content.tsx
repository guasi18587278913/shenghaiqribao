import BlogGrid from "@/components/blog/blog-grid";
import ItemGrid from "@/components/item/item-grid";
import ItemGrid2 from "@/components/item/item-grid-2";
import ToolGrid from "@/components/tool/tool-grid";
import { Button } from "@/components/ui/button";
import type {
  BlogPostListQueryResult,
  ItemListQueryResult,
  ToolListQueryResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  blogPostListOfLatestQuery,
  itemListOfFeaturedQuery,
  itemListOfLatestQuery,
  toolListOfFeaturedQuery,
  toolListOfLatestQuery,
} from "@/sanity/lib/queries";
import {
  ArrowRightIcon,
  FileTextIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";

export async function HomeContent() {
  const [
    featuredItems,
    latestItems,
    featuredTools,
    latestTools,
    latestBlogPosts,
  ] = await Promise.all([
    sanityFetch<ItemListQueryResult>({
      query: itemListOfFeaturedQuery,
      params: { count: 6 },
    }),
    sanityFetch<ItemListQueryResult>({
      query: itemListOfLatestQuery,
      params: { count: 6 },
    }),
    
    sanityFetch<ToolListQueryResult>({
      query: toolListOfFeaturedQuery,
      params: { count: 6 },
    }),
    sanityFetch<ToolListQueryResult>({
      query: toolListOfLatestQuery,
      params: { count: 6 },
    }),

    sanityFetch<BlogPostListQueryResult>({
      query: blogPostListOfLatestQuery,
      params: { count: 6 },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">

      

      {/* featured products */}
      {featuredItems && featuredItems.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-lg tracking-wider font-semibold text-gradient_indigo-purple">
                Featured Products
              </h2>
            </div>

            <Link href="/app?f=featured%3D%3Dtrue" className="text-lg group flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </div>

          <ItemGrid2 items={featuredItems} />

          {/* <Button asChild variant="default" size="lg" className="mx-auto">
            <Link
              href="/app?f=featured%3D%3Dtrue"
              className="text-lg font-semibold px-16 group flex items-center gap-2"
            >
              <span className="tracking-wider">More Featured Products</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </Button> */}
        </div>
      )}

      {/* latest products */}
      {latestItems && latestItems.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-lg tracking-wider font-semibold text-gradient_indigo-purple">
                Latest Products
              </h2>
            </div>

            <Link href="/app" className="text-lg group flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </div>

          <ItemGrid2 items={latestItems} />

          {/* <Button asChild variant="default" size="lg" className="mx-auto">
            <Link
              href="/app"
              className="text-lg font-semibold px-16 group flex items-center gap-2"
            >
              <span className="tracking-wider">More Latest Products</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </Button> */}
        </div>
      )}

      {/* latest tools */}
      {latestTools && latestTools.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-lg tracking-wider font-semibold text-gradient_indigo-purple">
                Latest Tools
              </h2>
            </div>

            <Link href="/tool" className="text-lg group flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </div>

          <ToolGrid items={latestTools} />

          {/* <Button asChild variant="default" size="lg" className="mx-auto">
            <Link
              href="/tool"
              className="text-lg font-semibold px-16 group flex items-center gap-2"
            >
              <span className="tracking-wider">More Latest Tools</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </Button> */}
        </div>
      )}

      {/* featured tools */}
      {featuredTools && featuredTools.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-lg tracking-wider font-semibold text-gradient_indigo-purple">
                Featured Tools
              </h2>
            </div>

            <Link href="/tool?f=featured%3D%3Dtrue" className="text-lg group flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </div>

          <ToolGrid items={featuredTools} />

          {/* <Button asChild variant="default" size="lg" className="mx-auto">
            <Link
              href="/tool?f=featured%3D%3Dtrue"
              className="text-lg font-semibold px-16 group flex items-center gap-2"
            >
              <span className="tracking-wider">More Featured Tools</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </Button> */}
        </div>
      )}

      {/* latest posts */}
      {latestBlogPosts && latestBlogPosts.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <FileTextIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-lg tracking-wider font-semibold text-gradient_indigo-purple">
                Latest Posts
              </h2>
            </div>

            <Link href="/blog" className="text-lg group flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </div>

          <BlogGrid posts={latestBlogPosts} />

          {/* <Button asChild variant="default" size="lg" className="mx-auto">
            <Link
              href="/blog"
              className="text-lg font-semibold px-16 group flex items-center gap-2"
            >
              <span className="tracking-wider">More Blog Posts</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </Button> */}
        </div>
      )}
    </div>
  );
}
