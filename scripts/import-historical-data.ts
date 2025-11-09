import { nanoid } from 'nanoid';
import { db } from '../src/db/index';
import { dailyReport, dailyTopic } from '../src/db/schema';
import type { TopicCategory } from '../src/types/daily-report';

/**
 * 批量导入历史聊天记录脚本
 *
 * 使用方法：
 * 1. 修改下面的 historicalData 数组，填入你整理好的内容
 * 2. 运行：pnpm tsx scripts/import-historical-data.ts
 */

interface HistoricalTopic {
  title: string;
  summary: string;
  content: string;
  category: TopicCategory;
  tags?: string[];
  importance?: number; // 1-5，5最重要
  editorNote?: string;
  sourceUrl?: string;
}

interface HistoricalReport {
  date: string; // 格式：'2024-10-14'
  title: string;
  summary?: string;
  topics: HistoricalTopic[];
}

// ============= 在这里填入你的数据 =============
const historicalData: HistoricalReport[] = [
  {
    date: '2024-10-14',
    title: '新人营10月14日精选',
    summary: '今天讨论的主要话题包括...',
    topics: [
      {
        title: 'AI 产品出海的关键要点',
        summary: '讨论了 AI 产品出海需要注意的几个关键点...',
        content: `
## 讨论内容

这里是完整的讨论内容...

### 重点1
...

### 重点2
...
        `.trim(),
        category: 'overseas-experience',
        tags: ['AI', '出海', '产品'],
        importance: 4,
        editorNote: '这个讨论非常有价值，建议重点关注',
      },
      {
        title: '账号注册问题解决方案',
        summary: '分享了几种有效的账号注册方案...',
        content: '详细内容...',
        category: 'tech-tools',
        tags: ['注册', '验证'],
        importance: 3,
      },
      // 添加更多话题...
    ],
  },
  // 添加更多日期的报告...
];

// ============= 导入逻辑（不需要修改）=============

async function importHistoricalData() {
  console.log('🚀 开始导入历史数据...\n');

  // 获取一个真实的用户 ID
  console.log('👤 查找用户...');
  const existingUser = await db.query.user.findFirst();

  if (!existingUser) {
    console.error('❌ 错误：数据库中没有用户，请先注册一个用户！');
    process.exit(1);
  }

  console.log(`✅ 使用用户：${existingUser.email || existingUser.id}\n`);

  let reportCount = 0;
  let topicCount = 0;

  try {
    for (const reportData of historicalData) {
      console.log(`📅 处理日期: ${reportData.date}`);

      // 检查是否已存在
      const existing = await db.query.dailyReport.findFirst({
        where: (report, { eq }) => eq(report.date, new Date(reportData.date)),
      });

      if (existing) {
        console.log(`   ⚠️  ${reportData.date} 的日报已存在，跳过`);
        continue;
      }

      // 创建日报
      const reportId = nanoid();
      const date = new Date(reportData.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const [report] = await db
        .insert(dailyReport)
        .values({
          id: reportId,
          title: reportData.title,
          summary: reportData.summary,
          date: date,
          year,
          month,
          status: 'published',
          views: 0,
          likes: 0,
          commentCount: 0,
          createdBy: existingUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log(`   ✅ 创建日报: ${reportData.title}`);
      reportCount++;

      // 创建话题
      for (let i = 0; i < reportData.topics.length; i++) {
        const topicData = reportData.topics[i];
        const topicId = nanoid();

        await db.insert(dailyTopic).values({
          id: topicId,
          reportId: reportId,
          title: topicData.title,
          summary: topicData.summary,
          content: topicData.content,
          category: topicData.category,
          tags: topicData.tags || [],
          importance: topicData.importance || 3,
          sortOrder: i,
          editorNote: topicData.editorNote,
          views: 0,
          likes: 0,
          commentCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`      - 话题 ${i + 1}: ${topicData.title}`);
        topicCount++;
      }

      console.log('');
    }

    console.log('✨ 导入完成！');
    console.log(`   📊 共导入 ${reportCount} 篇日报`);
    console.log(`   📝 共导入 ${topicCount} 个话题\n`);

    // 同步分类统计
    console.log('🔄 同步分类统计...');
    const { syncAllCategoryStats } = await import(
      '../src/actions/category-stats'
    );
    await syncAllCategoryStats();
    console.log('✅ 分类统计已同步\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 导入失败：');
    console.error(error);
    process.exit(1);
  }
}

// 运行导入
importHistoricalData();
