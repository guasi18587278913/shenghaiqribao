'use server'

import { db } from '@/db'
import { dailyReport, dailyTopic, categoryStats } from '@/db/schema'
// Note: knowledgeCollection and collectionTopic tables don't exist in current schema
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

// Define temporary type for collections until schema is implemented
interface KnowledgeCollection {
	id: string
	slug: string
	title: string
	description: string | null
	icon: string
	category: string
	isFeatured: boolean
	topicCount: number
	views: number
	periodStart: Date | null
	periodEnd: Date | null
	createdAt: string
	updatedAt: string
}

/**
 * Get collections by category
 * NOTE: Disabled - knowledgeCollection table doesn't exist in current schema
 */
export async function getCollectionsByCategory(category: string): Promise<KnowledgeCollection[]> {
	// TODO: Re-enable when knowledgeCollection table is added to schema
	console.warn('getCollectionsByCategory: knowledgeCollection table not implemented')
	return []
}

/**
 * Get featured collections
 * NOTE: Disabled - knowledgeCollection table doesn't exist in current schema
 */
export async function getFeaturedCollections(): Promise<KnowledgeCollection[]> {
	console.warn('getFeaturedCollections: knowledgeCollection table not implemented')
	return []
}

/**
 * Get all collections grouped by category
 * NOTE: Disabled - knowledgeCollection table doesn't exist in current schema
 */
export async function getAllCollectionsGrouped() {
	console.warn('getAllCollectionsGrouped: knowledgeCollection table not implemented')
	return {}
}

/**
 * Get collection with topics by slug
 * NOTE: Disabled - knowledgeCollection and collectionTopic tables don't exist in current schema
 */
export async function getCollectionWithTopics(slug: string) {
	console.warn('getCollectionWithTopics: knowledgeCollection/collectionTopic tables not implemented')
	return null
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
 * NOTE: Disabled - collectionTopic table doesn't exist in current schema
 */
export async function getTopicCollections(topicId: string) {
	console.warn('getTopicCollections: collectionTopic table not implemented')
	return []
}

// Helper functions are now in @/lib/category-helpers
