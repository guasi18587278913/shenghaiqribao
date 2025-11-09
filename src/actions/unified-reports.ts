'use server'

import { db } from '@/db'
import { dailyReport, dailyTopic, knowledgeCollection, collectionTopic, categoryStats } from '@/db/schema'
import { eq, and, desc, asc, sql, inArray } from 'drizzle-orm'
import { format } from 'date-fns'
import { getCategorySlug, getCategoryIcon, getCategoryName } from '@/lib/category-helpers'

// ============================================================================
// Category Management
// ============================================================================

/**
 * Get category statistics with topic counts
 */
export async function getCategoryStats() {
	try {
		const stats = await db
			.select({
				category: dailyTopic.category,
				count: sql<number>`count(*)::int`,
			})
			.from(dailyTopic)
			.groupBy(dailyTopic.category)

		// Map to category info with slugs
		return stats.map((stat) => ({
			name: stat.category,
			slug: getCategorySlug(stat.category),
			icon: getCategoryIcon(stat.category),
			count: stat.count,
		}))
	} catch (error) {
		console.error('Failed to get category stats:', error)
		return []
	}
}

/**
 * Get featured categories from category_stats table
 */
export async function getFeaturedCategories() {
	try {
		return await db.query.categoryStats.findMany({
			where: eq(categoryStats.isFeatured, true),
			orderBy: asc(categoryStats.order),
		})
	} catch (error) {
		console.error('Failed to get featured categories:', error)
		return []
	}
}

// ============================================================================
// Date View (Reports by Date)
// ============================================================================

/**
 * Get reports by month with optional category filter
 */
export async function getReportsByMonth(
	year: number,
	month: number,
	category?: string | null,
) {
	try {
		const reports = await db.query.dailyReport.findMany({
			where: and(
				eq(dailyReport.year, year),
				eq(dailyReport.month, month),
				eq(dailyReport.status, 'published'),
			),
			with: {
				topics: true,
			},
			orderBy: desc(dailyReport.date),
		})

		// If category filter is applied, filter reports that have topics in that category
		if (category) {
			return reports.filter((report) =>
				report.topics.some((topic) => getCategorySlug(topic.category) === category),
			)
		}

		return reports
	} catch (error) {
		console.error('Failed to get reports by month:', error)
		return []
	}
}

/**
 * Get report with topics by ID
 */
export async function getReportWithTopics(reportId: string) {
	try {
		return await db.query.dailyReport.findFirst({
			where: eq(dailyReport.id, reportId),
			with: {
				topics: {
					orderBy: asc(dailyTopic.sortOrder),
				},
			},
		})
	} catch (error) {
		console.error('Failed to get report with topics:', error)
		return null
	}
}

// ============================================================================
// Topic View (Knowledge Collections)
// ============================================================================

/**
 * Get collections by category
 */
export async function getCollectionsByCategory(category: string) {
	try {
		return await db.query.knowledgeCollection.findMany({
			where: eq(knowledgeCollection.category, category),
			orderBy: [desc(knowledgeCollection.isPinned), desc(knowledgeCollection.topicCount)],
		})
	} catch (error) {
		console.error('Failed to get collections by category:', error)
		return []
	}
}

/**
 * Get featured collections
 */
export async function getFeaturedCollections() {
	try {
		return await db.query.knowledgeCollection.findMany({
			where: eq(knowledgeCollection.isFeatured, true),
			orderBy: [asc(knowledgeCollection.sortOrder), desc(knowledgeCollection.topicCount)],
		})
	} catch (error) {
		console.error('Failed to get featured collections:', error)
		return []
	}
}

/**
 * Get all collections grouped by category
 */
export async function getAllCollectionsGrouped() {
	try {
		const collections = await db.query.knowledgeCollection.findMany({
			orderBy: [asc(knowledgeCollection.category), desc(knowledgeCollection.topicCount)],
		})

		// Group by category
		const grouped: Record<string, typeof collections> = {}
		for (const collection of collections) {
			if (!grouped[collection.category]) {
				grouped[collection.category] = []
			}
			grouped[collection.category].push(collection)
		}

		return grouped
	} catch (error) {
		console.error('Failed to get all collections:', error)
		return {}
	}
}

/**
 * Get collection with topics by slug
 */
export async function getCollectionWithTopics(slug: string) {
	try {
		const collection = await db.query.knowledgeCollection.findFirst({
			where: eq(knowledgeCollection.slug, slug),
		})

		if (!collection) return null

		// Get topics in this collection with their metadata
		const topicsInCollection = await db.query.collectionTopic.findMany({
			where: eq(collectionTopic.collectionId, collection.id),
			with: {
				topic: true,
			},
			orderBy: asc(collectionTopic.sortOrder),
		})

		return {
			collection,
			topics: topicsInCollection.map((ct) => ({
				...ct.topic,
				curatorNote: ct.curatorNote,
				sortOrderInCollection: ct.sortOrder,
			})),
		}
	} catch (error) {
		console.error('Failed to get collection with topics:', error)
		return null
	}
}

/**
 * Get topics by category (for when there are no collections)
 */
export async function getTopicsByCategory(
	category: string,
	page: number = 1,
	pageSize: number = 20,
) {
	try {
		const offset = (page - 1) * pageSize

		const topics = await db.query.dailyTopic.findMany({
			where: eq(dailyTopic.category, category),
			orderBy: [desc(dailyTopic.importance), desc(dailyTopic.createdAt)],
			limit: pageSize,
			offset: offset,
		})

		const totalCount = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(dailyTopic)
			.where(eq(dailyTopic.category, category))

		return {
			topics,
			totalCount: totalCount[0]?.count || 0,
			totalPages: Math.ceil((totalCount[0]?.count || 0) / pageSize),
		}
	} catch (error) {
		console.error('Failed to get topics by category:', error)
		return {
			topics: [],
			totalCount: 0,
			totalPages: 0,
		}
	}
}

/**
 * Get topics that belong to a specific collection
 */
export async function getTopicCollections(topicId: string) {
	try {
		const results = await db.query.collectionTopic.findMany({
			where: eq(collectionTopic.topicId, topicId),
			with: {
				collection: true,
			},
		})

		return results.map((r) => r.collection)
	} catch (error) {
		console.error('Failed to get topic collections:', error)
		return []
	}
}

// Helper functions are now in @/lib/category-helpers
