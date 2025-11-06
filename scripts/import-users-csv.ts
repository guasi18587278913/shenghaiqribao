/**
 * 从 CSV 文件导入用户
 *
 * CSV 格式：
 * name,email,role
 * 张三,zhangsan@example.com,user
 * 李四,lisi@example.com,admin
 *
 * 使用方法：
 * pnpm tsx scripts/import-users-csv.ts users.csv
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

function parseCSV(content: string) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  const users = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const userData: any = {};

    headers.forEach((header, index) => {
      userData[header] = values[index];
    });

    users.push(userData);
  }

  return users;
}

async function main() {
  const csvFile = process.argv[2];

  if (!csvFile) {
    console.error('❌ 请指定 CSV 文件路径');
    console.log('\n使用方法：');
    console.log('  pnpm tsx scripts/import-users-csv.ts users.csv');
    console.log('\nCSV 格式示例：');
    console.log('  name,email,role');
    console.log('  张三,zhangsan@example.com,user');
    console.log('  李四,lisi@example.com,admin');
    process.exit(1);
  }

  try {
    console.log('📂 读取 CSV 文件:', csvFile, '\n');
    const content = await readFile(csvFile, 'utf-8');
    const users = parseCSV(content);

    console.log(`📊 共 ${users.length} 个用户待导入\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const userData of users) {
      try {
        const userId = nanoid();

        console.log(`📝 导入: ${userData.name} (${userData.email})`);

        await db
          .insert(user)
          .values({
            id: userId,
            name: userData.name,
            email: userData.email,
            emailVerified: false,
            image: userData.image || null,
            role: userData.role || 'user',
            banned: false,
            banReason: null,
            banExpires: null,
            customerId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing();

        console.log('   ✅ 成功\n');
        successCount++;
      } catch (error: any) {
        console.error(`   ❌ 失败: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('=====================================');
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`❌ 失败: ${errorCount} 个`);
    console.log('=====================================\n');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
