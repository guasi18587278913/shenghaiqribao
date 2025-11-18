import { slugify } from "@/lib/utils";
import type { Category, Tag } from "@/sanity.types";
import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
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
 * Demo: Item Management
 *
 * A comprehensive script for managing items in the Sanity database
 * with manual data entry approach.
 *
 * Operations:
 * 1. Remove existing items (cleanup)
 * 2. Import predefined items
 * 3. (Optional) Update existing items
 *
 * Features:
 * - Manual data curation
 * - Asset management (icons, images)
 * - Category and tag relationships
 * - Automatic slug generation
 * - Metadata handling
 *
 * Data Structure:
 * - name: Item display name
 * - slug: URL-friendly identifier
 * - description: Detailed item explanation
 * - link: The link of the item
 * - categories: The categories that the item belongs to
 * - tags: The tags that the item belongs to
 * - image: The image of the item
 * - icon: The icon of the item
 *
 * Advantages:
 * 1. High data accuracy and quality control
 * 2. Precise metadata management
 * 3. Controlled categorization
 *
 * Limitations:
 * 1. Time-intensive manual data entry
 * 2. Requires regular maintenance
 * 3. Limited scalability for large datasets
 * 4. Content of the items are missing
 *
 * Use Cases:
 * 1. Initial platform seeding
 * 2. Featured content management
 * 3. Quality-focused collections
 * 4. Custom showcase items
 *
 * Note: This script requires proper environment variables in .env
 */

// Read data from JSON file
const loadItemsData = () => {
  try {
    const dataPath = path.join(process.cwd(), "scripts", "items.json");
    const jsonData = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error loading items data:", error);
    return [];
  }
};

export const importItems = async () => {
  try {
    console.log("importItems start");

    // Load data from JSON file
    const data = loadItemsData();
    if (data.length === 0) {
      console.log("No items found in data file");
      return;
    }

    // get all categories and tags
    const categories = await client.fetch<Category[]>(`*[_type == "category"]`);
    const tags = await client.fetch<Tag[]>(`*[_type == "tag"]`);

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      console.log("index: ", i, "item:", item.name);
      const itemCategories = findCategory(categories, item.categories);
      const itemTags = findTag(tags, item.tags);

      // Fetch icon and image
      const [iconResponse, imageResponse] = await Promise.all([
        fetch(item.icon),
        fetch(item.image),
      ]);
      const [iconArrayBuffer, imageArrayBuffer] = await Promise.all([
        iconResponse.arrayBuffer(),
        imageResponse.arrayBuffer(),
      ]);

      // Convert ArrayBuffer to Buffer for Sanity upload
      const [iconBuffer, imageBuffer] = [
        Buffer.from(iconArrayBuffer),
        Buffer.from(imageArrayBuffer),
      ];

      // Upload icon and image to sanity
      const [iconAsset, imageAsset] = await Promise.all([
        client.assets.upload("image", iconBuffer, {
          filename: `${slugify(item.name)}_logo.png`,
        }),
        client.assets.upload("image", imageBuffer, {
          filename: `${slugify(item.name)}_image.png`,
        }),
      ]);

      await client.create({
        // _id: item._id,
        // _createdAt: item._createdAt,
        // _updatedAt: item._updatedAt,
        _type: "item",
        name: item.name,
        slug: {
          _type: "slug",
          current: slugify(item.name),
        },
        link: item.link,
        description: item.description,
        introduction: item.introduction,
        publishDate: new Date(),
        autoSubmit: true,
        note: "autogrowth365.com",
        pricePlan: "basic",
        basicPlanStatus: "approved",

        // set submitter if you need, change the _ref to your user id
        submitter: {
          _type: "reference",
          _ref: "user.8248b7a2-b093-4483-8fda-86a9f4f38c40",
        },

        // set categories and tags
        categories: itemCategories.map((category, index) => ({
          _type: "reference",
          _ref: category._id,
          _key: index.toString(),
        })),
        tags: itemTags.map((tag, index) => ({
          _type: "reference",
          _ref: tag._id,
          _key: index.toString(),
        })),

        // set icon and image
        icon: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: iconAsset._id,
          },
          alt: `Logo of ${item.name}`,
        },
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
          alt: `Screenshot of ${item.name}`,
        },
      });
    }

    console.log("importItems success");
  } catch (error) {
    console.error(error);
  }
};

const findCategory = (categories: Category[], names: string[]) => {
  return categories.filter((category: Category) =>
    names.includes(category.name),
  );
};

const findTag = (tags: Tag[], names: string[]) => {
  return tags.filter((tag: Tag) => names.includes(tag.name));
};

export const updateItems = async () => {
  const items = await client.fetch(`*[_type == "item"]`);

  for (const item of items) {
    const result = await client
      .patch(item._id)
      .set({
        // do what you want to update here
      })
      .commit();

    console.log(`Updated item ${item.name}:`, result);
  }

  console.log(`Updated ${items.length} items`);
};

// get operation from command line
const operation = process.argv[2];

// run operation based on command line argument
const runOperation = async () => {
  switch (operation) {
    case "import":
      await importItems();
      break;
    default:
      console.log(`
Available commands:
- import: Import all data
      `);
  }
};

// run operation
runOperation().catch(console.error);
