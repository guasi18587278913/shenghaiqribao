import { slugify } from "@/lib/utils";
import type { Group } from "@/sanity.types";
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
 * Demo: Category Management
 *
 * This script manages categories in the Sanity database, including their
 * relationships with category groups.
 *
 * Operations:
 * 1. Remove all existing categories
 * 2. Import predefined categories with group associations
 * 3. (Optional) Update existing categories
 *
 * Features:
 * - Hierarchical category organization
 * - Priority-based ordering
 * - Group relationship management
 * - Automatic slug generation
 *
 * Data Structure:
 * - name: Category display name
 * - slug: URL-friendly identifier
 * - description: Detailed category explanation
 * - priority: The priority of the category, the higher the number, the higher the priority
 * - group: The group that the category belongs to
 *
 * Requirements:
 * 1. Each category must have a unique priority value
 * 2. When using groups, group names must exist in the database
 * 3. Environment variables of Sanity are required in .env file
 *
 * Example Usage:
 * ```
 * // Remove all categories and import new ones
 * removeCategories();
 * importCategories();
 *
 * // Update existing categories
 * updateCategories();
 * ```
 *
 * Note: This script requires proper environment variables in .env
 */
const data = [
  // fullstack
  {
    priority: 200,
    name: "NextJS Boilerplates",
    group: "Fullstack",
    description: "The nextjs boilerplates",
  },
  {
    priority: 199,
    name: "Nuxt Boilerplates",
    group: "Fullstack",
    description: "The nuxt boilerplates",
  },
  {
    priority: 198,
    name: "SvelteKit Boilerplates",
    group: "Fullstack",
    description: "The sveltekit boilerplates",
  },
  {
    priority: 197,
    name: "Django Boilerplates",
    group: "Fullstack",
    description: "The django boilerplates",
  },
  {
    priority: 196,
    name: "Express Boilerplates",
    group: "Fullstack",
    description: "The express boilerplates",
  },
  {
    priority: 195,
    name: "NodeJS Boilerplates",
    group: "Fullstack",
    description: "The nodejs boilerplates",
  },
  {
    priority: 194,
    name: "PHP Boilerplates",
    group: "Fullstack",
    description: "The php boilerplates",
  },
  {
    priority: 193,
    name: "Ruby on Rails Boilerplates",
    group: "Fullstack",
    description: "The ruby on rails boilerplates",
  },
  {
    priority: 192,
    name: "Laravel Boilerplates",
    group: "Fullstack",
    description: "The laravel boilerplates",
  },

  // frontend
  {
    priority: 150,
    name: "React Boilerplates",
    group: "Frontend",
    description: "The react boilerplates",
  },
  {
    priority: 149,
    name: "Vue Boilerplates",
    group: "Frontend",
    description: "The vue boilerplates",
  },
  {
    priority: 148,
    name: "Svelte Boilerplates",
    group: "Frontend",
    description: "The svelte boilerplates",
  },
  {
    priority: 147,
    name: "Astro Boilerplates",
    group: "Frontend",
    description: "The astro boilerplates",
  },
  {
    priority: 146,
    name: "Typescript Boilerplates",
    group: "Frontend",
    description: "The typescript boilerplates",
  },

  // mobile
  {
    priority: 100,
    name: "React Native Boilerplates",
    group: "Mobile",
    description: "The react native boilerplates",
  },
  {
    priority: 99,
    name: "Flutter Boilerplates",
    group: "Mobile",
    description: "The flutter boilerplates",
  },
  {
    priority: 98,
    name: "Expo Boilerplates",
    group: "Mobile",
    description: "The expo boilerplates",
  },
  {
    priority: 97,
    name: "Swift Boilerplates",
    group: "Mobile",
    description: "The swift boilerplates",
  },
  {
    priority: 96,
    name: "Kotlin Boilerplates",
    group: "Mobile",
    description: "The kotlin boilerplates",
  },
];

export const removeCategories = async () => {
  const data = await client.delete({
    query: "*[_type == 'category']",
  });
  console.log("removeCategories:", data);
};

export const importCategories = async () => {
  try {
    console.log("importCategories start");

    // get all category groups
    const groups = await client.fetch<Group[]>(`*[_type == "group"]`);

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      console.log("index: ", i, "item:", item.name);
      const group = findGroup(groups, item.group);
      // accept category without group
      // if (!group) {
      //   console.error(`Group ${item.group} not found`);
      //   continue;
      // }
      await client.create({
        // _id: item._id,
        // _createdAt: item._createdAt,
        // _updatedAt: item._updatedAt,
        _type: "category",
        name: item.name,
        slug: {
          _type: "slug",
          // current: item.slug,
          current: slugify(item.name),
        },
        description: item.description,
        priority: item.priority,
        group: group
          ? {
              _type: "reference",
              _ref: group._id,
            }
          : undefined,
      });
    }

    console.log("importCategories success");
  } catch (error) {
    console.error(error);
  }
};

const findGroup = (groups: Group[], name: string) => {
  return groups.find((group: Group) => group.name === name);
};

export const updateCategories = async () => {
  const categories = await client.fetch(`*[_type == "category"]`);

  for (const category of categories) {
    const result = await client
      .patch(category._id)
      .set({
        // do what you want to update here
      })
      .commit();

    console.log(`Updated category ${category.name}:`, result);
  }

  console.log(`Updated ${categories.length} categories`);
};
