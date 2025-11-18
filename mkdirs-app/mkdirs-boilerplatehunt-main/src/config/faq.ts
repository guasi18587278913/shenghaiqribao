import type { FAQConfig } from "@/types";
import { siteConfig } from "./site";

export const faqConfig: FAQConfig = {
  items: [
    // {
    //   id: "item-1",
    //   question: "Is it free to submit my product?",
    //   answer:
    //     "Yes, it is. \nYou can submit your product for free to get 3 dofollow links to boost your SEO. \nHowever, the free plan has limitations:\n" +
    //     "• Reviewed and listed within 72 hours\n" +
    //     "• Requires a backlink to our site\n" +
    //     "• No customer support",
    // },
    // {
    //   id: "item-2",
    //   question: "What are the benefits of the Pro plan?",
    //   answer:
    //     "The Pro plan offers several benefits:\n" +
    //     "• At least 3 dofollow links\n" +
    //     "• Immediate listing, or publish it whenever you want\n" +
    //     "• Permanent links with no backlink requirement\n" +
    //     "• Featured in listings with an award icon\n" +
    //     "• Promotion through our social media and newsletters\n" +
    //     "• Premium customer support",
    // },
    {
      id: "item-1",
      question: "Do I need to provide a backlink for my listing?",
      answer: "No.",
    },
    {
      id: "item-2",
      question: "The differences between Basic and Pro plans?",
      answer:
        "Basic plan submission is cheaper, but Pro plan submission will be featured in the directory Listings. \nBoth plans are listed immediately, no backlink is required, and can be launched whenever you want.",
    },
    {
      id: "item-3",
      question: "The differences between Pro and Sponsor plans?",
      answer:
        "Both Pro and Sponsor plans are featured in the directory Listings. \nSponsor plan submission will be always displayed in the directory Listings and detail pages for a period of time.",
    },
  ],
};

