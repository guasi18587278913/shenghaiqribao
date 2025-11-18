import type { FooterConfig } from "@/types";

export const footerConfig: FooterConfig = {
  links: [
    {
      title: "Product",
      items: [
        { title: "Products", href: "/app" },
        { title: "Tools", href: "/tool" },
        { title: "Collection", href: "/collection" },
        // { title: "Search", href: "/search" },
        // { title: "Category", href: "/category" },
        // { title: "Tag", href: "/tag" },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "Blog", href: "/blog" },
        { title: "Pricing", href: "/pricing" },
        { title: "👉 Submit", href: "/submit" },
        // { title: "Studio", href: "/studio", external: true },
      ],
    },
    {
      // title: "Social Media",
      title: "Tools",
      items: [
        { title: "🔥 Mkdirs", href: "https://mkdirs.com/" },
        { title: "📚 BoilerplateHunt", href: "https://boilerplatehunt.com/" },
        { title: "🏞️ Free OG Generator", href: "https://og.indiehub.best/" },
        { title: "👨‍💻 Directory Boilerplate", href: "https://free.mkdirs.com/" },
        // { title: "Refined", href: "https://refined.so/" },
        // { title: "X (Twitter)", href: "https://x.com/javay_hu" },
        // { title: "Github", href: "https://github.com/javayhu" },
        // { title: "Youtube", href: "https://www.youtube.com/@javayhu" },
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
