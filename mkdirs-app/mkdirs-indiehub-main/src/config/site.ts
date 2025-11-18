import type { SiteConfig } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  // name: "INDIE MAKERS",
  name: "IndieHub",
  tagline:
    "Discover tools, Launch products, and Ship applications faster and better.",
  description:
    "IndieHub is a community for Indie Makers to discover tools, launch products, and ship applications faster and better.",
  keywords: [
    "Indie Makers",
    "Indie Hackers",
    "Indie Hackers Community",
    "Indie Hackers Tools",
    "Indie Hackers Products",
  ],
  author: "IndieHub",
  url: SITE_URL,
  logo: "/logo.png",
  // set the logoDark if you have put the logo-dark.png in the public folder
  // logoDark: "/logo-dark.png",
  // please increase the version number when you update the image
  image: `${SITE_URL}/og.png?v=2`,
  mail: "support@indiehub.best",
  utm: {
    source: "indiehub.best",
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
