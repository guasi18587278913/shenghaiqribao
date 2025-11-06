import { boolean, integer, pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	// 自定义登录字段
	phone: text('phone').unique(), // 手机号
	planetNumber: text('planet_number'), // 星球编号
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	customerId: text('customer_id'),
}, (table) => ({
	userIdIdx: index("user_id_idx").on(table.id),
	userCustomerIdIdx: index("user_customer_id_idx").on(table.customerId),
	userRoleIdx: index("user_role_idx").on(table.role),
	userPhoneIdx: index("user_phone_idx").on(table.phone), // 手机号索引
}));

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	impersonatedBy: text('impersonated_by')
}, (table) => ({
	sessionTokenIdx: index("session_token_idx").on(table.token),
	sessionUserIdIdx: index("session_user_id_idx").on(table.userId),
}));

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
}, (table) => ({
	accountUserIdIdx: index("account_user_id_idx").on(table.userId),
	accountAccountIdIdx: index("account_account_id_idx").on(table.accountId),
	accountProviderIdIdx: index("account_provider_id_idx").on(table.providerId),
}));

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const payment = pgTable("payment", {
	id: text("id").primaryKey(),
	priceId: text('price_id').notNull(),
	type: text('type').notNull(),
	scene: text('scene'), // payment scene: 'lifetime', 'credit', 'subscription'
	interval: text('interval'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	customerId: text('customer_id').notNull(),
	subscriptionId: text('subscription_id'),
	sessionId: text('session_id'),
	invoiceId: text('invoice_id').unique(), // unique constraint for avoiding duplicate processing
	status: text('status').notNull(),
	paid: boolean('paid').notNull().default(false), // indicates whether payment is completed (set in invoice.paid event)
	periodStart: timestamp('period_start'),
	periodEnd: timestamp('period_end'),
	cancelAtPeriodEnd: boolean('cancel_at_period_end'),
	trialStart: timestamp('trial_start'),
	trialEnd: timestamp('trial_end'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	paymentTypeIdx: index("payment_type_idx").on(table.type),
	paymentSceneIdx: index("payment_scene_idx").on(table.scene),
	paymentPriceIdIdx: index("payment_price_id_idx").on(table.priceId),
	paymentUserIdIdx: index("payment_user_id_idx").on(table.userId),
	paymentCustomerIdIdx: index("payment_customer_id_idx").on(table.customerId),
	paymentStatusIdx: index("payment_status_idx").on(table.status),
	paymentPaidIdx: index("payment_paid_idx").on(table.paid),
	paymentSubscriptionIdIdx: index("payment_subscription_id_idx").on(table.subscriptionId),
	paymentSessionIdIdx: index("payment_session_id_idx").on(table.sessionId),
	paymentInvoiceIdIdx: index("payment_invoice_id_idx").on(table.invoiceId),
}));

export const userCredit = pgTable("user_credit", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	currentCredits: integer("current_credits").notNull().default(0),
	lastRefreshAt: timestamp("last_refresh_at"), // deprecated
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	userCreditUserIdIdx: index("user_credit_user_id_idx").on(table.userId),
}));

export const creditTransaction = pgTable("credit_transaction", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	type: text("type").notNull(),
	description: text("description"),
	amount: integer("amount").notNull(),
	remainingAmount: integer("remaining_amount"),
	paymentId: text("payment_id"), // field name is paymentId, but actually it's invoiceId
	expirationDate: timestamp("expiration_date"),
	expirationDateProcessedAt: timestamp("expiration_date_processed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	creditTransactionUserIdIdx: index("credit_transaction_user_id_idx").on(table.userId),
	creditTransactionTypeIdx: index("credit_transaction_type_idx").on(table.type),
}));

// ============================================================================
// Community Daily Report Tables
// ============================================================================

