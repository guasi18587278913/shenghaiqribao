import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { isNotNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { user } from '../src/db/schema.js';

dotenv.config();

async function exportUserPhones() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema: { user } });

  try {
    console.log('🔄 正在导出用户手机号...\n');

    // 查询所有有手机号的用户
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        planetNumber: user.planetNumber,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(isNotNull(user.phone))
      .orderBy(user.createdAt);

    console.log(`✅ 找到 ${users.length} 位有手机号的用户\n`);

    // 导出为 CSV 格式
    const csvHeader = 'ID,姓名,邮箱,手机号,星球编号,注册时间\n';
    const csvRows = users
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.planetNumber || ''}","${u.createdAt}"`
      )
      .join('\n');

    const csvContent = csvHeader + csvRows;
    const csvPath = path.join(process.cwd(), 'user-phones-export.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf-8');

    console.log(`📄 CSV 文件已保存到: ${csvPath}\n`);

    // 导出为 JSON 格式
    const jsonPath = path.join(process.cwd(), 'user-phones-export.json');
    fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2), 'utf-8');

    console.log(`📄 JSON 文件已保存到: ${jsonPath}\n`);

    // 控制台输出前 10 条
    console.log('📋 前 10 位用户信息预览：\n');
    console.table(
      users.slice(0, 10).map((u) => ({
        姓名: u.name,
        邮箱: u.email,
        手机号: u.phone,
        星球编号: u.planetNumber,
      }))
    );

    console.log(`\n✅ 导出完成！`);
    console.log(`   - 有手机号的用户数: ${users.length}`);
    console.log(`   - CSV 文件: user-phones-export.csv`);
    console.log(`   - JSON 文件: user-phones-export.json`);
  } catch (error) {
    console.error('❌ 导出失败:', error);
  } finally {
    await client.end();
  }
}

exportUserPhones();
