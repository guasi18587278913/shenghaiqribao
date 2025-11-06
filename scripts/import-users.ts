/**
 * 批量导入用户脚本
 *
 * 使用方法：
 * 1. 准备 users.json 文件（格式见下方示例）
 * 2. 运行：pnpm tsx scripts/import-users.ts
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import postgres from 'postgres';
import { user } from '../src/db/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

// ============================================================================
// 用户数据示例格式
// ============================================================================
/*
{
  "users": [
    {
      "name": "张三",
      "email": "zhangsan@example.com",
      "role": "user"
    },
    {
      "name": "李四",
      "email": "lisi@example.com",
      "role": "admin"
    }
  ]
}
*/

// ============================================================================
// 默认测试用户数据
// ============================================================================
const defaultUsers = [
  {
    name: '测试用户1',
    email: 'test1@example.com',
    role: 'user',
  },
  {
    name: '测试用户2',
    email: 'test2@example.com',
    role: 'user',
  },
  {
    name: '测试管理员',
    email: 'admin@example.com',
    role: 'admin',
  },
];

async function importUsers(usersData: any[]) {
  console.log('👥 开始导入用户...\n');
  console.log(`📊 共 ${usersData.length} 个用户待导入\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const userData of usersData) {
    try {
      const userId = nanoid();

      console.log(`📝 导入用户: ${userData.name} (${userData.email})`);

      await db
        .insert(user)
        .values({
          id: userId,
          name: userData.name,
          email: userData.email,
          emailVerified: false, // 默认未验证
          image: userData.image || null,
          role: userData.role || 'user',
          banned: false,
          banReason: null,
          banExpires: null,
          customerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing(); // 如果邮箱已存在，跳过

      console.log(`   ✅ 成功\n`);
      successCount++;
    } catch (error: any) {
      if (error.code === '23505') {
        // 唯一约束冲突（邮箱重复）
        console.log(`   ⚠️  跳过（邮箱已存在）\n`);
        skipCount++;
      } else {
        console.error(`   ❌ 失败: ${error.message}\n`);
        errorCount++;
      }
    }
  }

  console.log('=====================================');
  console.log('📊 导入完成统计:');
  console.log(`   ✅ 成功: ${successCount} 个`);
  console.log(`   ⚠️  跳过: ${skipCount} 个`);
  console.log(`   ❌ 失败: ${errorCount} 个`);
  console.log('=====================================\n');
}

async function main() {
  console.log('🚀 用户导入工具\n');
  console.log('=====================================\n');

  try {
    // 尝试读取 users.json 文件
    let usersData;

    try {
      const fs = await import('fs/promises');
      const jsonContent = await fs.readFile('./scripts/users.json', 'utf-8');
      const parsed = JSON.parse(jsonContent);
      usersData = parsed.users || parsed;
      console.log('📂 从 scripts/users.json 读取用户数据\n');
    } catch (error) {
      console.log('⚠️  未找到 scripts/users.json 文件');
      console.log('📝 使用默认测试用户数据\n');
      usersData = defaultUsers;
    }

    await importUsers(usersData);

    console.log('✨ 全部完成！\n');

    // 显示当前所有用户
    const allUsers = await client`
      SELECT id, name, email, role, created_at
      FROM "user"
      ORDER BY created_at DESC
    `;

    console.log('📋 当前数据库中的用户:');
    console.log('=====================================');
    for (const u of allUsers) {
      const icon = u.role === 'admin' ? '👑' : '👤';
      console.log(`  ${icon} ${u.name} - ${u.email} (${u.role})`);
    }
    console.log('');
  } catch (error: any) {
    console.error('❌ 执行失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
