import type { SiteConfig } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "BoilerplateHunt",
  tagline:
    "Find the best boilerplates to ship faster. Explore production-ready boilerplates for SaaS, web, and mobile applications.",
  description:
    "Find the best boilerplates to ship faster. Explore production-ready boilerplates for SaaS, web, and mobile applications.",
  keywords: ["Directory", "Template", "Boilerplate"],
  author: "BoilerplateHunt",
  url: SITE_URL,
  logo: "/logo.png",
  // set the logoDark if you have put the logo-dark.png in the public folder
  // logoDark: "/logo-dark.png",
  // please increase the version number when you update the image
  image: `${SITE_URL}/og.png?v=20250112`,
  mail: "support@boilerplatehunt.com",
  utm: {
    source: "boilerplatehunt.com",
    medium: "referral",
    campaign: "navigation",
  },
  links: {
    // leave it blank if you don't want to show the link (don't delete)
    twitter: "https://x.com/indie_maker_fox",
    github: "https://github.com/javayhu",
    youtube: "https://www.youtube.com/@MkdirsHQ",
  },
};
