import { heroConfig } from "@/config/hero";
import { getItemTargetLinkInWebsite } from "@/lib/utils";
import { SponsorItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sponsorItemListQuery } from "@/sanity/lib/queries";
import Link from "next/link";

export default async function HomeHero() {
  // if you support sponsor item, you can use this code
  // const sponsorItems = await sanityFetch<SponsorItemListQueryResult>({
  //   query: sponsorItemListQuery,
  // });
  // const sponsorItem = sponsorItems?.length
  //   ? sponsorItems[Math.floor(Math.random() * sponsorItems.length)]
  //   : null;
  // const itemLink = getItemTargetLinkInWebsite(sponsorItem);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-5xl flex flex-col items-center text-center">
        {/* <Link
          href={heroConfig.label.href}
          target="_blank"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "px-4 rounded-full",
          )}
        >
          <span className="mr-2">🎉</span>
          <span>{heroConfig.label.text}</span>
          <LabelIcon className="size-4" />
        </Link> */}

        {/* maybe font-sourceSans is better */}
        <h1 className="max-w-5xl font-bold text-balance text-2xl sm:text-3xl md:text-4xl">
          {heroConfig.title.first}{" "}
          <span className="text-gradient_indigo-purple font-bold">
            {heroConfig.title.second}
          </span>
        </h1>

        <p className="mt-8 max-w-4xl text-balance text-muted-foreground sm:text-xl">
          {heroConfig.subtitle}
        </p>

        {/* {sponsorItem && (
          <div className="mt-4 w-full">
            <p className="max-w-4xl text-balance sm:text-xl">
              Sponsored by <Link href={itemLink} target="_blank" className="text-primary">{sponsorItem.name}</Link>
            </p>
          </div>
        )} */}
        <div className="mt-4 w-full">
          <p className="max-w-4xl text-balance sm:text-xl">
          🔥 <Link href={"https://mksaas.com"} target="_blank" className="text-primary">MKSaaS, make your AI SaaS in a weekend</Link>
          </p>
        </div>

        {/* <div className="w-full">
          <HomeSearchBox urlPrefix="/" />
        </div> */}
      </div>
    </div>
  );
}
