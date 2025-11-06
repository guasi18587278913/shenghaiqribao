# 星球用户登录系统使用指南

## 🎯 系统概述

这是一个基于**手机号 + 星球编号**的自定义登录系统，专为知识星球用户设计。

---

## 📦 已完成的配置

### ✅ 1. 数据库字段
在 `user` 表中添加了两个新字段：
- `phone` (text, unique) - 手机号，唯一索引
- `planet_number` (text) - 星球编号

### ✅ 2. 导入工具
创建了两个数据导入脚本：
- `scripts/import-planet-users.ts` - 主要导入脚本
- `scripts/planet-users.json` - JSON 格式示例
- `scripts/planet-users.csv` - CSV 格式示例

### ✅ 3. 认证逻辑
- `src/actions/planet-auth.ts` - 服务端认证函数
- 支持手机号格式验证
- 支持星球编号匹配验证
- 支持用户封禁检查

### ✅ 4. 登录界面
- `src/components/auth/planet-login-form.tsx` - 登录表单组件
- `src/app/[locale]/auth/planet-login/page.tsx` - 登录页面路由

---

## 📝 第一步：准备用户数据

### 方案 A：JSON 格式（推荐）

编辑 `scripts/planet-users.json`：

```json
{
  "users": [
    {
      "name": "张三",
      "phone": "13800138000",
      "planetNumber": "12345678",
      "role": "user"
    },
    {
      "name": "李四",
      "phone": "13900139000",
      "planetNumber": "87654321",
      "role": "user"
    }
  ]
}
```

**字段说明**：
- `name` (必填) - 用户姓名
- `phone` (必填) - 手机号（11位，1开头）
- `planetNumber` (必填) - 星球编号
- `role` (可选) - 角色：`user` 或 `admin`

### 方案 B：CSV 格式

创建 `users.csv` 文件：

```csv
name,phone,planetNumber,role
张三,13800138000,12345678,user
李四,13900139000,87654321,user
王五,15800158000,11223344,user
```

---

## 🚀 第二步：导入用户数据

### 导入 JSON 文件

```bash
# 使用默认文件（scripts/planet-users.json）
pnpm tsx scripts/import-planet-users.ts

# 或指定自定义文件
pnpm tsx scripts/import-planet-users.ts /path/to/your/users.json
```

### 导入 CSV 文件

```bash
pnpm tsx scripts/import-planet-users.ts /path/to/your/users.csv
```

### 导入结果示例

```
🚀 星球用户导入工具
=====================================

📂 读取文件: ./scripts/planet-users.json

👥 开始导入星球用户...
📊 共 3 个用户待导入

📝 导入: 张三 | 手机: 13800138000 | 星球: 12345678
   ✅ 成功

📝 导入: 李四 | 手机: 13900139000 | 星球: 87654321
   ✅ 成功

=====================================
📊 导入完成统计:
   ✅ 成功: 3 个
   ⚠️  跳过: 0 个
   ❌ 失败: 0 个
=====================================

📋 最近导入的用户:
  👤 张三 | 📱 13800138000 | 🌐 12345678
  👤 李四 | 📱 13900139000 | 🌐 87654321
```

---

## 🔐 第三步：用户登录

### 登录页面访问

用户访问以下 URL 进行登录：

```
本地开发: http://localhost:3000/auth/planet-login
生产环境: https://yourdomain.com/auth/planet-login
```

### 登录流程

1. **输入手机号**：11位中国大陆手机号（1开头）
2. **输入星球编号**：知识星球的编号
3. **点击登录**：系统自动验证

### 登录验证逻辑

```
1. 验证手机号格式 (/^1[3-9]\d{9}$/)
2. 查询数据库中是否存在该手机号
3. 验证星球编号是否匹配
4. 检查用户是否被封禁
5. 创建登录会话
6. 跳转到日报列表页面
```

---

## 🎨 登录界面预览

登录页面包含：
- ✅ 手机号输入框（带格式验证）
- ✅ 星球编号输入框
- ✅ 登录按钮（带加载状态）
- ✅ 错误提示信息
- ✅ 响应式设计（支持移动端）

---

## 📊 数据验证规则

### 手机号验证
- 必须是11位数字
- 必须以1开头
- 第二位必须是3-9
- 正则表达式：`/^1[3-9]\d{9}$/`

### 星球编号验证
- 必须与数据库中存储的一致
- 区分大小写

---

## 🛠️ 常见问题

### Q1: 用户登录失败提示"用户不存在"