// Daily Reports - Main report table
export const dailyReport = pgTable("daily_report", {
	id: text("id").primaryKey(),
	date: timestamp("date").notNull().unique(), // Report date (one report per day)
	title: text("title").notNull(),
	summary: text("summary"), // AI-generated daily summary
	status: text("status").notNull().default("draft"), // draft, published, archived
	publishedAt: timestamp("published_at"),
	views: integer("views").notNull().default(0),
	likes: integer("likes").notNull().default(0),
	commentCount: integer("comment_count").notNull().default(0),
	year: integer("year"), // Year for archive grouping (e.g., 2024)
	month: integer("month"), // Month for archive grouping (1-12)
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	dailyReportDateIdx: index("daily_report_date_idx").on(table.date),
	dailyReportStatusIdx: index("daily_report_status_idx").on(table.status),
	dailyReportCreatedByIdx: index("daily_report_created_by_idx").on(table.createdBy),
	dailyReportYearMonthIdx: index("daily_report_year_month_idx").on(table.year, table.month),
}));

// Topics - Individual topics within a daily report
export const dailyTopic = pgTable("daily_topic", {
	id: text("id").primaryKey(),
	reportId: text("report_id").notNull().references(() => dailyReport.id, { onDelete: 'cascade' }),
	title: text("title").notNull(),
	summary: text("summary").notNull(), // AI-generated topic summary
	content: text("content"), // Full markdown content (for imported knowledge base articles)
	editorNote: text("editor_note"), // Human editor's additional commentary
	category: text("category").notNull(), // e.g., '技术教程', '产品案例', '出海经验', '工具推荐', '行业动态'
	importance: integer("importance").notNull().default(3), // 1-5 scale
	tags: text("tags").array(), // Array of tags like ['AI编程', '产品出海']
	sourceMessages: text("source_messages"), // JSON string of original message IDs and snippets
	sourceGroup: text("source_group"), // Which WeChat group this topic came from
	views: integer("views").notNull().default(0),
	likes: integer("likes").notNull().default(0),
	commentCount: integer("comment_count").notNull().default(0),
	sortOrder: integer("sort_order").notNull().default(0), // Display order within report
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	dailyTopicReportIdIdx: index("daily_topic_report_id_idx").on(table.reportId),
	dailyTopicCategoryIdx: index("daily_topic_category_idx").on(table.category),
	dailyTopicImportanceIdx: index("daily_topic_importance_idx").on(table.importance),
	dailyTopicSortOrderIdx: index("daily_topic_sort_order_idx").on(table.sortOrder),
}));

// Raw Messages - Store all original WeChat messages
export const rawMessage = pgTable("raw_message", {
	id: text("id").primaryKey(),
	groupName: text("group_name").notNull(), // Name of WeChat group (1 of 4 groups)
	senderName: text("sender_name").notNull(),
	senderId: text("sender_id"), // For deduplication if available
	content: text("content").notNull(),
	messageType: text("message_type").notNull().default("text"), // text, image, link, file
	timestamp: timestamp("timestamp").notNull(),
	isProcessed: boolean("is_processed").notNull().default(false),
	aiScore: integer("ai_score"), // AI-assigned value score (0-100)
	category: text("category"), // Initial AI categorization
	linkedTopicId: text("linked_topic_id").references(() => dailyTopic.id, { onDelete: 'set null' }), // Link to topic if used
	createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
	rawMessageTimestampIdx: index("raw_message_timestamp_idx").on(table.timestamp),
	rawMessageIsProcessedIdx: index("raw_message_is_processed_idx").on(table.isProcessed),
	rawMessageGroupNameIdx: index("raw_message_group_name_idx").on(table.groupName),
	rawMessageAiScoreIdx: index("raw_message_ai_score_idx").on(table.aiScore),
	rawMessageLinkedTopicIdIdx: index("raw_message_linked_topic_id_idx").on(table.linkedTopicId),
}));

