/**
 * 用户管理工具 - 增删改查
 */
import 'dotenv/config';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// ============================================================================
// 1. 查询用户
// ============================================================================

export async function findUserByPhone(phone: string) {
  const users = await client`
    SELECT id, name, phone, planet_number, email, role, created_at
    FROM "user"
    WHERE phone = ${phone}
  `;
  return users[0] || null;
}

export async function findUserByPlanetNumber(planetNumber: string) {
  const users = await client`
    SELECT id, name, phone, planet_number, email, role, created_at
    FROM "user"
    WHERE planet_number = ${planetNumber}
  `;
  return users[0] || null;
}

export async function searchUsers(keyword: string) {
  const users = await client`
    SELECT id, name, phone, planet_number, email, role
    FROM "user"
    WHERE name ILIKE ${`%${keyword}%`}
       OR phone LIKE ${`%${keyword}%`}
       OR planet_number LIKE ${`%${keyword}%`}
    ORDER BY created_at DESC
    LIMIT 20
  `;
  return users;
}

// ============================================================================
// 2. 添加用户
// ============================================================================

export async function addUser(data: {
  name: string;
  phone: string;
  planetNumber: string;
  role?: string;
}) {
  const userId = nanoid();
  const email = `planet_${data.planetNumber}@temp.com`;

  try {
    await client`
      INSERT INTO "user" (
        id, name, email, email_verified, phone, planet_number,
        role, banned, ban_reason, ban_expires, customer_id,
        created_at, updated_at
      ) VALUES (
        ${userId}, ${data.name}, ${email}, false, ${data.phone}, ${data.planetNumber},
        ${data.role || 'user'}, false, null, null, null,
        NOW(), NOW()
      )
    `;
    return { success: true, message: '用户添加成功', userId };
  } catch (error: any) {
    if (error.code === '23505') {
      return { success: false, message: '手机号已存在' };
    }
    return { success: false, message: error.message };
  }
}

// ============================================================================
// 3. 更新用户
// ============================================================================

