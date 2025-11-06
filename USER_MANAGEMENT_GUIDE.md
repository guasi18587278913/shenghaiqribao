# 📚 用户数据管理完整指南

## 🗄️ 你的数据存储位置

✅ **是的！你的 1,152 个用户现在都安全地存储在 Supabase 上**

- **数据库**: PostgreSQL (Supabase 托管)
- **区域**: 日本东京 (aws-1-ap-northeast-1)
- **表名**: `user`
- **备份**: Supabase 自动每日备份

---

## 🛠️ 五种管理用户的方式

### 方式 1：命令行工具（推荐，最快捷）⭐

我为你创建了专门的管理脚本 `scripts/manage-users.ts`

#### 📋 查询用户

```bash
# 通过手机号查询
pnpm tsx scripts/manage-users.ts find 18587278913

# 搜索用户（按姓名/手机号/星球编号）
pnpm tsx scripts/manage-users.ts search 李雅东
```

#### ➕ 添加新用户

```bash
pnpm tsx scripts/manage-users.ts add "张三" 13800138000 12345678
```

#### 🔄 更新用户信息

```bash
# 更换手机号
pnpm tsx scripts/manage-users.ts update-phone 18587278913 13900139000

# 更新星球编号
pnpm tsx scripts/manage-users.ts update-planet 18587278913 99999

# 设置为管理员
pnpm tsx scripts/manage-users.ts set-admin 18587278913
```

#### 🗑️ 删除用户

```bash
pnpm tsx scripts/manage-users.ts delete 18587278913
```

---

### 方式 2：Drizzle Studio（可视化界面）⭐

**最直观的方式！**

```bash
# 启动 Drizzle Studio（已在运行）
pnpm db:studio

# 访问浏览器
https://local.drizzle.studio
```

**操作步骤**：
1. 点击左侧 `user` 表
2. 查看所有用户数据
3. 点击任意行编辑
4. 修改后点击"保存"

**适合场景**：
- ✅ 快速查看所有用户
- ✅ 批量浏览数据
- ✅ 可视化编辑单个用户
- ✅ 不需要写代码

---

### 方式 3：Supabase 官方控制台

**在线管理，随时随地访问**

```bash
# 访问 Supabase Dashboard
https://supabase.com/dashboard
```

**操作步骤**：
1. 登录 Supabase
2. 选择你的项目
3. 点击左侧 "Table Editor"
4. 选择 `user` 表
5. 查看/编辑/删除数据

**适合场景**：
- ✅ 在任何地方管理（不需要本地环境）
- ✅ 查看数据库统计
- ✅ 导出数据为 CSV
- ✅ 执行复杂 SQL 查询

---

### 方式 4：SQL 查询

**最灵活的方式！**

创建查询脚本：

```typescript
// scripts/custom-query.ts
import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);

async function main() {
  // 你的自定义查询
  const result = await client`
    SELECT name, phone, planet_number
    FROM "user"
    WHERE phone = '18587278913'
  `;

  console.log(result);
  await client.end();
}

main();
```

运行：
```bash
pnpm tsx scripts/custom-query.ts
```

---

### 方式 5：批量更新（CSV导入）

**适合批量修改！**

#### 场景 1：批量更换手机号

创建 CSV 文件 `update-phones.csv`：
```csv
oldPhone,newPhone
18587278913,13800138000
18048524385,13900139000
```

导入脚本：
```typescript
// scripts/batch-update-phones.ts
import 'dotenv/config';
import postgres from 'postgres';
import { readFile } from 'fs/promises';

const client = postgres(process.env.DATABASE_URL!);

async function main() {
  const content = await readFile('update-phones.csv', 'utf-8');
  const lines = content.trim().split('\n').slice(1); // 跳过表头

  for (const line of lines) {
    const [oldPhone, newPhone] = line.split(',');

    await client`
      UPDATE "user"
      SET phone = ${newPhone}, updated_at = NOW()
      WHERE phone = ${oldPhone}
    `;

    console.log(`✅ ${oldPhone} → ${newPhone}`);
  }

  await client.end();
}

main();
```

---

## 📖 常见操作示例

### 1. 查询用户信息

```bash
pnpm tsx scripts/manage-users.ts find 18587278913
```

输出：
```
📋 用户信息:
=====================================
  姓名: 李雅东
  手机号: 18587278913
  星球编号: 98589
  角色: user
  创建时间: 2025-11-04T...
```

---

### 2. 更换手机号

```bash
pnpm tsx scripts/manage-users.ts update-phone 18587278913 13900139000
```

输出：
```
✅ 手机号更新成功
```

