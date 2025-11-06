/**
 * 导入知识星球用户数据
 * 专门处理包含多列的星球导出CSV
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import postgres from 'postgres';
import { user } from '../src/db/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

function parseXingqiuCSV(content: string) {
  const lines = content.trim().split('\n');

  // 跳过第一行（表头）
  const users = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // 处理CSV（考虑引号包裹的字段）
    const row = lines[i].split(',');

    // 提取关键字段
    // 第11列（索引11）：姓名
    // 第12列（索引12）：手机号（可能带引号和制表符）
    // 第13列（索引13）：星球编号

    const name = row[11]?.trim() || '';
    let phone = row[12]?.trim() || '';
    let planetNumber = row[13]?.trim() || '';

    // 清理手机号（去除引号和制表符）
    phone = phone.replace(/["\t\s]/g, '');

    // 清理星球编号
    planetNumber = planetNumber.replace(/["\t\s]/g, '');

    // 验证数据
    if (phone && planetNumber) {
      users.push({
        name: name || `用户_${planetNumber}`,
        phone,
        planetNumber,
      });
    }
  }

  return users;
}

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
    return `手机号格式不正确: ${userData.phone}`;
  }

  return null;
}

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
          `⚠️  ${userData.name || userData.phone}: ${validationError}`
        );
        errorCount++;
        continue;
      }

      const userId = nanoid();
      const email = `planet_${userData.planetNumber}@temp.com`;

      console.log(
        `📝 ${userData.name} | 📱 ${userData.phone} | 🌐 ${userData.planetNumber}`
      );

      await db
        .insert(user)
        .values({
          id: userId,
          name: userData.name,
          email: email,
          emailVerified: false,
          image: null,
          phone: userData.phone,
          planetNumber: userData.planetNumber,
          role: 'user',
          banned: false,
          banReason: null,
          banExpires: null,
          customerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();

      console.log(`   ✅ 成功\n`);
      successCount++;
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`   ⚠️  跳过（手机号已存在）\n`);
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

  return { successCount, skipCount, errorCount };
}

async function main() {
  console.log('🚀 知识星球用户导入工具\n');
  console.log('=====================================\n');

  try {
    const filePath = process.argv[2];

    if (!filePath) {
      console.log('❌ 请指定CSV文件路径\n');
      console.log('使用方法：');
      console.log(
        '  pnpm tsx scripts/import-xingqiu-users.ts /path/to/your-file.csv\n'
      );
      console.log('示例：');
      console.log(
        '  pnpm tsx scripts/import-xingqiu-users.ts ~/Desktop/1期名单.csv\n'
      );
      process.exit(1);
    }

    console.log(`📂 读取文件: ${filePath}\n`);

    const content = await readFile(filePath, 'utf-8');
    const usersData = parseXingqiuCSV(content);

    if (usersData.length === 0) {
      console.log('⚠️  未找到有效的用户数据\n');
      process.exit(0);
    }

    const stats = await importUsers(usersData);

    console.log('✨ 全部完成！\n');

    // 显示最新导入的用户
    if (stats.successCount > 0) {
      const recentUsers = await client`
        SELECT name, phone, planet_number
        FROM "user"
        WHERE phone IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 10
      `;

      console.log('📋 最近导入的用户（前10个）:');
      console.log('=====================================');
      for (const u of recentUsers) {
        console.log(`  👤 ${u.name} | 📱 ${u.phone} | 🌐 ${u.planet_number}`);
      }
      console.log('');
    }
  } catch (error: any) {
    console.error('❌ 执行失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