export async function updateUserPhone(oldPhone: string, newPhone: string) {
  try {
    const result = await client`
      UPDATE "user"
      SET phone = ${newPhone}, updated_at = NOW()
      WHERE phone = ${oldPhone}
      RETURNING id, name, phone, planet_number
    `;

    if (result.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    return { success: true, message: '手机号更新成功', user: result[0] };
  } catch (error: any) {
    if (error.code === '23505') {
      return { success: false, message: '新手机号已被使用' };
    }
    return { success: false, message: error.message };
  }
}

export async function updateUserPlanetNumber(
  phone: string,
  newPlanetNumber: string
) {
  const result = await client`
    UPDATE "user"
    SET planet_number = ${newPlanetNumber}, updated_at = NOW()
    WHERE phone = ${phone}
    RETURNING id, name, phone, planet_number
  `;

  if (result.length === 0) {
    return { success: false, message: '用户不存在' };
  }

  return { success: true, message: '星球编号更新成功', user: result[0] };
}

export async function updateUserName(phone: string, newName: string) {
  const result = await client`
    UPDATE "user"
    SET name = ${newName}, updated_at = NOW()
    WHERE phone = ${phone}
    RETURNING id, name, phone, planet_number
  `;

  if (result.length === 0) {
    return { success: false, message: '用户不存在' };
  }

  return { success: true, message: '姓名更新成功', user: result[0] };
}

export async function updateUserRole(phone: string, role: 'user' | 'admin') {
  const result = await client`
    UPDATE "user"
    SET role = ${role}, updated_at = NOW()
    WHERE phone = ${phone}
    RETURNING id, name, phone, planet_number, role
  `;

  if (result.length === 0) {
    return { success: false, message: '用户不存在' };
  }

  return { success: true, message: '角色更新成功', user: result[0] };
}

// ============================================================================
// 4. 删除用户
// ============================================================================

export async function deleteUser(phone: string) {
  const result = await client`
    DELETE FROM "user"
    WHERE phone = ${phone}
    RETURNING name, phone
  `;

  if (result.length === 0) {
    return { success: false, message: '用户不存在' };
  }

  return { success: true, message: '用户删除成功', user: result[0] };
}

// ============================================================================
// 5. 批量操作
// ============================================================================

export async function batchUpdatePhones(
  updates: Array<{ oldPhone: string; newPhone: string }>
) {
  console.log(`📝 批量更新 ${updates.length} 个用户的手机号...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const { oldPhone, newPhone } of updates) {
    const result = await updateUserPhone(oldPhone, newPhone);
    if (result.success) {
      console.log(`✅ ${result.user?.name}: ${oldPhone} → ${newPhone}`);
      successCount++;
    } else {
      console.log(`❌ ${oldPhone}: ${result.message}`);
      errorCount++;
    }
  }

  console.log(
    `\n📊 更新完成: ✅ ${successCount} 个成功, ❌ ${errorCount} 个失败\n`
  );
}

// ============================================================================
// CLI 命令行工具
// ============================================================================

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'find':
        // 查询用户：pnpm tsx scripts/manage-users.ts find 18587278913
        const phone = process.argv[3];
        if (!phone) {
          console.log('❌ 请提供手机号');
          break;
        }
        const user = await findUserByPhone(phone);
        if (user) {
          console.log('\n📋 用户信息:');
          console.log('=====================================');
          console.log(`  姓名: ${user.name}`);
          console.log(`  手机号: ${user.phone}`);
          console.log(`  星球编号: ${user.planet_number}`);
          console.log(`  角色: ${user.role}`);
          console.log(`  创建时间: ${user.created_at}`);
          console.log('');
        } else {
          console.log('❌ 用户不存在\n');
        }
        break;

      case 'search':
        // 搜索用户：pnpm tsx scripts/manage-users.ts search 李雅东
        const keyword = process.argv[3];
        if (!keyword) {
          console.log('❌ 请提供搜索关键词');
          break;
        }
        const users = await searchUsers(keyword);
        console.log(`\n🔍 搜索结果 (找到 ${users.length} 个用户):`);
        console.log('=====================================');
        for (const u of users) {
          console.log(`  👤 ${u.name} | 📱 ${u.phone} | 🌐 ${u.planet_number}`);
        }
        console.log('');
        break;

      case 'add':
        // 添加用户：pnpm tsx scripts/manage-users.ts add "张三" 13800138000 12345678
        const [, , , name, phoneNum, planetNum] = process.argv;
        if (!name || !phoneNum || !planetNum) {
          console.log(
            '❌ 用法: pnpm tsx scripts/manage-users.ts add "姓名" 手机号 星球编号'
          );
          break;
        }
        const addResult = await addUser({
          name,
          phone: phoneNum,
          planetNumber: planetNum,
        });
        console.log(
          addResult.success
            ? `\n✅ ${addResult.message}\n`
            : `\n❌ ${addResult.message}\n`
        );
        break;

      case 'update-phone':
        // 更新手机号：pnpm tsx scripts/manage-users.ts update-phone 18587278913 13800138000
        const [, , , oldPhone, newPhone] = process.argv;
        if (!oldPhone || !newPhone) {
          console.log(
            '❌ 用法: pnpm tsx scripts/manage-users.ts update-phone 旧手机号 新手机号'
          );
          break;
        }
        const updateResult = await updateUserPhone(oldPhone, newPhone);
        console.log(
          updateResult.success
            ? `\n✅ ${updateResult.message}\n`
            : `\n❌ ${updateResult.message}\n`
        );
        break;

      case 'update-planet':
        // 更新星球编号：pnpm tsx scripts/manage-users.ts update-planet 18587278913 99999
        const [, , , phoneForPlanet, newPlanet] = process.argv;
        if (!phoneForPlanet || !newPlanet) {
          console.log(
            '❌ 用法: pnpm tsx scripts/manage-users.ts update-planet 手机号 新星球编号'
          );
          break;
        }
        const planetResult = await updateUserPlanetNumber(
          phoneForPlanet,
          newPlanet
        );
        console.log(
          planetResult.success
            ? `\n✅ ${planetResult.message}\n`
            : `\n❌ ${planetResult.message}\n`
        );
        break;

      case 'set-admin':
        // 设置管理员：pnpm tsx scripts/manage-users.ts set-admin 18587278913
        const adminPhone = process.argv[3];
        if (!adminPhone) {
          console.log('❌ 请提供手机号');
          break;
        }
        const adminResult = await updateUserRole(adminPhone, 'admin');
        console.log(
          adminResult.success
            ? `\n✅ ${adminResult.message}\n`
            : `\n❌ ${adminResult.message}\n`
        );
        break;

      case 'delete':
        // 删除用户：pnpm tsx scripts/manage-users.ts delete 18587278913
        const deletePhone = process.argv[3];
        if (!deletePhone) {
          console.log('❌ 请提供手机号');
          break;
        }
        const deleteResult = await deleteUser(deletePhone);
        console.log(
          deleteResult.success
            ? `\n✅ ${deleteResult.message}\n`
            : `\n❌ ${deleteResult.message}\n`
        );
        break;

      default:
        console.log(`
🛠️  用户管理工具

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

查询操作：
  find <手机号>              查询用户信息
  search <关键词>            搜索用户

添加操作：
  add <姓名> <手机号> <星球编号>   添加新用户

更新操作：
  update-phone <旧手机号> <新手机号>     更新手机号
  update-planet <手机号> <新星球编号>    更新星球编号
  set-admin <手机号>                     设置为管理员

删除操作：
  delete <手机号>            删除用户

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

示例：
  pnpm tsx scripts/manage-users.ts find 18587278913
  pnpm tsx scripts/manage-users.ts search 李雅东
  pnpm tsx scripts/manage-users.ts add "张三" 13800138000 12345678
  pnpm tsx scripts/manage-users.ts update-phone 18587278913 13900139000
  pnpm tsx scripts/manage-users.ts set-admin 18587278913

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    }
  } catch (error: any) {
    console.error('\n❌ 错误:', error.message);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}
