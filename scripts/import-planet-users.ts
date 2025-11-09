/**
 * 导入星球用户数据（手机号 + 星球编号）
 *
 * 使用方法：
 * 1. 准备数据文件 planet-users.json 或 planet-users.csv
 * 2. 运行：pnpm tsx scripts/import-planet-users.ts [文件路径]
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { user } from '../src/db/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

// ============================================================================
// 数据格式说明
// ============================================================================
/*
JSON 格式：
{
  "users": [
    {
      "name": "张三",
      "phone": "13800138000",
      "planetNumber": "12345678"
    }
  ]
}

CSV 格式：
name,phone,planetNumber
张三,13800138000,12345678
李四,13900139000,87654321
*/

// ============================================================================
// CSV 解析函数
// ============================================================================
function parseCSV(content: string) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  const users = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // 跳过空行

    const values = lines[i].split(',').map((v) => v.trim());
    const userData: any = {};

    headers.forEach((header, index) => {
      userData[header] = values[index];
    });

    users.push(userData);
  }

  return users;
}

// ============================================================================
// 数据验证
// ============================================================================
function validateUserData(userData: any): string | null {
  if (!userData.phone) {
    return '缺少手机号';
  }

  if (!userData.planetNumber) {
    return '缺少星球编号';
  }

  // 验证手机号格式（中国大陆）
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(userData.phone)) {
    return '手机号格式不正确';
  }

  return null; // 验证通过
}

// ============================================================================
// 导入用户
// ============================================================================
async function importUsers(usersData: any[]) {
  console.log('👥 开始导入星球用户...\n');
  console.log(`📊 共 ${usersData.length} 个用户待导入\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const userData of usersData) {
    try {
      // 验证数据
      const validationError = validateUserData(userData);
      if (validationError) {
        console.log(
          `⚠️  ${userData.name || userData.phone}: ${validationError}\n`
        );
        errorCount++;
        continue;
      }

      const userId = nanoid();
      const name = userData.name || `用户_${userData.planetNumber}`;
      const email =
        userData.email || `planet_${userData.planetNumber}@temp.com`; // 临时邮箱

      console.log(
        `📝 导入: ${name} | 手机: ${userData.phone} | 星球: ${userData.planetNumber}`
      );

      await db
        .insert(user)
        .values({
          id: userId,
          name: name,
          email: email,
          emailVerified: false,
          image: userData.image || null,
          phone: userData.phone,
          planetNumber: userData.planetNumber,
          role: userData.role || 'user',
          banned: false,
          banReason: null,
          banExpires: null,
          customerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing(); // 如果手机号或邮箱已存在，跳过

      console.log(`   ✅ 成功\n`);
      successCount++;
    } catch (error: any) {
      if (error.code === '23505') {
        // 唯一约束冲突
        console.log(`   ⚠️  跳过（手机号或邮箱已存在）\n`);
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

// ============================================================================
// 主函数
// ============================================================================
async function main() {
  console.log('🚀 星球用户导入工具\n');
  console.log('=====================================\n');

  try {
    const filePath = process.argv[2] || './scripts/planet-users.json';
    let usersData: any[] = [];

    console.log(`📂 读取文件: ${filePath}\n`);

    try {
      const content = await readFile(filePath, 'utf-8');

      // 判断文件格式
      if (filePath.endsWith('.csv')) {
        usersData = parseCSV(content);
      } else {
        // JSON 格式
        const parsed = JSON.parse(content);
        usersData = parsed.users || parsed;
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('⚠️  未找到数据文件\n');
        console.log('📝 使用方法：\n');
        console.log('1. JSON 格式：');
        console.log(
          '   pnpm tsx scripts/import-planet-users.ts planet-users.json\n'
        );
        console.log('2. CSV 格式：');
        console.log(
          '   pnpm tsx scripts/import-planet-users.ts planet-users.csv\n'
        );
        console.log('数据格式示例：');
        console.log(
          'JSON: {"users": [{"name": "张三", "phone": "13800138000", "planetNumber": "12345678"}]}'
        );
        console.log(
          'CSV:  name,phone,planetNumber\n      张三,13800138000,12345678\n'
        );
        process.exit(1);
      }
      throw error;
    }

    if (usersData.length === 0) {
      console.log('⚠️  数据文件为空\n');
      process.exit(0);
    }

    await importUsers(usersData);

    console.log('✨ 全部完成！\n');

    // 显示最新导入的用户
    const recentUsers = await client`
      SELECT name, phone, planet_number, role, created_at
      FROM "user"
      WHERE phone IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('📋 最近导入的用户:');
    console.log('=====================================');
    for (const u of recentUsers) {
      const icon = u.role === 'admin' ? '👑' : '👤';
      console.log(
        `  ${icon} ${u.name} | 📱 ${u.phone} | 🌐 ${u.planet_number}`
      );
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
