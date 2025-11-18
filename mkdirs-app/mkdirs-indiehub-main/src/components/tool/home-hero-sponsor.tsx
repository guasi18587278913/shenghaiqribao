import HomeSearchBox from "./home-search-box";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SponsorItemListQueryResult } from "@/sanity.types";
import { sponsorItemListQuery } from "@/sanity/lib/queries";
import SponsorItemCard from "./item-card-sponsor";

export default async function HomeHeroSponsor() {
  // if you support sponsor item, you can use this code
  const sponsorItems = await sanityFetch<SponsorItemListQueryResult>({
    query: sponsorItemListQuery,
  });
  const sponsorItem = sponsorItems?.length
    ? sponsorItems[Math.floor(Math.random() * sponsorItems.length)]
    : null;
    
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
          <h1 className="font-bold text-balance text-2xl sm:text-3xl md:text-4xl">
            The awesome tools for{" "}
            <span className="text-gradient_indigo-purple font-bold">
              Indie Makers
            </span>
          </h1>

          <p className="max-w-4xl text-balance text-muted-foreground sm:text-xl">
            Discover 400+ best tools for efficient indie hacking, from Domain, Database, Design, to Template, CMS, Marketing, etc.
          </p>

          <div className="w-full flex items-center justify-center lg:justify-start">
            <HomeSearchBox urlPrefix="/tool" />
          </div>
        </div>

        {/* Sponsor card with fixed width */}
        {sponsorItem && (
          <div className="w-full lg:w-[400px]">
            <SponsorItemCard item={sponsorItem} />
          </div>
        )}
      </div>
    </div>
  );
}
