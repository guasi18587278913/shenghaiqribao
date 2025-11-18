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
 * Demo: Category Group Management
 *
 * This script manages category groups in the Sanity.io database.
 *
 * Operations:
 * 1. Remove all existing category groups
 * 2. Import predefined category groups
 * 3. (Optional) Update existing groups
 *
 * Features:
 * - Handles basic group metadata (name, slug, description)
 * - Maintains priority ordering
 * - Ensures consistent slug generation
 *
 * Data Structure:
 * - name: Group display name
 * - slug: URL-friendly identifier
 * - description: Detailed group explanation
 * - priority: The priority of the group, the higher the number, the higher the priority
 *
 * Use Cases:
 * - Initial system setup
 * - Category Groups restructuring
 * - Batch updates to group metadata
 *
 * Note: This script requires proper environment variables in .env
 */
const data = [
  { priority: 3, name: "Fullstack", description: "The fullstack boilerplates" },
  { priority: 2, name: "Frontend", description: "The frontend boilerplates" },
  { priority: 1, name: "Mobile", description: "The mobile boilerplates" },
];

export const removeGroups = async () => {
  const data = await client.delete({
    query: "*[_type == 'group']",
  });
  console.log("removeGroups:", data);
};

export const importGroups = async () => {
  try {
    console.log("importGroups start");

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      console.log("index: ", i, "item:", item.name);
      await client.create({
        // _id: item._id,
        // _createdAt: item._createdAt,
        // _updatedAt: item._updatedAt,
        _type: "group",
        name: item.name,
        slug: {
          _type: "slug",
          // current: item.slug,
          current: slugify(item.name),
        },
        description: item.description,
        priority: item.priority,
      });
    }

    console.log("importGroups success");
  } catch (error) {
    console.error(error);
  }
};

export const updateGroups = async () => {
  const groups = await client.fetch(`*[_type == "group"]`);

  for (const group of groups) {
    const result = await client
      .patch(group._id)
      .set({
        // do what you want to update here
      })
      .commit();

    console.log(`Updated group ${group.name}:`, result);
  }

  console.log(`Updated ${groups.length} groups`);
};
