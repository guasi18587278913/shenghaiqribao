import { PricePlans } from "@/lib/submission";
import type { PriceConfig } from "@/types";

export const priceConfig: PriceConfig = {
  plans: [
    // {
    //   title: PricePlans.FREE,
    //   description: "For Beginners",
    //   benefits: [
    //     "Get 3 dofollow links to boost your SEO",
    //     // "Permanent link with backlink maintenance",
    //     "Reviewed and listed within 72 hours",
    //     "Publish your product the day you want",
    //   ],
    //   limitations: [
    //     "Backlink to our site is required",
    //     "No customer support",
    //   ],
    //   price: 0,
    //   priceSuffix: "",
    //   stripePriceId: null,
    // },
    {
      title: PricePlans.BASIC,
      description: "For Basic Users",
      benefits: [
        "Get 3 dofollow links to boost your SEO",
        "List your boilerplate right now, no waiting",
        "Publish your boilerplate whenever you want",
        "Permanent link, no backlink required",
        "Premium customer support",
      ],
      limitations: [
        // "Backlink to our site is required",
        // "No customer support",
      ],
      price: 19.9,
      priceSuffix: "",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    },
    {
      title: PricePlans.PRO,
      description: "For Pro Users",
      benefits: [
        "Get >= 3 dofollow links to boost your SEO",
        "List right now, publish whenever you want",
        "Permanent link, no backlink required",
        "Featured placement at the top of listings",
        "Share through social media and newsletters",
        "Premium customer support",
      ],
      limitations: [],
      price: 29.9,
      priceSuffix: "",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    },
    {
      title: PricePlans.SPONSOR,
      description: "For Sponsors",
      benefits: [
        "Everything in Pro plan",
        "Promote your product on almost every page",
        "Available for all kinds of boilerplate",
        "Only one advertisement per period",
        "Schedule your advertising period",
        "Premium customer support",
      ],
      limitations: [],
      price: 39.9,
      priceSuffix: "/ week",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID,
    },
  ],
};
