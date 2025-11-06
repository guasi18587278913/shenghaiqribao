import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

async function checkDatabase() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  try {
    console.log('🔌 正在连接 Supabase 数据库...\n');

    // 检查连接
    const version = await client`SELECT version()`;
    console.log('✅ 数据库连接成功!');
    console.log('📌 PostgreSQL 版本:', version[0].version.split(' ')[1]);
    console.log('📌 连接地址:', connectionString.split('@')[1].split('/')[0]);
    console.log('');

    // 列出所有表
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('📊 数据库中的表 (共 ' + tables.length + ' 张):');
    console.log('=====================================');
    for (const table of tables) {
      console.log('  ✓', table.table_name);
    }
    console.log('');

    // 统计数据
    console.log('📈 数据统计:');
    console.log('=====================================');

    if (tables.some((t) => t.table_name === 'user')) {
      const userCount = await client`SELECT COUNT(*) as count FROM "user"`;
      console.log('  👤 用户数:', userCount[0].count);
    }

    if (tables.some((t) => t.table_name === 'daily_report')) {
      const reportCount =
        await client`SELECT COUNT(*) as count FROM daily_report`;
      const reports =
        await client`SELECT id, title, status, date FROM daily_report ORDER BY date DESC LIMIT 5`;
      console.log('  📰 日报总数:', reportCount[0].count);
      if (reports.length > 0) {
        console.log('\n  最近的日报:');
        for (const r of reports) {
          const dateStr = new Date(r.date).toLocaleDateString('zh-CN');
          console.log('    -', dateStr, '|', r.status, '|', r.title);
        }
      }
    }

    if (tables.some((t) => t.table_name === 'daily_topic')) {
      const topicCount =
        await client`SELECT COUNT(*) as count FROM daily_topic`;
      console.log('\n  📝 话题总数:', topicCount[0].count);
    }

    if (tables.some((t) => t.table_name === 'raw_message')) {
      const messageCount =
        await client`SELECT COUNT(*) as count FROM raw_message`;
      console.log('  💬 原始消息数:', messageCount[0].count);
    }

    if (tables.some((t) => t.table_name === 'comment')) {
      const commentCount = await client`SELECT COUNT(*) as count FROM comment`;
      console.log('  💭 评论数:', commentCount[0].count);
    }

    if (tables.some((t) => t.table_name === 'payment')) {
      const paymentCount = await client`SELECT COUNT(*) as count FROM payment`;
      console.log('  💰 支付记录数:', paymentCount[0].count);
    }

    console.log('\n✨ 检查完成!');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
