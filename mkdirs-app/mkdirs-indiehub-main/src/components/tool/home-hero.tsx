import { Icons } from "@/components/icons/icons";
import { buttonVariants } from "@/components/ui/button";
import { heroConfig } from "@/config/hero";
import { cn } from "@/lib/utils";
import Link from "next/link";
import HomeSearchBox from "./home-search-box";

export default function HomeHero() {
  const LabelIcon = Icons[heroConfig.label.icon];
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-5xl flex flex-col items-center text-center gap-8">
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
          The curated awesome tools for{" "}
          <span className="text-gradient_indigo-purple font-bold">
            Indie Makers
          </span>
        </h1>

        {/* <p className="max-w-4xl text-balance text-muted-foreground sm:text-xl">
          {heroConfig.subtitle}
        </p> */}

        <div className="w-full">
          <HomeSearchBox urlPrefix="/tool" />
        </div>
      </div>
    </div>
  );
}
