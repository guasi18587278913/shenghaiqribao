require('dotenv/config');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function queryTopicDetails() {
  try {
    // 按分类查询话题列表
    const categories = [
      '账号与设备',
      '网络与代理',
      '支付与订阅',
      '开发工具',
      '项目执行',
      '产品与增长',
      '社群与学习',
      '学习认知与避坑',
      '成本规划',
    ];

    console.log('\n=== 📚 详细话题列表（按分类） ===\n');

    for (const category of categories) {
      const topics = await sql`
        SELECT title, importance, tags, LENGTH(content)::int as content_length
        FROM daily_topic
        WHERE report_id = 'special-knowledge-essentials-2024-10'
          AND category = ${category}
        ORDER BY importance DESC, title
      `;

      if (topics.length > 0) {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📁 ${category} (${topics.length}篇)`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        topics.forEach((topic, index) => {
          console.log(`\n  ${index + 1}. ${topic.title}`);
          console.log(`     重要度: ${'⭐'.repeat(topic.importance)}`);
          console.log(`     内容长度: ${topic.content_length}字符`);
        });
      }
    }

    // 查询几个话题的完整内容示例
    console.log('\n\n=== 📄 话题内容示例 ===\n');

    const sampleTopics = await sql`
      SELECT title, category, content, importance
      FROM daily_topic
      WHERE report_id = 'special-knowledge-essentials-2024-10'
      ORDER BY importance DESC
      LIMIT 3
    `;

    sampleTopics.forEach((topic, index) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📝 示例 ${index + 1}: ${topic.title}`);
      console.log(
        `分类: ${topic.category} | 重要度: ${'⭐'.repeat(topic.importance)}`
      );
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(topic.content.substring(0, 300) + '...\n');
    });

    await sql.end();
  } catch (error) {
    console.error('❌ 查询错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

queryTopicDetails();
