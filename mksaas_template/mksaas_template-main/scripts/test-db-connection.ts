/**
 * Test database connection
 * 测试数据库连接
 */
import 'dotenv/config';
import postgres from 'postgres';

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  // 检查环境变量
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  console.log(
    '📋 Database URL configured:',
    dbUrl.replace(/:[^:@]+@/, ':****@')
  );
  console.log('');

  let client;
  try {
    // 创建连接
    console.log('📡 Attempting to connect to database...');
    client = postgres(dbUrl, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10, // 10 seconds timeout
    });

    // 测试简单查询
    console.log('🔄 Executing test query...');
    const result =
      await client`SELECT NOW() as current_time, version() as pg_version`;

    console.log('✅ Database connection successful!\n');
    console.log('📊 Connection details:');
    console.log('   - Current time:', result[0].current_time);
    console.log('   - PostgreSQL version:', result[0].pg_version.split(',')[0]);
    console.log('');

    // 测试表是否存在
    console.log('🗄️  Checking database tables...');
    const tables = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('⚠️  No tables found. You may need to run migrations:');
      console.log('   pnpm db:push  (or)  pnpm db:migrate');
    } else {
      console.log(`✅ Found ${tables.length} tables in the database:`);
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    }

    console.log('\n✨ Database connection test completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database connection failed!\n');
    console.error('Error details:');
    console.error('   - Message:', error.message);
    console.error('   - Code:', error.code || 'N/A');

    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Check your internet connection');
      console.error('   - Verify the database host is correct');
      console.error('   - Make sure Supabase project is running');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Database password is incorrect');
      console.error('   - Check your DATABASE_URL in .env file');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Database is not responding');
      console.error('   - Network firewall blocking connection');
      console.error('   - Supabase connection pooler may be down');
    }

    console.error('\n📝 Troubleshooting steps:');
    console.error('   1. Check .env file has correct DATABASE_URL');
    console.error('   2. Verify Supabase dashboard shows project is active');
    console.error('   3. Try accessing database from Supabase dashboard');
    console.error('   4. Check if connection pooler URL is correct');

    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

testConnection();
