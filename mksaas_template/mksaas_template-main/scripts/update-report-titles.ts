/**
 * 更新日报标题脚本
 * 将 "AI出海社群日报" 改为 "AI产品出海群聊精华"
 * 运行: npx tsx scripts/update-report-titles.ts
 */

import 'dotenv/config';
import { db } from '@/db';
import { dailyReport } from '@/db/schema';
import { like, sql } from 'drizzle-orm';

async function updateReportTitles() {
  console.log('🚀 开始更新日报标题...\n');

  // 查找包含 "AI出海社群日报" 的报告
  console.log('🔍 查找需要更新的报告...');
  const reports = await db
    .select()
    .from(dailyReport)
    .where(like(dailyReport.title, '%AI出海社群日报%'));

  if (reports.length === 0) {
    console.log('✅ 没有需要更新的报告。\n');
    return;
  }

  console.log(`📊 找到 ${reports.length} 个需要更新的报告:\n`);
  for (const report of reports) {
    console.log(
      `  - ${report.date.toISOString().split('T')[0]}: ${report.title}`
    );
  }

  // 执行更新
  console.log('\n📝 执行更新...');
  await db.execute(sql`
    UPDATE daily_report
    SET title = REPLACE(title, 'AI出海社群日报', 'AI产品出海群聊精华'),
        updated_at = NOW()
    WHERE title LIKE '%AI出海社群日报%'
  `);

  // 验证更新结果
  console.log('\n🔍 验证更新结果...');
  const updatedReports = await db
    .select()
    .from(dailyReport)
    .where(like(dailyReport.title, '%AI产品出海群聊精华%'));

  console.log(`✅ 成功更新 ${updatedReports.length} 个报告:\n`);
  for (const report of updatedReports) {
    console.log(
      `  - ${report.date.toISOString().split('T')[0]}: ${report.title}`
    );
  }

  console.log('\n🎉 标题更新完成！');
}

// 运行脚本
updateReportTitles()
  .then(() => {
    console.log('✨ 完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 错误:', error);
    process.exit(1);
  });
