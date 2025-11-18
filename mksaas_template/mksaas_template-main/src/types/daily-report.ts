/**
 * Types for Community Daily Report System
 */

// Report Status
export type ReportStatus = 'draft' | 'published' | 'archived';

// Topic Category (using slugs from REPORT_CATEGORIES)
export type TopicCategory =
  // 历史英文 slug（兼容旧数据）
  | 'overseas-experience'
  | 'qa-selection'
  | 'industry-trends'
  | 'network-proxy'
  | 'tech-tools'
  // 中文分类（当前主用）
  | '技术教程'
  | '产品案例'
  | '出海经验'
  | '工具推荐'
  | '行业动态'
  | '问答精选'
  | '账号与设备'
  | '网络与代理'
  | '支付与订阅'
  | '开发工具'
  | '项目执行'
  | '产品与增长'
  | '社群与学习'
  | '学习认知与避坑'
  | '成本规划'
  | '设备与环境';

// Knowledge Item Type
export type KnowledgeItemType = 'tool' | 'article' | 'case' | 'qa';

// Message Type
export type MessageType = 'text' | 'image' | 'link' | 'file';

// Comment Target Type
export type CommentTargetType = 'report' | 'topic';

// Daily Report
export interface DailyReport {
  id: string;
  date: Date | string;
  title: string;
  summary?: string | null; // Allow null from database
  status: ReportStatus | string; // Allow string from database queries
  publishedAt?: Date | string | null;
  views: number;
  likes: number;
  commentCount: number;
  year?: number | null; // Allow null from database
  month?: number | null; // Allow null from database
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Daily Topic
export interface DailyTopic {
  id: string;
  reportId: string;
  title: string;
  summary: string;
  content?: string; // Full markdown content for imported knowledge base articles
  editorNote?: string;
  category: TopicCategory;
  importance: number; // 1-5
  tags: string[];
  sourceMessages?: string; // JSON string
  sourceGroup?: string;
  views: number;
  likes: number;
  commentCount: number;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Raw Message
export interface RawMessage {
  id: string;
  groupName: string;
  senderName: string;
  senderId?: string;
  content: string;
  messageType: MessageType;
  timestamp: Date;
  isProcessed: boolean;
  aiScore?: number; // 0-100
  category?: string;
  linkedTopicId?: string;
  createdAt: Date;
}

// Comment
export interface Comment {
  id: string;
  userId: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
  content: string;
  likes: number;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Relations (not in DB, populated at runtime)
  user?: {
    id: string;
    name: string;
    image?: string;
  };
  replies?: Comment[];
}

// User Preference
export interface UserPreference {
  userId: string;
  subscribedTags: string[];
  emailNotification: boolean;
  notificationTime: string; // HH:mm format
  unreadCount: number;
  lastViewedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Knowledge Item
export interface KnowledgeItem {
  id: string;
  type: KnowledgeItemType;
  title: string;
  description?: string;
  url?: string;
  content?: string;
  tags: string[];
  referencedInTopics: string[];
  views: number;
  likes: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// Create Daily Report
export interface CreateDailyReportInput {
  date: Date;
  title: string;
  summary?: string;
}

// Update Daily Report
export interface UpdateDailyReportInput {
  title?: string;
  summary?: string;
  status?: ReportStatus;
}

// Create Topic
export interface CreateTopicInput {
  reportId: string;
  title: string;
  summary: string;
  editorNote?: string;
  category: TopicCategory;
  importance?: number;
  tags?: string[];
  sourceMessages?: string;
  sourceGroup?: string;
  sortOrder?: number;
}

// Update Topic
export interface UpdateTopicInput {
  title?: string;
  summary?: string;
  editorNote?: string;
  category?: TopicCategory;
  importance?: number;
  tags?: string[];
  sortOrder?: number;
}

// Upload Messages Input
export interface UploadMessagesInput {
  groupName: string;
  messages: {
    senderName: string;
    senderId?: string;
    content: string;
    messageType?: MessageType;
    timestamp: Date;
  }[];
}

// AI Processing Result
export interface AIProcessingResult {
  filteredMessages: RawMessage[];
  suggestedTopics: {
    title: string;
    summary: string;
    category: TopicCategory;
    importance: number;
    tags: string[];
    relatedMessageIds: string[];
  }[];
  dailySummary: string;
}

// Create Comment Input
export interface CreateCommentInput {
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
  content: string;
}

// Update User Preference Input
export interface UpdateUserPreferenceInput {
  subscribedTags?: string[];
  emailNotification?: boolean;
  notificationTime?: string;
}

// Daily Report with Topics
export interface DailyReportWithTopics extends DailyReport {
  topics: DailyTopic[];
}

// Topic with Comments
export interface TopicWithComments extends DailyTopic {
  comments: Comment[];
}

// Statistics
export interface DailyReportStats {
  totalReports: number;
  totalTopics: number;
  totalComments: number;
  totalViews: number;
  averageTopicsPerReport: number;
  topCategories: {
    category: TopicCategory;
    count: number;
  }[];
  topTags: {
    tag: string;
    count: number;
  }[];
}

// ============================================================================
// Category Statistics
// ============================================================================

export interface CategoryStat {
  id: string;
  name: string;
  slug: string;
  count: number;
  firstSeen: Date | string;
  lastSeen: Date | string;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Archive Structure for Time Navigation
export interface ArchiveMonth {
  year: number;
  month: number;
  count: number;
  days: ArchiveDay[];
}

export interface ArchiveDay {
  date: Date | string;
  reportId: string;
  topicCount: number;
}