**原因**：手机号未导入数据库
**解决**：
```bash
# 检查该手机号是否已导入
pnpm tsx scripts/check-db-connection.ts

# 重新导入用户数据
pnpm tsx scripts/import-planet-users.ts
```

### Q2: 登录提示"星球编号不正确"

**原因**：输入的星球编号与数据库不匹配
**解决**：
1. 检查数据库中的星球编号（使用 Drizzle Studio）
2. 确认输入时没有多余空格
3. 确认大小写是否匹配

### Q3: 如何批量修改用户的星球编号？

```bash
# 创建更新脚本
cat > scripts/update-planet-numbers.ts << 'EOF'
import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// 批量更新
await client`
  UPDATE "user"
  SET planet_number = '新编号'
  WHERE phone = '13800138000'
`;

await client.end();
EOF

pnpm tsx scripts/update-planet-numbers.ts
```

### Q4: 如何查看已导入的用户？

**方式 1：使用 Drizzle Studio**
```bash
# 访问浏览器
https://local.drizzle.studio
```

**方式 2：使用 SQL 查询**
```bash
cat > scripts/list-planet-users.ts << 'EOF'
import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

const users = await client`
  SELECT name, phone, planet_number
  FROM "user"
  WHERE phone IS NOT NULL
  ORDER BY created_at DESC
`;

console.table(users);
await client.end();
EOF

pnpm tsx scripts/list-planet-users.ts
```

---

## 🔧 自定义配置

### 修改登录后跳转地址

编辑 `src/components/auth/planet-login-form.tsx`：

```typescript
if (result.success) {
  // 修改这里的跳转地址
  router.push('/reports'); // 改成你想要的地址
  router.refresh();
}
```

### 修改页面标题和描述

编辑 `src/app/[locale]/auth/planet-login/page.tsx`：

```typescript
export const metadata: Metadata = {
  title: '你的标题',
  description: '你的描述',
};
```

### 添加更多验证规则

编辑 `src/actions/planet-auth.ts`：

```typescript
// 例如：添加星球编号长度验证
if (planetNumber.length !== 8) {
  return {
    success: false,
    error: '星球编号必须是8位',
  };
}
```

---

## 📈 测试流程

### 1. 导入测试用户

```bash
pnpm tsx scripts/import-planet-users.ts
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 访问登录页面

```
http://localhost:3000/auth/planet-login
```

### 4. 使用测试账号登录

```
手机号：13800138000
星球编号：12345678
```

### 5. 登录成功后

会自动跳转到 `/reports` 页面（日报列表）

---

## 📁 文件清单

### 数据库相关
- `src/db/schema.ts` - 添加了 phone 和 planet_number 字段
- `scripts/add-phone-fields.ts` - 添加字段的脚本

### 导入工具
- `scripts/import-planet-users.ts` - 主导入脚本
- `scripts/planet-users.json` - JSON 示例
- `scripts/planet-users.csv` - CSV 示例

### 认证逻辑
- `src/actions/planet-auth.ts` - 认证 API

### 登录界面
- `src/components/auth/planet-login-form.tsx` - 表单组件
- `src/app/[locale]/auth/planet-login/page.tsx` - 页面路由

---

## 🚀 部署到生产环境

### 1. 导入生产用户数据

```bash
# 准备生产环境用户数据
# production-users.json

# 设置生产数据库环境变量
export DATABASE_URL="postgresql://..."

# 导入
pnpm tsx scripts/import-planet-users.ts production-users.json
```

### 2. 部署应用

```bash
# 构建
pnpm build

# 部署到 Vercel/其他平台
vercel deploy --prod
```

### 3. 测试登录

访问：`https://yourdomain.com/auth/planet-login`

---

## 🔒 安全建议

1. ✅ **HTTPS**：生产环境必须使用 HTTPS
2. ✅ **限流**：添加登录失败次数限制（防暴力破解）
3. ✅ **日志**：记录登录尝试日志
4. ✅ **会话**：设置合理的会话过期时间
5. ✅ **备份**：定期备份用户数据

---

## 📞 技术支持

如有问题，请联系：
- 邮箱：support@yourcompany.com
- 文档：本文件
- 代码：`src/actions/planet-auth.ts`

---

## 🎉 快速开始

```bash
# 1. 准备数据
vim scripts/planet-users.json

# 2. 导入用户
pnpm tsx scripts/import-planet-users.ts

# 3. 启动服务
pnpm dev

# 4. 访问登录
open http://localhost:3000/auth/planet-login
```

完成！现在用户可以使用手机号和星球编号登录了。
