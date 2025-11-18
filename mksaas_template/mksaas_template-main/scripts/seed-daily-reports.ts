/**
 * Seed test data for daily reports
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { dailyReport, dailyTopic, user } from '../src/db/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function seedDailyReports() {
  console.log('🌱 Starting to seed daily reports...');

  try {
    // Create test user first
    const testUserId = 'test_user_001';

    console.log('📝 Creating test user...');
    await db
      .insert(user)
      .values({
        id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user',
        banned: false,
        banReason: null,
        banExpires: null,
        customerId: null,
      })
      .onConflictDoNothing();

    console.log('✅ Test user created or already exists');

    // 1. Create first daily report
    const report1Id = `report_${Date.now()}_1`;
    await db.insert(dailyReport).values({
      id: report1Id,
      date: new Date('2024-11-01'),
      title: '2024-11-01 AI出海社群日报',
      summary:
        '今天社群讨论了多个热点话题，包括 Cursor 新功能测评、独立开发者变现经验分享、以及 AI 工具的最新进展。',
      status: 'published',
      views: 128,
      likes: 23,
      commentCount: 5,
      createdBy: testUserId,
      createdAt: new Date('2024-11-01T08:00:00'),
      updatedAt: new Date('2024-11-01T08:00:00'),
      publishedAt: new Date('2024-11-01T08:00:00'),
    });

    console.log('✅ Created report 1');

    // Create topics for report 1
    // @ts-expect-error - Drizzle type inference issue with array inserts
    await db.insert(dailyTopic).values([
      {
        id: `topic_${Date.now()}_1`,
        reportId: report1Id,
        title: 'Cursor 编辑器新功能深度测评',
        summary:
          '多位开发者分享了 Cursor 最新版本的使用体验，重点讨论了 AI 代码补全的准确性提升、多文件编辑功能、以及与 VSCode 插件的兼容性。大家普遍认为新版本在代码理解和上下文感知方面有显著改进。',
        editorNote:
          '💡 编辑点评：Cursor 作为 AI 编程工具的佼佼者，这次更新确实值得关注，特别是对独立开发者来说，能大幅提升开发效率。',
        category: '工具推荐',
        importance: 5,
        tags: ['AI编程', 'Cursor', '开发工具'],
        sourceMessages: [],
        sourceGroup: 'group1',
        views: 89,
        likes: 15,
        commentCount: 3,
        sortOrder: 0,
        createdAt: new Date('2024-11-01T08:00:00'),
        updatedAt: new Date('2024-11-01T08:00:00'),
      },
      {
        id: `topic_${Date.now()}_2`,
        reportId: report1Id,
        title: '独立开发者月入 $5000 的变现经验',
        summary:
          '一位独立开发者分享了他的 SaaS 产品从 0 到 $5000 MRR 的完整历程。重点包括：产品定位、获客渠道（主要是 Twitter + Product Hunt）、定价策略（$29/月）、以及如何在保持全职工作的同时运营副业。',
        editorNote: '',
        category: '产品案例',
        importance: 5,
        tags: ['独立开发', '变现', 'SaaS'],
        sourceMessages: [],
        sourceGroup: 'group1',
        views: 102,
        likes: 28,
        commentCount: 7,
        sortOrder: 1,
        createdAt: new Date('2024-11-01T08:00:00'),
        updatedAt: new Date('2024-11-01T08:00:00'),
      },
      {
        id: `topic_${Date.now()}_3`,
        reportId: report1Id,
        title: 'Next.js 15 新特性解析',
        summary:
          'Next.js 15 正式发布，带来了多项重要更新：React 19 支持、改进的缓存策略、更快的构建速度、以及全新的开发者工具。社群成员讨论了升级方案和潜在的兼容性问题。',
        editorNote: '',
        category: '技术教程',
        importance: 4,
        tags: ['Next.js', 'React', '前端开发'],
        sourceMessages: [],
        sourceGroup: 'group2',
        views: 76,
        likes: 12,
        commentCount: 2,
        sortOrder: 2,
        createdAt: new Date('2024-11-01T08:00:00'),
        updatedAt: new Date('2024-11-01T08:00:00'),
      },
      {
        id: `topic_${Date.now()}_4`,
        reportId: report1Id,
        title: 'Stripe 支付集成最佳实践',
        summary:
          '群内开发者讨论了 Stripe 支付集成的各种细节，包括订阅管理、Webhook 处理、退款流程、以及如何应对不同国家的支付方式差异。有人分享了一套完整的 TypeScript 实现代码。',
        editorNote: '',
        category: '技术教程',
        importance: 4,
        tags: ['Stripe', '支付', '后端开发'],
        sourceMessages: [],
        sourceGroup: 'group1',
        views: 54,
        likes: 9,
        commentCount: 1,
        sortOrder: 3,
        createdAt: new Date('2024-11-01T08:00:00'),
        updatedAt: new Date('2024-11-01T08:00:00'),
      },
    ]);

    console.log('✅ Created topics for report 1');

    // 2. Create second daily report
    const report2Id = `report_${Date.now()}_2`;
    await db.insert(dailyReport).values({
      id: report2Id,
      date: new Date('2024-11-02'),
      title: '2024-11-02 AI出海社群日报',
      summary:
        '今天的讨论聚焦在 AI 产品出海策略、SEO 优化技巧、以及开源项目变现方案上。',
      status: 'published',
      views: 95,
      likes: 18,
      commentCount: 3,
      createdBy: testUserId,
      createdAt: new Date('2024-11-02T08:00:00'),
      updatedAt: new Date('2024-11-02T08:00:00'),
      publishedAt: new Date('2024-11-02T08:00:00'),
    });

    console.log('✅ Created report 2');

    // Create topics for report 2
    // @ts-expect-error - Drizzle type inference issue with array inserts
    await db.insert(dailyTopic).values([
      {
        id: `topic_${Date.now()}_5`,
        reportId: report2Id,
        title: 'AI 产品如何做好国际化',
        summary:
          '几位已经成功出海的产品负责人分享了国际化经验：多语言支持不只是翻译、支付方式要本地化、客服要考虑时区差异。特别强调了文化适配的重要性。',
        editorNote:
          '💡 编辑点评：国际化是出海必修课，这些经验都是真金白银换来的。',
        category: '出海经验',
        importance: 5,
        tags: ['国际化', '出海', 'AI产品'],
        sourceMessages: [],
        sourceGroup: 'group1',
        views: 67,
        likes: 11,
        commentCount: 2,
        sortOrder: 0,
        createdAt: new Date('2024-11-02T08:00:00'),
        updatedAt: new Date('2024-11-02T08:00:00'),
      },
      {
        id: `topic_${Date.now()}_6`,
        reportId: report2Id,
        title: 'SEO 优化实战：如何让网站排名前三',
        summary:
          '一位 SEO 专家分享了他的实战经验：关键词研究、内容质量、外链建设、以及技术 SEO（Core Web Vitals、结构化数据等）。特别提到了 AI 时代 SEO 的新变化。',
        editorNote: '',
        category: '技术教程',
        importance: 4,
        tags: ['SEO', '流量增长', '营销'],
        sourceMessages: [],
        sourceGroup: 'group2',
        views: 58,
        likes: 8,
        commentCount: 1,
        sortOrder: 1,
        createdAt: new Date('2024-11-02T08:00:00'),
        updatedAt: new Date('2024-11-02T08:00:00'),
      },
      {
        id: `topic_${Date.now()}_7`,
        reportId: report2Id,
        title: '开源项目变现的 5 种方式',
        summary:
          '讨论了开源项目的多种变现模式：Pro 版本付费、托管服务、技术支持、企业授权、以及捐赠/赞助。多个成功案例分享了各自的选择和原因。',
        editorNote: '',
        category: '产品案例',
        importance: 4,
        tags: ['开源', '变现', '商业模式'],
        sourceMessages: [],
        sourceGroup: 'group1',
        views: 71,
        likes: 13,
        commentCount: 4,
        sortOrder: 2,
        createdAt: new Date('2024-11-02T08:00:00'),
        updatedAt: new Date('2024-11-02T08:00:00'),
      },
    ]);

    console.log('✅ Created topics for report 2');

    // 3. Create a draft report
    const report3Id = `report_${Date.now()}_3`;
    await db.insert(dailyReport).values({
      id: report3Id,
      date: new Date('2024-11-03'),
      title: '2024-11-03 AI出海社群日报（草稿）',
      summary: '今日话题正在整理中...',
      status: 'draft',
      views: 0,
      likes: 0,
      commentCount: 0,
      createdBy: testUserId,
      createdAt: new Date('2024-11-03T08:00:00'),
      updatedAt: new Date('2024-11-03T08:00:00'),
      publishedAt: null,
    });

    console.log('✅ Created report 3 (draft)');

    console.log('');
    console.log('🎉 Seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - Created 3 daily reports (2 published, 1 draft)');
    console.log('  - Created 7 topics');
    console.log('');
    console.log('🌐 You can now visit:');
    console.log('  - http://localhost:3000/reports');
    console.log('  - http://localhost:3000/reports/' + report1Id);
    console.log('  - http://localhost:3000/reports/' + report2Id);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedDailyReports();
