# Supabase 数据库连接配置指南

## 🎯 问题说明

如果你在 Supabase 控制台看到 "Not IPv4 compatible" 警告，不用担心！这只是因为你查看的是 **Direct connection** 模式。

## ✅ 正确配置（已完成）

你的项目已经正确配置为使用 **Pooler 连接**：

```env
DATABASE_URL="postgresql://postgres.eznqagxoknmycgnfazcr:LiYaDonG797917@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

注意关键部分：`pooler.supabase.com` ← 这是 Pooler 连接

## 🔧 在 Supabase 控制台查看正确的连接字符串

### 步骤 1：打开项目设置
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 **"Project Settings"** ⚙️
4. 点击 **"Database"**

### 步骤 2：查看 Connection Pooling 配置
在 Database 设置页面，向下滚动找到 **"Connection Pooling"** 部分

你会看到两种 Pooler 配置：

#### 选项 A：Session Mode（推荐用于本地开发）
```
Connection string:
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

Port: 5432
Mode: Session
```

**特点**：
- ✅ 保持会话状态
- ✅ 支持事务和 prepared statements
- ✅ 适合本地开发
- ✅ 最接近直连体验

#### 选项 B：Transaction Mode（推荐用于 Serverless）
```
Connection string:
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

Port: 6543
Mode: Transaction
```

**特点**：
- ✅ 每个事务一个连接
- ✅ 最适合 Serverless/Edge Functions
- ✅ Vercel、Cloudflare Workers 等平台
- ⚠️ 不支持某些 PostgreSQL 特性（如 LISTEN/NOTIFY）

### 步骤 3：根据部署环境选择

**本地开发和 VPS 部署**：
```env
# Session Pooler (端口 5432)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**Vercel/Cloudflare/Serverless 部署**：
```env
# Transaction Pooler (端口 6543)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

## 📊 三种连接方式对比

| 连接类型 | 端口 | URL 格式 | IPv4要求 | 推荐场景 |
|---------|------|----------|---------|----------|
| **Direct** | 5432 | `db.xxx.supabase.co` | ⚠️ 需要 | Docker、VPS 长连接 |
| **Session Pooler** | 5432 | `pooler.supabase.com` | ✅ 不需要 | 本地开发、Next.js |
| **Transaction Pooler** | 6543 | `pooler.supabase.com` | ✅ 不需要 | Vercel、Serverless |

## 🔍 如何验证连接

### 方法 1：使用我们的测试脚本

```bash
cd mksaas_template/mksaas_template-main
node scripts/test-db-connection.js
```

成功输出：
```
✅ Database connection successful!
✅ Found 15 tables in the database
```

### 方法 2：使用 Drizzle Studio

```bash
npm run db:studio
# 或
pnpm db:studio
```

访问 `https://local.drizzle.studio` 查看数据库

### 方法 3：启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

如果能正常启动并访问页面，说明数据库连接正常

## ❓ 常见问题

### Q1: 为什么 Supabase 控制台显示 "Not IPv4 compatible"？

**答**：因为控制台默认显示的是 **Direct connection** 模式。切换到 "Connection Pooling" 查看即可。

### Q2: 我应该使用哪种连接方式？

**答**：
- 本地开发：**Session Pooler** (端口 5432)
- Vercel 部署：**Transaction Pooler** (端口 6543)
- Docker/VPS：**Session Pooler** 或 **Direct**

### Q3: Connection Pooler 和 Direct Connection 有什么区别？

**答**：
- **Direct**：直接连接数据库，需要 IPv4，连接数有限
- **Pooler**：通过连接池管理，无 IPv4 要求，适合 Serverless

### Q4: 端口 5432 和 6543 有什么区别？

**答**：
- **5432**：Session mode - 保持会话状态
- **6543**：Transaction mode - 每个事务独立连接

### Q5: 我的项目用哪个端口？

**答**：看你的 `.env` 文件中 `DATABASE_URL` 的端口号即可。

当前你的配置：
```
aws-1-ap-northeast-1.pooler.supabase.com:5432
                                        ^^^^
                                    Session Pooler
```

## 🚀 最佳实践

1. **开发环境**：使用 Session Pooler (5432)
2. **生产环境（Vercel）**：使用 Transaction Pooler (6543)
3. **永远不要**：把密码提交到 Git
4. **使用环境变量**：不同环境用不同的 `.env` 文件

## 📝 环境变量示例

### 本地开发 (`.env.local`)
```env
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

### Vercel 生产环境
```env
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
```

## 🔐 安全建议

1. 定期在 Supabase 控制台重置数据库密码
2. 不同环境使用不同的数据库（开发/测试/生产）
3. 启用 Supabase 的 IP 白名单（如果需要）
4. 使用 Supabase 的 RLS (Row Level Security) 保护数据

## 📚 相关文档

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Drizzle ORM with Supabase](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**总结**：你的数据库连接配置是正确的！Supabase 控制台的 IPv4 警告只是针对 Direct connection 的，你使用的是 Pooler，完全没问题！✅
