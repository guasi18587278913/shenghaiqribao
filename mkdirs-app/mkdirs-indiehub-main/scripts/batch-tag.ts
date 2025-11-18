import { slugify } from "@/lib/utils";
import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config();

// make sure you have set the environment variables in .env file
const client = createClient({
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-08-01",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_TOKEN,
});

/**
 * Demo: Tag Management
 *
 * This script manages the tag system in Sanity database.
 *
 * Operations:
 * 1. Remove all existing tags
 * 2. Import predefined tags
 * 3. (Optional) Update existing tags
 *
 * Features:
 * - Automatic slug generation from tag names
 * - Descriptive metadata for each tag
 * - Batch processing capabilities
 *
 * Data Structure:
 * - name: Tag display name
 * - slug: URL-friendly identifier
 * - description: Detailed tag explanation
 *
 * Example Usage:
 * ```
 * // Clean and import
 * removeTags();
 * importTags();
 *
 * // Update existing tags
 * updateTags();
 * ```
 *
 * Note: This script requires proper environment variables in .env
 */
const data = [
  // You can use Cursor to help you generate the data
  {
    name: "Open Source",
    description: "The boilerplates which are open source",
  },
  {
    name: "Auth",
    description: "The boilerplates with authentication functionality",
  },
  { name: "AI", description: "The boilerplates with AI integration" },
  {
    name: "Admin Panel",
    description: "The boilerplates with admin panel functionality",
  },
  {
    name: "Stripe",
    description: "The boilerplates with Stripe payment integration",
  },
  {
    name: "Database",
    description: "The boilerplates with database integration",
  },
  {
    name: "Directory",
    description: "The boilerplates with directory structure",
  },
  { name: "Blog", description: "The boilerplates with blogging functionality" },
  {
    name: "Analytics",
    description: "The boilerplates with analytics integration",
  },
  {
    name: "CMS",
    description: "The boilerplates with content management system",
  },
  {
    name: "Billing",
    description: "The boilerplates with billing functionality",
  },
  { name: "Themes", description: "The boilerplates with theming support" },
  {
    name: "Subscription",
    description: "The boilerplates with subscription functionality",
  },
  {
    name: "Microservices",
    description: "The boilerplates with microservices architecture",
  },
  { name: "Payments", description: "The boilerplates with payment processing" },
  { name: "Email", description: "The boilerplates with email functionality" },
  {
    name: "Deployment",
    description: "The boilerplates with deployment configurations",
  },
  {
    name: "Animations",
    description: "The boilerplates with animation features",
  },
  {
    name: "Checkout",
    description: "The boilerplates with checkout functionality",
  },
  { name: "Ads", description: "The boilerplates with advertising integration" },
  {
    name: "Components",
    description: "The boilerplates with reusable components",
  },
  { name: "SEO", description: "The boilerplates with SEO optimization" },
  { name: "Storage", description: "The boilerplates with storage solutions" },
  {
    name: "Onboarding",
    description: "The boilerplates with user onboarding flow",
  },
  {
    name: "Dashboard",
    description: "The boilerplates with dashboard interface",
  },
  { name: "Login", description: "The boilerplates with login functionality" },
  {
    name: "Documentation",
    description: "The boilerplates with documentation setup",
  },
  {
    name: "Lemon Squeezy",
    description: "The boilerplates with Lemon Squeezy integration",
  },
  {
    name: "Landing Page",
    description: "The boilerplates with landing page templates",
  },
  { name: "CI/CD", description: "The boilerplates with CI/CD pipeline setup" },
  {
    name: "Navigation",
    description: "The boilerplates with navigation components",
  },
  { name: "UI/UX", description: "The boilerplates with UI/UX design system" },
  {
    name: "Multi-tenancy",
    description: "The boilerplates with multi-tenant architecture",
  },
  { name: "Tables", description: "The boilerplates with table components" },
  { name: "Support", description: "The boilerplates with support system" },
  {
    name: "Paywalls",
    description: "The boilerplates with paywall functionality",
  },
  {
    name: "Customizable",
    description: "The boilerplates with customization options",
  },
  {
    name: "Referral Tracking",
    description: "The boilerplates with referral tracking system",
  },
  {
    name: "Responsive",
    description: "The boilerplates with responsive design",
  },
  { name: "Plugins", description: "The boilerplates with plugin system" },
  { name: "Style", description: "The boilerplates with styling system" },
  {
    name: "Notifications",
    description: "The boilerplates with notification system",
  },
  {
    name: "Paddle",
    description: "The boilerplates with Paddle payment integration",
  },
  {
    name: "Waitlist",
    description: "The boilerplates with waitlist functionality",
  },
  {
    name: "Community",
    description: "The boilerplates with community features",
  },
  { name: "Updates", description: "The boilerplates with update system" },
  { name: "Dark Mode", description: "The boilerplates with dark mode support" },
  {
    name: "Lambda Architecture",
    description: "The boilerplates with Lambda architecture",
  },
  {
    name: "Integrations",
    description: "The boilerplates with third-party integrations",
  },
  { name: "Resend", description: "The boilerplates with Resend email service" },
  {
    name: "Settings",
    description: "The boilerplates with settings management",
  },
  {
    name: "2FA",
    description: "The boilerplates with two-factor authentication",
  },
  {
    name: "Revenue Cat",
    description: "The boilerplates with Revenue Cat integration",
  },
  {
    name: "In-app purchases",
    description: "The boilerplates with in-app purchase functionality",
  },
  {
    name: "NextJS",
    description: "The boilerplates built with Next.js framework",
  },
  { name: "React", description: "The boilerplates built with React library" },
  {
    name: "Tailwind",
    description: "The boilerplates using Tailwind CSS framework",
  },
  {
    name: "Django",
    description: "The boilerplates built with Django framework",
  },
  {
    name: "Laravel",
    description: "The boilerplates built with Laravel framework",
  },
  {
    name: "Supabase",
    description: "The boilerplates integrated with Supabase",
  },
  { name: "TypeScript", description: "The boilerplates using TypeScript" },
  {
    name: "Shadcn",
    description: "The boilerplates using Shadcn UI components",
  },
  { name: "NodeJS", description: "The boilerplates built with Node.js" },
  { name: "PHP", description: "The boilerplates using PHP" },
  {
    name: "React Native",
    description: "The boilerplates built with React Native",
  },
  { name: "Python", description: "The boilerplates using Python" },
  { name: "HTMX", description: "The boilerplates using HTMX" },
  { name: "Flutter", description: "The boilerplates built with Flutter" },
  { name: "Vue", description: "The boilerplates built with Vue.js" },
  {
    name: "Ruby on Rails",
    description: "The boilerplates built with Ruby on Rails",
  },
  { name: "Astro", description: "The boilerplates built with Astro framework" },
  {
    name: "Nuxt",
    description: "The boilerplates built with Nuxt.js framework",
  },
  { name: "Kotlin", description: "The boilerplates using Kotlin" },
  { name: "Figma", description: "The boilerplates with Figma design assets" },
  { name: "Express", description: "The boilerplates built with Express.js" },
  {
    name: "PostgreSQL",
    description: "The boilerplates using PostgreSQL database",
  },
  { name: "Mailgun", description: "The boilerplates integrated with Mailgun" },
  { name: "Remix", description: "The boilerplates built with Remix framework" },
  { name: "Expo", description: "The boilerplates built with Expo" },
  { name: "SwiftUI", description: "The boilerplates built with SwiftUI" },
  { name: "SvelteKit", description: "The boilerplates built with SvelteKit" },
  { name: "CSS", description: "The boilerplates with CSS styling" },
  { name: "HTML", description: "The boilerplates using HTML" },
  { name: "DaisyUI", description: "The boilerplates using DaisyUI components" },
  {
    name: "Strapi",
    description: "The boilerplates integrated with Strapi CMS",
  },
  { name: "Svelte", description: "The boilerplates built with Svelte" },
  { name: "Javascript", description: "The boilerplates using JavaScript" },
  { name: "Chakra", description: "The boilerplates using Chakra UI" },
  {
    name: "Firebase",
    description: "The boilerplates integrated with Firebase",
  },
  { name: "Livewire", description: "The boilerplates using Laravel Livewire" },
  { name: "Prisma", description: "The boilerplates using Prisma ORM" },
  {
    name: "Pocketbase",
    description: "The boilerplates integrated with Pocketbase",
  },
  { name: "MongoDB", description: "The boilerplates using MongoDB database" },
  { name: "Fly.io", description: "The boilerplates deployed on Fly.io" },
];

export const removeTags = async () => {
  const data = await client.delete({
    query: "*[_type == 'tag']",
  });
  console.log("removeTags:", data);
};

export const importTags = async () => {
  try {
    console.log("importTags start");

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      console.log("index: ", i, "item:", item.name);
      await client.create({
        // _id: item._id,
        // _createdAt: item._createdAt,
        // _updatedAt: item._updatedAt,
        _type: "tag",
        name: item.name,
        slug: {
          _type: "slug",
          // current: item.slug,
          current: slugify(item.name),
        },
        description: item.description,
      });
    }

    console.log("importTags success");
  } catch (error) {
    console.error(error);
  }
};

export const updateTags = async () => {
  const tags = await client.fetch(`*[_type == "tag"]`);

  for (const tag of tags) {
    const result = await client
      .patch(tag._id)
      .set({
        // do what you want to update here
      })
      .commit();

    console.log(`Updated tag ${tag.name}:`, result);
  }

  console.log(`Updated ${tags.length} tags`);
};
