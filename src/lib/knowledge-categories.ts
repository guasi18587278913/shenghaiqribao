/**
 * Knowledge Base Categories
 * Extracts category data from content/knowledge directory
 */

import fs from 'node:fs';
import path from 'node:path';

export interface KnowledgeArticle {
  slug: string;
  title: string;
  href: string;
}

export interface KnowledgeCategory {
  slug: string;
  title: string;
  description?: string;
  icon: string;
  count: number;
  href: string;
  articles: KnowledgeArticle[];
}

interface CategoryMeta {
  title: string;
  description?: string;
  icon?: string;
  pages?: string[];
}

/**
 * Get all knowledge base categories with article counts
 * Reads directly from content/knowledge/[category]/meta.json files
 */
export async function getKnowledgeCategories(): Promise<KnowledgeCategory[]> {
  const knowledgeDir = path.join(process.cwd(), 'content', 'knowledge');

  // Define category order
  const categoryOrder = [
    'account',
    'network',
    'payment',
    'dev-tools',
    'project',
    'product-growth',
    'community',
    'learning',
    'cost',
  ];

  const categories: KnowledgeCategory[] = [];

  for (const slug of categoryOrder) {
    const categoryPath = path.join(knowledgeDir, slug);
    const metaPath = path.join(categoryPath, 'meta.json');

    // Check if directory and meta.json exist
    if (!fs.existsSync(categoryPath) || !fs.existsSync(metaPath)) {
      continue;
    }

    // Read meta.json
    const metaContent = fs.readFileSync(metaPath, 'utf-8');
    const meta: CategoryMeta = JSON.parse(metaContent);

    // Count MDX files in the category directory (excluding meta.json)
    const files = fs.readdirSync(categoryPath);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    const count = mdxFiles.length;

    // Get icon name
    const iconName = meta.icon || 'Folder';

    // Extract article information from MDX files
    const articles: KnowledgeArticle[] = mdxFiles.map(file => {
      const articleSlug = file.replace('.mdx', '');
      const articleTitle = articleSlug; // Use filename as title for now

      return {
        slug: articleSlug,
        title: articleTitle,
        href: `/knowledge/${slug}/${articleSlug}`,
      };
    });

    categories.push({
      slug,
      title: meta.title,
      description: meta.description,
      icon: iconName,
      count,
      href: `/knowledge/${slug}`,
      articles,
    });
  }

  return categories;
}
