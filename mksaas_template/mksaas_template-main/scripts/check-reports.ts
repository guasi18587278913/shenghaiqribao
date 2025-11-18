import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);

async function main() {
  console.log('🔍 检查数据库中的日报...\n');

  // 查看所有日报
  const reports = await client`
    SELECT id, date, title, status, created_at
    FROM daily_report
    ORDER BY date DESC
    LIMIT 10
  `;

  console.log(`📊 找到 ${reports.length} 个日报:\n`);

  for (const report of reports) {
    console.log(`📝 ID: ${report.id}`);
    console.log(`   标题: ${report.title}`);
    console.log(`   日期: ${report.date}`);
    console.log(`   状态: ${report.status}`);
    console.log(`   创建时间: ${report.created_at}`);
    console.log('');
  }

  // 统计各状态的日报数量
  const stats = await client`
    SELECT status, COUNT(*) as count
    FROM daily_report
    GROUP BY status
  `;

  console.log('📈 日报状态统计:');
  for (const stat of stats) {
    console.log(`   ${stat.status}: ${stat.count} 个`);
  }

  await client.end();
}

main().catch(console.error);
