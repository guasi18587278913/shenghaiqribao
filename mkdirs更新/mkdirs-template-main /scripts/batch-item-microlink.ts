import { slugify } from "@/lib/utils";
import type { Category, Tag } from "@/sanity.types";
import mql from "@microlink/mql";
import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import fetch from "node-fetch";
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
 * Demo: Automated Item Import Script (with Microlink API)
 *
 * A script that leverages Microlink API to automatically fetch and import
 * items into Sanity database.
 *
 * Operations:
 * 1. Remove existing items (cleanup)
 * 2. Fetch metadata via Microlink API
 * 3. Process and import items
 *
 * Features:
 * - Automated metadata extraction
 * - Bulk URL processing
 * - Asset auto-discovery
 * - Sequential processing for reliability
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
 * Data Fetched via Microlink:
 * - title → name
 * - description
 * - logo → icon
 * - image
 * - url → link
 *
 * Advantages:
 * 1. Automated metadata extraction
 * 2. Faster data entry process
 * 3. Consistent data structure
 * 4. Scalable for large datasets
 *
 * Limitations:
 * 1. Manual category/tag assignment still needed
 * 2. Variable asset quality (logos/images)
 * 3. Dependent on Microlink API availability
 * 4. Content of the items are missing
 *
 * Use Cases:
 * 1. Bulk item imports
 * 2. Quick prototyping
 * 3. Initial database population
 * 4. Regular content updates
 *
 * Note: This script requires proper environment variables in .env
 */
const links = [
  "https://mkdirs.com",
  "https://achromatic.dev",
  // Add more links here...
];

const fetchItem = async (url: string) => {
  try {
    const { data } = await mql(url, {
      data: {
        title: { selector: "title" },
        description: { selector: 'meta[name="description"]' },
        logo: { selector: 'link[rel="icon"]' },
        image: { selector: 'meta[property="og:image"]' },
        url: { selector: 'link[rel="canonical"]' },
      },
    });

    return {
      name: data.title || new URL(url).hostname,
      description: data.description || `A great boilerplate from ${url}`,
      link: url,
      categories: [
        "NextJS Boilerplates",
        "Typescript Boilerplates",
        "React Boilerplates",
      ],
      tags: ["NextJS", "Tailwind", "React", "TypeScript", "Shadcn"],
      image:
        data.image?.url ||
        `https://image.thum.io/get/width/1200/crop/800/${url}`,
      icon:
        data.logo?.url ||
        `https://s2.googleusercontent.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`,
    };
  } catch (error) {
    console.error(`Error fetching data for ${url}:`, error);
    return null;
  }
};

export const removeItemsMicrolink = async () => {
  const data = await client.delete({
    query: "*[_type == 'item']",
  });
  // console.log("removeItems:", data);
  console.log("removeItems success, length:", data.length);
};

export const importItemsMicrolink = async () => {
  try {
    // get all categories and tags first (only need to fetch once)
    const categories = await client.fetch<Category[]>(`*[_type == "category"]`);
    const tags = await client.fetch<Tag[]>(`*[_type == "tag"]`);

    console.log("Processing links one by one...");
    for (const link of links) {
      try {
        console.log(`Processing link: ${link}`);
        const item = await fetchItem(link);

        if (!item) {
          console.log(`Skipping ${link} due to fetch error`);
          continue;
        }

        console.log(`Creating item for: ${item.name}`);
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
            // current: item.slug,
            current: slugify(item.name),
          },
          link: item.link,
          description: item.description,
          publishDate: new Date(),
          pricePlan: "free",
          freePlanStatus: "submitting",

          // set submitter if you need, change the _ref to your user id
          // submitter: {
          //   _type: "reference",
          //   _ref: "",
          // },

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
      } catch (error) {
        console.error(`Error processing link: ${link}`, error);
      }
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
