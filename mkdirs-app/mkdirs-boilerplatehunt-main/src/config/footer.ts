import type { FooterConfig } from "@/types";

export const footerConfig: FooterConfig = {
  links: [
    {
      title: "Product",
      items: [
        { title: "Collection", href: "/collection" },
        // { title: "Search", href: "/search" },
        { title: "Category", href: "/category" },
        { title: "Tag", href: "/tag" },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "👉 Submit", href: "/submit" },
        { title: "Blog", href: "/blog" },
        { title: "Pricing", href: "/pricing" },
        // { title: "Pricing", href: "/pricing" },
        // { title: "Submit", href: "/submit" },
        // { title: "Studio", href: "/studio", external: true },
      ],
    },
    {
      title: "Tools",
      items: [
        { title: "🔥 Mkdirs", href: "https://mkdirs.com/" },
        { title: "🏞️ Free OG Generator", href: "https://og.indiehub.best/" },
        { title: "👨‍💻 Directory Boilerplate", href: "https://free.mkdirs.com/" },
        { title: "Best Directories", href: "https://BestDirectories.org/" },
        { title: "Refined", href: "https://refined.so/" },
        // { title: "Collection", href: "/collection" },
        // { title: "Home 2", href: "/home2" },
        // { title: "Home 3", href: "/home3" },
        // { title: "Collection 1", href: "/collection/the-best-google-analytics-alternatives-in-2024" },
        // { title: "Collection 2", href: "/collection/the-best-alternatives-to-semrush-in-2024" },
      ],
    },
    {
      title: "Company",
      items: [
        // { title: "About Us", href: "/about" },
        { title: "Privacy Policy", href: "/privacy" },
        { title: "Terms of Service", href: "/terms" },
        { title: "Sitemap", href: "/sitemap.xml" },
      ],
    },
  ],
};
