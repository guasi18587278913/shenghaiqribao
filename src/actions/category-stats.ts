'use server';

/**
 * Server Actions for Category Statistics
 * Handles dynamic category tracking and statistics
 */

import { db } from '@/db';
import { categoryStats, dailyReport, dailyTopic } from '@/db/schema';
import type { ArchiveMonth, CategoryStat } from '@/types/daily-report';
import { desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Generate URL-friendly slug from category name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
}

/**
 * Update or create category statistics
 * Called when a new topic is created or category is used
 */
export async function updateCategoryStats(categoryName: string) {
  const slug = generateSlug(categoryName);
  const categoryId = `cat_${slug}_${Date.now()}`;

  // Count topics in this category
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(dailyTopic)
    .where(eq(dailyTopic.category, categoryName));

  const count = Number(countResult[0]?.count || 0);

  // Check if category exists
  const existing = await db.query.categoryStats.findFirst({
    where: eq(categoryStats.name, categoryName),
  });

  if (existing) {
    // Update existing
    await db
      .update(categoryStats)
      .set({
        count,
        lastSeen: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(categoryStats.id, existing.id));
  } else {
    // Create new
    await db.insert(categoryStats).values({
      id: categoryId,
      name: categoryName,
      slug,
      count,
      firstSeen: new Date(),
      lastSeen: new Date(),
      isFeatured: false,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath('/reports');
  return { success: true };
}

/**
 * Batch update all category statistics
 * Run this periodically or after major data changes
 */
export async function syncAllCategoryStats() {
  // Get all unique categories from topics
  const categories = await db
    .selectDistinct({ category: dailyTopic.category })
    .from(dailyTopic);

  for (const { category } of categories) {
    if (category) {
      await updateCategoryStats(category);
    }
  }

  revalidatePath('/reports');
  return { success: true, count: categories.length };
}

/**
 * Get all category statistics
 * Sorted by count (most popular first)
 */
export async function getAllCategories(
  limit?: number
): Promise<CategoryStat[]> {
  const query = db.query.categoryStats.findMany({
    orderBy: [desc(categoryStats.count)],
    limit: limit,
  });

  const results = await query;

  // Serialize Date objects to strings for React Server Components
  const serialized = results.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: cat.count,
    firstSeen: cat.firstSeen.toISOString(),
    lastSeen: cat.lastSeen.toISOString(),
    isFeatured: cat.isFeatured,
    displayOrder: cat.displayOrder,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }));

  // Force deep serialization to catch any non-serializable values
  return JSON.parse(JSON.stringify(serialized));
}

/**
 * Get featured categories (for main navigation)
 */
export async function getFeaturedCategories(): Promise<CategoryStat[]> {
  const results = await db.query.categoryStats.findMany({
    where: eq(categoryStats.isFeatured, true),
    orderBy: [desc(categoryStats.displayOrder), desc(categoryStats.count)],
  });

  // Serialize Date objects to strings for React Server Components
  const serialized = results.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: cat.count,
    firstSeen: cat.firstSeen.toISOString(),
    lastSeen: cat.lastSeen.toISOString(),
    isFeatured: cat.isFeatured,
    displayOrder: cat.displayOrder,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }));

  // Force deep serialization to catch any non-serializable values
  return JSON.parse(JSON.stringify(serialized));
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  slug: string
): Promise<CategoryStat | null> {
  const result = await db.query.categoryStats.findFirst({
    where: eq(categoryStats.slug, slug),
  });

  if (!result) return null;

  // Serialize Date objects to strings for React Server Components
  const serialized = {
    id: result.id,
    name: result.name,
    slug: result.slug,
    count: result.count,
    firstSeen: result.firstSeen.toISOString(),
    lastSeen: result.lastSeen.toISOString(),
    isFeatured: result.isFeatured,
    displayOrder: result.displayOrder,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  };

  // Force deep serialization to catch any non-serializable values
  return JSON.parse(JSON.stringify(serialized));
}

/**
 * Toggle category featured status
 */
export async function toggleCategoryFeatured(categoryId: string) {
  const category = await db.query.categoryStats.findFirst({
    where: eq(categoryStats.id, categoryId),
  });

  if (!category) {
    return { success: false, error: 'Category not found' };
  }

  await db
    .update(categoryStats)
    .set({
      isFeatured: !category.isFeatured,
      updatedAt: new Date(),
    })
    .where(eq(categoryStats.id, categoryId));

  revalidatePath('/reports');
  revalidatePath('/dashboard/reports');
  return { success: true };
}

/**
 * Get archive structure (years and months with counts)
 * Used for time-based navigation
 */
export async function getArchiveStructure(): Promise<ArchiveMonth[]> {
  // Get all published reports grouped by year and month
  const reports = await db.query.dailyReport.findMany({
    where: eq(dailyReport.status, 'published'),
    orderBy: [desc(dailyReport.date)],
  });

  // Group by year and month
  const archiveMap = new Map<string, ArchiveMonth>();

  for (const report of reports) {
    const date = new Date(report.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const key = `${year}-${month}`;

    if (!archiveMap.has(key)) {
      archiveMap.set(key, {
        year,
        month,
        count: 0,
        days: [],
      });
    }

    const archive = archiveMap.get(key)!;
    archive.count++;
    archive.days.push({
      date: new Date(report.date).toISOString(),
      reportId: report.id,
      topicCount: 0, // Will be filled if needed
    });
  }

  // Convert to array and sort
  const archives = Array.from(archiveMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return archives;
}

/**
 * Get reports for a specific year and month
 */
export async function getReportsByMonth(year: number, month: number) {
  const reports = await db.query.dailyReport.findMany({
    where: sql`${dailyReport.year} = ${year} AND ${dailyReport.month} = ${month} AND ${dailyReport.status} = 'published'`,
    orderBy: [desc(dailyReport.date)],
  });

  // Serialize Date objects to strings for React Server Components
  return reports.map((report) => ({
    ...report,
    date: report.date.toISOString(),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    publishedAt: report.publishedAt?.toISOString() || null,
  }));
}
