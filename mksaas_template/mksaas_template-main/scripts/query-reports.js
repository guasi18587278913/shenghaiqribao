require('dotenv/config');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function queryReports() {
  try {
    // 查询特殊日报
    const reports = await sql`
      SELECT id, title, summary, created_at
      FROM daily_report
      WHERE id LIKE 'special-%'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('\n=== 📊 特殊日报列表 ===');
    reports.forEach((report, index) => {
      console.log(`\n${index + 1}. ${report.title}`);
      console.log(`   ID: ${report.id}`);
      console.log(`   摘要: ${report.summary || '无'}`);
      console.log(`   创建时间: ${report.created_at}`);
    });

    // 查询话题分类统计
    const categoryStats = await sql`
      SELECT
        dt.category,
        COUNT(*)::int as count,
        COUNT(DISTINCT dt.report_id)::int as report_count
      FROM daily_topic dt
      WHERE dt.report_id LIKE 'special-%'
      GROUP BY dt.category
      ORDER BY count DESC
    `;

    console.log('\n\n=== 📁 话题分类统计 ===');
    let totalTopics = 0;
    categoryStats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.category}: ${stat.count}篇`);
      totalTopics += Number.parseInt(stat.count);
    });

    console.log(`\n总计: ${totalTopics}篇话题`);

    // 查询每个报告的话题数量
    const reportTopics = await sql`
      SELECT
        dr.id,
        dr.title,
        COUNT(dt.id)::int as topic_count
      FROM daily_report dr
      LEFT JOIN daily_topic dt ON dr.id = dt.report_id
      WHERE dr.id LIKE 'special-%'
      GROUP BY dr.id, dr.title
      ORDER BY dr.created_at DESC
    `;

    console.log('\n\n=== 📋 每个报告的话题统计 ===');
    reportTopics.forEach((report, index) => {
      console.log(`${index + 1}. ${report.title}: ${report.topic_count}篇话题`);
    });

    // 查询一些示例话题
    const sampleTopics = await sql`
      SELECT
        dt.title,
        dt.category,
        dt.importance,
        LENGTH(dt.content)::int as content_length,
        dt.tags
      FROM daily_topic dt
      WHERE dt.report_id LIKE 'special-%'
      ORDER BY dt.importance DESC
      LIMIT 5
    `;

    console.log('\n\n=== 📝 示例话题（按重要度排序） ===');
    sampleTopics.forEach((topic, index) => {
      console.log(`\n${index + 1}. ${topic.title}`);
      console.log(`   分类: ${topic.category}`);
      console.log(`   重要度: ${topic.importance}星`);
      console.log(`   内容长度: ${topic.content_length}字符`);
      console.log(`   标签: ${topic.tags ? topic.tags.join(', ') : '无'}`);
    });

    await sql.end();
  } catch (error) {
    console.error('❌ 查询错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

queryReports();
