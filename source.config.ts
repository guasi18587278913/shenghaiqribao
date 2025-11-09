import {
  defineCollections,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

/**
 * https://fumadocs.dev/docs/mdx/collections#schema-1
 */
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      preview: z.string().optional(),
      index: z.boolean().default(false),
      premium: z.boolean().optional(),
    }),
  },
  meta: {
    schema: metaSchema.extend({
      description: z.string().optional(),
    }),
  },
});

/**
 * Changelog
 *
 * title is required, but description is optional in frontmatter
 */
export const changelog = defineCollections({
  type: 'doc',
  dir: 'content/changelog',
  schema: frontmatterSchema.extend({
    version: z.string(),
    date: z.string().date(),
    published: z.boolean().default(true),
  }),
});

/**
 * Pages, like privacy policy, terms of service, etc.
 *
 * title is required, but description is optional in frontmatter
 */
export const pages = defineCollections({
  type: 'doc',
  dir: 'content/pages',
  schema: frontmatterSchema.extend({
    date: z.string().date(),
    published: z.boolean().default(true),
  }),
});

/**
 * Blog authors
 *
 * description is optional in frontmatter, but we must add it to the schema
 */
export const author = defineCollections({
  type: 'doc',
  dir: 'content/author',
  schema: z.object({
    name: z.string(),
    avatar: z.string(),
    description: z.string().optional(),
  }),
});

/**
 * Blog categories
 *
 * description is optional in frontmatter, but we must add it to the schema
 */
export const category = defineCollections({
  type: 'doc',
  dir: 'content/category',
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
});

/**
 * Blog posts
 *
 * title is required, but description is optional in frontmatter
 */
export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: frontmatterSchema.extend({
    image: z.string(),
    date: z.string().date(),
    published: z.boolean().default(true),
    premium: z.boolean().optional(),
    categories: z.array(z.string()),
    author: z.string(),
  }),
});

/**
 * Knowledge Base
 *
 * Documentation for AI overseas development knowledge
 */
export const knowledge = defineDocs({
  dir: 'content/knowledge',
  docs: {
    schema: frontmatterSchema.extend({
      category: z.string(),
      tags: z.array(z.string()).optional(),
      relatedTopics: z.array(z.string()).optional(),
      importance: z.number().min(1).max(5).default(3),
    }),
  },
  meta: {
    schema: metaSchema.extend({
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
  },
});

/**
 * Daily Reports
 *
 * Daily community chat highlights and practical tutorials
 */
export const reports = defineDocs({
  dir: 'content/reports',
  docs: {
    schema: frontmatterSchema.extend({
      date: z.coerce.string(),
      author: z.string(),
      readingTime: z.string().optional(),
      tags: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
      published: z.boolean().default(true),
    }),
  },
  meta: {
    schema: metaSchema.extend({
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
  },
});
