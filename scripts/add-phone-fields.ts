/**
 * 为 user 表添加手机号和星球编号字段
 */
import 'dotenv/config';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });

async function addFields() {
  console.log('🔧 为 user 表添加新字段...\n');

  try {
    // 添加 phone 字段
    await client`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS phone text UNIQUE
    `;
    console.log('✅ 添加 phone 字段');

    // 添加 planet_number 字段
    await client`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS planet_number text
    `;
    console.log('✅ 添加 planet_number 字段');

    // 创建索引
    await client`
      CREATE INDEX IF NOT EXISTS user_phone_idx ON "user"(phone)
    `;
    console.log('✅ 创建 phone 索引');

    console.log('\n🎉 字段添加完成！\n');

    // 查看表结构
    const columns = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user'
      AND column_name IN ('phone', 'planet_number')
    `;

    console.log('📋 新增字段信息:');
    console.log('=====================================');
    for (const col of columns) {
      console.log(
        `  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      );
    }
    console.log('');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addFields();