**注意**：
- 新手机号不能已存在
- 用户下次登录需使用新手机号

---

### 3. 添加新用户

```bash
pnpm tsx scripts/manage-users.ts add "新用户" 13800138000 88888888
```

**适合场景**：
- 手动添加遗漏的用户
- 添加测试账号
- 单个用户注册

---

### 4. 设置管理员

```bash
pnpm tsx scripts/manage-users.ts set-admin 18587278913
```

**管理员权限**：
- 可以访问 `/dashboard` 管理后台
- 可以管理日报
- 可以审核内容

---

### 5. 批量导入新用户

```bash
# 准备新的CSV文件
vim new-users.csv

# 导入
pnpm tsx scripts/import-xingqiu-users.ts new-users.csv
```

---

## 🔐 数据安全

### 备份策略

**Supabase 自动备份**：
- ✅ 每日自动备份
- ✅ 保留 7 天
- ✅ 付费版可延长至 30 天

**手动备份**：
```bash
# 导出所有用户数据
pnpm tsx scripts/export-users.ts > backup-users-$(date +%Y%m%d).json
```

导出脚本：
```typescript
// scripts/export-users.ts
import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);

async function main() {
  const users = await client`
    SELECT name, phone, planet_number, role, created_at
    FROM "user"
    WHERE phone IS NOT NULL
    ORDER BY created_at DESC
  `;

  console.log(JSON.stringify(users, null, 2));
  await client.end();
}

main();
```

---

### 恢复数据

如果需要恢复：

```bash
# 从备份JSON恢复
pnpm tsx scripts/restore-users.ts backup-users-20251104.json
```

---

## 📊 数据统计和查询

### 常用查询

```bash
# 查看总用户数
pnpm tsx -e "
import postgres from 'postgres';
const c = postgres(process.env.DATABASE_URL!);
const r = await c\`SELECT COUNT(*) FROM user WHERE phone IS NOT NULL\`;
console.log('总用户数:', r[0].count);
await c.end();
"

# 查看今天新增
pnpm tsx -e "
import postgres from 'postgres';
const c = postgres(process.env.DATABASE_URL!);
const r = await c\`SELECT COUNT(*) FROM user WHERE created_at::date = CURRENT_DATE\`;
console.log('今日新增:', r[0].count);
await c.end();
"
```

---

## 🚨 注意事项

### 手机号唯一性
- ✅ 手机号有唯一索引
- ✅ 重复手机号会报错
- ✅ 更新前先查询是否存在

### 删除用户的影响
- ⚠️ 会删除该用户的所有评论
- ⚠️ 会删除该用户的会话
- ⚠️ 会删除该用户的支付记录
- 💡 建议：使用"封禁"而不是"删除"

### 封禁用户（推荐）

```typescript
// 封禁而不删除
await client`
  UPDATE "user"
  SET banned = true,
      ban_reason = '违规原因'
  WHERE phone = '18587278913'
`;
```

---

## 📞 快速参考

### 命令速查表

| 操作 | 命令 |
|------|------|
| 查询用户 | `pnpm tsx scripts/manage-users.ts find <手机号>` |
| 搜索用户 | `pnpm tsx scripts/manage-users.ts search <关键词>` |
| 添加用户 | `pnpm tsx scripts/manage-users.ts add <姓名> <手机号> <星球号>` |
| 更换手机号 | `pnpm tsx scripts/manage-users.ts update-phone <旧> <新>` |
| 更新星球号 | `pnpm tsx scripts/manage-users.ts update-planet <手机号> <新星球号>` |
| 设置管理员 | `pnpm tsx scripts/manage-users.ts set-admin <手机号>` |
| 删除用户 | `pnpm tsx scripts/manage-users.ts delete <手机号>` |
| 批量导入 | `pnpm tsx scripts/import-xingqiu-users.ts <CSV文件>` |

---

## ✅ 最佳实践

1. **定期备份**：每周导出一次用户数据
2. **测试先行**：在测试环境先验证操作
3. **日志记录**：重要操作记录到文件
4. **权限控制**：只给必要的人数据库访问权限
5. **封禁优于删除**：用户违规时使用封禁而非删除

---

## 🎯 总结

你现在有 **5 种方式** 管理用户数据：

1. ⚡ **命令行工具** - 最快捷（推荐日常使用）
2. 👁️ **Drizzle Studio** - 最直观（推荐查看数据）
3. 🌐 **Supabase 控制台** - 随时随地
4. 💻 **SQL 查询** - 最灵活
5. 📦 **批量导入** - 大量操作

**数据很安全**，Supabase 自动备份 ✅

需要帮助？查看各个脚本的注释或运行不带参数查看帮助！