// Comments - Discussion system for reports and topics
export const comment = pgTable("comment", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	targetType: text("target_type").notNull(), // 'report' or 'topic'
	targetId: text("target_id").notNull(), // ID of report or topic
	parentId: text("parent_id"), // For nested comments (max 3 levels)
	content: text("content").notNull(),
	likes: integer("likes").notNull().default(0),
	isFeatured: boolean("is_featured").notNull().default(false), // Highlight quality comments
	isDeleted: boolean("is_deleted").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	commentTargetIdx: index("comment_target_idx").on(table.targetType, table.targetId),
	commentUserIdIdx: index("comment_user_id_idx").on(table.userId),
	commentParentIdIdx: index("comment_parent_id_idx").on(table.parentId),
	commentCreatedAtIdx: index("comment_created_at_idx").on(table.createdAt),
}));

// User Preferences - Subscription settings for daily reports
export const userPreference = pgTable("user_preference", {
	userId: text("user_id").primaryKey().references(() => user.id, { onDelete: 'cascade' }),
	subscribedTags: text("subscribed_tags").array(), // Tags user is interested in
	emailNotification: boolean("email_notification").notNull().default(true),
	notificationTime: text("notification_time").default("08:00"), // Preferred push time (HH:mm)
	unreadCount: integer("unread_count").notNull().default(0),
	lastViewedAt: timestamp("last_viewed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Knowledge Items - Extracted resources (tools, articles, cases, Q&A)
export const knowledgeItem = pgTable("knowledge_item", {
	id: text("id").primaryKey(),
	type: text("type").notNull(), // 'tool', 'article', 'case', 'qa'
	title: text("title").notNull(),
	description: text("description"),
	url: text("url"), // External link if applicable
	content: text("content"), // Main content for Q&A
	tags: text("tags").array(),
	referencedInTopics: text("referenced_in_topics").array(), // Array of topic IDs
	views: integer("views").notNull().default(0),
	likes: integer("likes").notNull().default(0),
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	knowledgeItemTypeIdx: index("knowledge_item_type_idx").on(table.type),
	knowledgeItemCreatedByIdx: index("knowledge_item_created_by_idx").on(table.createdBy),
}));

// Knowledge Collections - Themed collections of topics (e.g., "Claude Complete Guide")
export const knowledgeCollection = pgTable("knowledge_collection", {
	id: text("id").primaryKey(),
	title: text("title").notNull(), // e.g., "账号与设备完全指南"
	slug: text("slug").notNull().unique(), // URL-friendly slug
	description: text("description"), // Description of the collection
	category: text("category").notNull(), // Same as topic category
	icon: text("icon").notNull().default("📚"), // Emoji icon
	// Optional time range for the collection
	periodStart: timestamp("period_start"), // e.g., 2024-10-14
	periodEnd: timestamp("period_end"), // e.g., 2024-11-05
	// Statistics
	topicCount: integer("topic_count").notNull().default(0),
	views: integer("views").notNull().default(0),
	likes: integer("likes").notNull().default(0),
	// Special flags
	isFeatured: boolean("is_featured").notNull().default(false), // Show on homepage
	isPinned: boolean("is_pinned").notNull().default(false), // Pin to top
	// Editor notes
	curatorNote: text("curator_note"), // Editor's note about the collection
	sortOrder: integer("sort_order").notNull().default(0), // Display order
	// Meta
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	knowledgeCollectionCategoryIdx: index("knowledge_collection_category_idx").on(table.category),
	knowledgeCollectionSlugIdx: index("knowledge_collection_slug_idx").on(table.slug),
	knowledgeCollectionFeaturedIdx: index("knowledge_collection_featured_idx").on(table.isFeatured),
	knowledgeCollectionSortOrderIdx: index("knowledge_collection_sort_order_idx").on(table.sortOrder),
}));

// Collection Topics - Many-to-many relationship between collections and topics
export const collectionTopic = pgTable("collection_topic", {
	id: text("id").primaryKey(),
	collectionId: text("collection_id").notNull().references(() => knowledgeCollection.id, { onDelete: 'cascade' }),
	topicId: text("topic_id").notNull().references(() => dailyTopic.id, { onDelete: 'cascade' }),
	// Ordering and notes specific to this collection
	sortOrder: integer("sort_order").notNull().default(0), // Order within the collection
	curatorNote: text("curator_note"), // Editor's note for this specific topic in this collection
	// Meta
	addedAt: timestamp("added_at").notNull().defaultNow(),
	addedBy: text("added_by").references(() => user.id, { onDelete: 'set null' }),
}, (table) => ({
	collectionTopicCollectionIdIdx: index("collection_topic_collection_id_idx").on(table.collectionId),
	collectionTopicTopicIdIdx: index("collection_topic_topic_id_idx").on(table.topicId),
	collectionTopicSortOrderIdx: index("collection_topic_sort_order_idx").on(table.sortOrder),
}));

// ============================================================================
// Category Statistics Table
// ============================================================================

// Category Stats - Track dynamic categories and their usage
export const categoryStats = pgTable("category_stats", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(), // Category name (e.g., '账号与设备')
	slug: text("slug").notNull().unique(), // URL-friendly slug (e.g., 'account-device')
	icon: text("icon").notNull().default("📁"), // Emoji icon for display (e.g., '🔐')
	description: text("description"), // Short description for hover/tooltip
	count: integer("count").notNull().default(0), // Number of topics in this category
	order: integer("order").notNull().default(0), // Sort order (1-10 for main categories)
	firstSeen: timestamp("first_seen").notNull().defaultNow(), // First time this category appeared
	lastSeen: timestamp("last_seen").notNull().defaultNow(), // Last time this category was used
	isFeatured: boolean("is_featured").notNull().default(false), // Show in main navigation
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	categoryStatsCountIdx: index("category_stats_count_idx").on(table.count),
	categoryStatsFeaturedIdx: index("category_stats_featured_idx").on(table.isFeatured),
	categoryStatsSlugIdx: index("category_stats_slug_idx").on(table.slug),
	categoryStatsOrderIdx: index("category_stats_order_idx").on(table.order),
}));

