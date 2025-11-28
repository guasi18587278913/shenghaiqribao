/**
 * 插入测试日报数据
 *
 * 使用方法：
 * 1. 确保数据库已连接
 * 2. 运行：pnpm tsx scripts/insert-test-report.ts
 */

import 'dotenv/config'; // 加载环境变量
import { db } from '../src/db';
import { dailyReport, dailyTopic, user } from '../src/db/schema';

async function main() {
  console.log('🚀 开始插入测试数据...\n');

  // 0. 获取一个真实的用户 ID
  console.log('👤 查找用户...');
  const existingUser = await db.query.user.findFirst();

  if (!existingUser) {
    console.error('❌ 错误：数据库中没有用户，请先注册一个用户！');
    process.exit(1);
  }

  console.log(`✅ 使用用户：${existingUser.email || existingUser.id}\n`);

  // 1. 创建日报
  const reportId = `report_${Date.now()}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('📝 创建日报...');
  await db.insert(dailyReport).values({
    id: reportId,
    date: today,
    title: `${today.toLocaleDateString('zh-CN')} AI出海社群日报`,
    summary: '今日精华内容汇总：Cursor使用技巧、Stripe支付集成、出海经验分享',
    status: 'published',
    publishedAt: new Date(),
    views: 0,
    likes: 0,
    commentCount: 0,
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    createdBy: existingUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`✅ 日报创建成功：${reportId}\n`);

  // 2. 创建话题
  const topics = [
    {
      title: 'Cursor 使用技巧分享',
      category: 'tech-tools',
      summary:
        '今天社群里有小伙伴分享了 Cursor 的几个高级用法，包括如何配置自定义 Rules、如何使用 Composer 模式进行大规模重构、以及如何结合 Claude Code 提升开发效率。这些技巧可以显著提升 AI 编程的体验。',
      content: `## 核心技巧

### 1. 自定义 Rules
在项目根目录创建 \`.cursorrules\` 文件，定义项目特定的开发规范。

### 2. Composer 模式
使用 Cmd+I 进入 Composer 模式，可以一次性修改多个文件。

### 3. 与 Claude Code 配合
- Cursor 用于日常开发
- Claude Code 用于复杂重构和架构设计`,
      importance: 4,
      tags: ['AI编程', 'Cursor', 'Claude'],
      sortOrder: 0,
    },
    {
      title: 'Stripe 支付集成最佳实践',
      category: 'tech-tools',
      summary:
        '分享了 Stripe 支付集成的完整流程，包括订阅管理、Webhook 处理、测试环境配置等。特别强调了 Webhook 验证的重要性，避免安全漏洞。',
      importance: 5,
      tags: ['Stripe', '支付', 'SaaS'],
      sortOrder: 1,
    },
    {
      title: 'AI 产品出海的三个关键点',
      category: 'overseas-experience',
      summary:
        '资深出海开发者总结的三个关键点：1) 选择合适的目标市场，2) 解决支付和合规问题，3) 建立用户反馈循环。其中支付问题最为关键，需要提前规划。',
      importance: 5,
      tags: ['出海', 'AI产品', '经验分享'],
      editorNote: '这是非常实用的经验总结，推荐所有准备出海的朋友仔细阅读。',
      sortOrder: 2,
    },
    {
      title: '如何选择代理服务',
      category: 'network-proxy',
      summary:
        '对比了几种常见的代理服务，分析了性价比、稳定性、速度等因素。推荐新手从性价比高的服务开始，后期根据需求升级。',
      importance: 3,
      tags: ['代理', '网络', '工具'],
      sortOrder: 3,
    },
    {
      title: 'Next.js 15 新特性解析',
      category: 'industry-trends',
      summary:
        'Next.js 15 正式发布，带来了多项重大更新，包括 React 19 支持、Turbopack 稳定版、更快的开发服务器等。这次更新对 SSR 性能有显著提升。',
      importance: 4,
      tags: ['Next.js', 'React', '前端'],
      sortOrder: 4,
    },
  ];

  console.log('📚 创建话题...');
  for (const topic of topics) {
    const topicId = `topic_${Date.now()}_${topic.sortOrder}`;
    await db.insert(dailyTopic).values({
      id: topicId,
      reportId,
      ...topic,
      views: 0,
      likes: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ✅ ${topic.title}`);
  }

  console.log('\n🎉 测试数据插入成功！\n');
  console.log('📍 访问以下地址查看效果：');
  console.log(`   首页：http://localhost:3000/reports`);
  console.log(`   详情：http://localhost:3000/reports/${reportId}\n`);
}

main()
  .then(() => {
    console.log('✨ 完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 错误：', error);
    process.exit(1);
  });
