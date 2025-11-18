/**
 * Add content column to daily_topic table
 */
require('dotenv/config');
const postgres = require('postgres');

async function addContentColumn() {
  console.log('🔧 添加 content 列到 daily_topic 表...\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(dbUrl);

  try {
    // 检查列是否已存在
    const checkResult = await client`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='daily_topic'
      AND column_name='content'
    `;

    if (checkResult.length > 0) {
      console.log('✅ content 列已经存在，无需添加');
    } else {
      // 添加 content 列
      await client`
        ALTER TABLE daily_topic
        ADD COLUMN content TEXT
      `;
      console.log('✅ 成功添加 content 列');
    }

    console.log('\n✨ 数据库 schema 更新完成！\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 更新失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addContentColumn();