// ============================================================================
// Official Announcements Table
// ============================================================================

// Announcements - Official community announcements (events, updates, etc.)
export const announcement = pgTable("announcement", {
	id: text("id").primaryKey(),
	title: text("title").notNull(), // Announcement title (e.g., '高强度学习期第2次直播分享')
	content: text("content").notNull(), // Announcement content (supports markdown)
	type: text("type").notNull().default("event"), // event, update, notice
	isPinned: boolean("is_pinned").notNull().default(false), // Pin to top
	status: text("status").notNull().default("published"), // draft, published, archived
	eventDate: timestamp("event_date"), // For events, the event date/time
	eventLink: text("event_link"), // External link (e.g., 小鹅通 link)
	views: integer("views").notNull().default(0),
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	announcementStatusIdx: index("announcement_status_idx").on(table.status),
	announcementTypeIdx: index("announcement_type_idx").on(table.type),
	announcementPinnedIdx: index("announcement_pinned_idx").on(table.isPinned),
	announcementCreatedAtIdx: index("announcement_created_at_idx").on(table.createdAt),
	announcementEventDateIdx: index("announcement_event_date_idx").on(table.eventDate),
}));

// ============================================================================
// Relations
// ============================================================================

export const dailyReportRelations = relations(dailyReport, ({ many }) => ({
	topics: many(dailyTopic),
}));

export const dailyTopicRelations = relations(dailyTopic, ({ one, many }) => ({
	report: one(dailyReport, {
		fields: [dailyTopic.reportId],
		references: [dailyReport.id],
	}),
	collections: many(collectionTopic),
}));

export const knowledgeCollectionRelations = relations(knowledgeCollection, ({ one, many }) => ({
	creator: one(user, {
		fields: [knowledgeCollection.createdBy],
		references: [user.id],
	}),
	topics: many(collectionTopic),
}));

export const collectionTopicRelations = relations(collectionTopic, ({ one }) => ({
	collection: one(knowledgeCollection, {
		fields: [collectionTopic.collectionId],
		references: [knowledgeCollection.id],
	}),
	topic: one(dailyTopic, {
		fields: [collectionTopic.topicId],
		references: [dailyTopic.id],
	}),
	addedByUser: one(user, {
		fields: [collectionTopic.addedBy],
		references: [user.id],
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
}));
