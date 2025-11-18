require('dotenv/config');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function checkStatus() {
  try {
    // 检查特殊日报
    const report = await sql`
      SELECT
        id,
        title,
        status,
        published_at,
        created_at,
        updated_at
      FROM daily_report
      WHERE id = 'special-knowledge-essentials-2024-10'
    `;

    console.log('\n=== 📋 日报状态 ===');
    if (report.length > 0) {
      const r = report[0];
      console.log(`标题: ${r.title}`);
      console.log(`ID: ${r.id}`);
      console.log(`状态: ${r.status}`);
      console.log(`发布时间: ${r.published_at}`);
      console.log(`创建时间: ${r.created_at}`);
      console.log(`更新时间: ${r.updated_at}`);
    } else {
      console.log('❌ 未找到特殊日报');
    }

    // 检查话题数量
    const topicCount = await sql`
      SELECT COUNT(*)::int as count
      FROM daily_topic
      WHERE report_id = 'special-knowledge-essentials-2024-10'
    `;

    console.log(`\n话题数量: ${topicCount[0].count}篇`);

    // 检查所有日报
    const allReports = await sql`
      SELECT id, title, status, created_at
      FROM daily_report
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('\n\n=== 📊 最近的日报列表 ===');
    allReports.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.title}`);
      console.log(`   ID: ${r.id}`);
      console.log(`   状态: ${r.status}`);
      console.log(`   时间: ${r.created_at}`);
    });

    await sql.end();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkStatus();
