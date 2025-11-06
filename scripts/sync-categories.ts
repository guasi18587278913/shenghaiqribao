import { sql } from 'drizzle-orm';
import { syncAllCategoryStats } from '../src/actions/category-stats';
import { db } from '../src/db/index';
import { dailyReport } from '../src/db/schema';

/**
 * Synchronization Script for Category Statistics and Report Date Fields
 *
 * This script should be run once after deployment to:
 * 1. Populate the category_stats table with existing categories
 * 2. Update all existing daily reports with year and month fields
 *
 * Usage: pnpm tsx scripts/sync-categories.ts
 */

async function main() {
  console.log('🚀 开始数据同步...\n');

  try {
    // Step 1: Sync category statistics
    console.log('📊 步骤 1/2: 同步分类统计');
    await syncAllCategoryStats();
    console.log('✅ 分类统计已同步\n');

    // Step 2: Update year and month fields for existing reports
    console.log('📅 步骤 2/2: 更新日报的年月信息');
    const reports = await db
      .select({
        id: dailyReport.id,
        date: dailyReport.date,
      })
      .from(dailyReport);

    if (reports.length === 0) {
      console.log('ℹ️  没有需要更新的日报\n');
    } else {
      let updatedCount = 0;
      for (const report of reports) {
        const date = new Date(report.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        await db
          .update(dailyReport)
          .set({ year, month })
          .where(sql`${dailyReport.id} = ${report.id}`);

        updatedCount++;

        // Progress indicator
        if (updatedCount % 10 === 0) {
          process.stdout.write(
            `\r   已更新: ${updatedCount}/${reports.length}`
          );
        }
      }

      console.log(`\r✅ 已更新 ${reports.length} 个日报的年月信息\n`);
    }

    // Verification
    console.log('🔍 验证数据同步结果:');

    // Check category stats
    const categoryStats = await db.query.categoryStats.findMany({
      orderBy: (stats, { desc }) => [desc(stats.count)],
      limit: 5,
    });

    if (categoryStats.length > 0) {
      console.log('\n   📊 分类统计（前5个）:');
      categoryStats.forEach((cat) => {
        console.log(`      - ${cat.name}: ${cat.count} 个话题`);
      });
    }

    // Check updated reports
    const recentReports = await db.query.dailyReport.findMany({
      orderBy: (report, { desc }) => [desc(report.date)],
      limit: 3,
      columns: {
        id: true,
        date: true,
        year: true,
        month: true,
      },
    });

    if (recentReports.length > 0) {
      console.log('\n   📅 最近的日报（检查年月字段）:');
      recentReports.forEach((report) => {
        const date = new Date(report.date).toLocaleDateString('zh-CN');
        console.log(`      - ${date} → ${report.year}年${report.month}月`);
      });
    }

    console.log('\n✨ 数据同步完成！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 同步过程中出现错误:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
