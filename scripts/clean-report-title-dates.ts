/**
 * 清理日报标题中的日期前缀
 * 将各种格式的日期前缀去掉,只保留 "AI产品出海群聊精华"
 * 运行: npx tsx scripts/clean-report-title-dates.ts
 */

import 'dotenv/config';
import { db } from '@/db';
import { dailyReport } from '@/db/schema';
import { like, eq } from 'drizzle-orm';

async function cleanReportTitleDates() {
  console.log('🚀 开始清理日报标题中的日期...\n');

  // 查找包含 "AI产品出海群聊精华" 的报告
  console.log('🔍 查找需要清理的报告...');
  const reports = await db
    .select()
    .from(dailyReport)
    .where(like(dailyReport.title, '%AI产品出海群聊精华%'));

  if (reports.length === 0) {
    console.log('✅ 没有需要清理的报告。\n');
    return;
  }

  console.log(`📊 找到 ${reports.length} 个报告:\n`);
  for (const report of reports) {
    console.log(`  - ID: ${report.id}`);
    console.log(`    当前标题: ${report.title}`);
  }

  // 逐个更新报告标题
  console.log('\n📝 开始清理...\n');
  let updatedCount = 0;

  for (const report of reports) {
    const originalTitle = report.title;
    let newTitle = originalTitle;

    // 移除各种日期格式前缀
    // 格式1: "2025年11月5日 " 或 "2025年11月5日"
    newTitle = newTitle.replace(/^\d{4}年\d{1,2}月\d{1,2}日\s*/g, '');

    // 格式2: "2025/11/6 " 或 "2025/11/6"
    newTitle = newTitle.replace(/^\d{4}\/\d{1,2}\/\d{1,2}\s*/g, '');

    // 格式3: "2024-11-01 " 或 "2024-11-01"
    newTitle = newTitle.replace(/^\d{4}-\d{1,2}-\d{1,2}\s*/g, '');

    // 如果标题有变化，则更新
    if (newTitle !== originalTitle) {
      await db
        .update(dailyReport)
        .set({
          title: newTitle,
          updatedAt: new Date()
        })
        .where(eq(dailyReport.id, report.id));

      console.log(`  ✅ 已更新: ${report.id}`);
      console.log(`     原标题: ${originalTitle}`);
      console.log(`     新标题: ${newTitle}\n`);
      updatedCount++;
    } else {
      console.log(`  ⏭️  跳过 (无需更新): ${report.id}\n`);
    }
  }

  console.log(`\n🎉 清理完成! 共更新 ${updatedCount} 个报告标题。`);

  // 验证结果
  console.log('\n🔍 验证最终结果...\n');
  const finalReports = await db
    .select()
    .from(dailyReport)
    .where(like(dailyReport.title, '%AI产品出海群聊精华%'));

  for (const report of finalReports) {
    console.log(`  - ${report.date.toISOString().split('T')[0]}: "${report.title}"`);
  }
}

// 运行脚本
cleanReportTitleDates()
  .then(() => {
    console.log('\n✨ 完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 错误:', error);
    process.exit(1);
  });
