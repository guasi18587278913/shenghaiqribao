# 日报网站部署指南

## 项目概述

这是一个完整的日报网站系统，基于 Next.js 15 构建，包含以下核心功能：

### 🎯 核心功能
- ✅ **手机号 + 星球编号登录系统** - 安全的用户认证
- ✅ **智能欢迎弹窗** - 登录成功后自动显示，带毛玻璃效果
- ✅ **千人千面** - 个性化用户问候
- ✅ **官方通知系统** - 自动推送重要通知
- ✅ **日报内容管理** - 完整的内容发布和管理系统
- ✅ **知识库系统** - 结构化知识管理
- ✅ **用户积分系统** - 完整的积分管理
- ✅ **Stripe 支付集成** - 订阅和一次性支付

### 🎨 技术特色
- **毛玻璃效果设计** - 苹果风格的高级感 UI
- **响应式设计** - 完美适配各种设备
- **国际化支持** - 中英文双语
- **深色模式** - 自动切换主题

---

## 📝 部署前准备

### 1. 推送代码到 GitHub

由于需要 GitHub 认证，请手动执行以下命令：

```bash
cd /Users/liyadong/Documents/GitHub/日报网站-mksaas/mksaas_template/mksaas_template-main

# 如果使用 SSH (推荐)
git push -u origin main

# 如果使用 HTTPS，需要输入 GitHub 用户名和 Personal Access Token
# 创建 Token: https://github.com/settings/tokens
```

如果推送失败，请确保：
- ✅ GitHub 仓库已创建: https://github.com/guasi18587278913/ribaowanzhang
- ✅ 已配置 SSH key 或 Personal Access Token
- ✅ 有仓库的写入权限

### 2. 准备环境变量

在 Vercel 部署时，需要配置以下环境变量（从 `.env` 文件复制）：

#### 必需的环境变量

```env
# Database
DATABASE_URL=your_postgres_database_url

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=https://your-domain.vercel.app

# OAuth (如果使用)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe (如果使用支付功能)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (如果使用邮件功能)
RESEND_API_KEY=your_resend_api_key
```

---

## 🚀 Vercel 部署步骤

### 方法 1: 使用 Vercel CLI (推荐)

1. **安装 Vercel CLI**
```bash
pnpm add -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署到 Vercel**
```bash
cd /Users/liyadong/Documents/GitHub/日报网站-mksaas/mksaas_template/mksaas_template-main
vercel
```

4. **配置环境变量**
按照提示配置项目，然后在 Vercel Dashboard 中添加环境变量。

5. **生产环境部署**
```bash
vercel --prod
```

### 方法 2: 使用 Vercel Dashboard

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择 "Import Git Repository"
   - 搜索并选择 `guasi18587278913/ribaowanzhang`

3. **配置项目**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

4. **添加环境变量**
   - 在 "Environment Variables" 部分
   - 添加所有必需的环境变量（见上方列表）
   - 确保选择 Production, Preview, Development 环境

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成（约 2-5 分钟）

---

## 🔧 部署后配置

### 1. 配置数据库

如果使用 Neon/Supabase PostgreSQL:

```bash
# 运行数据库迁移
pnpm db:push

# 或者使用迁移文件
pnpm db:migrate
```

### 2. 配置 Stripe Webhook

1. 访问 Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. 添加新的 Endpoint:
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events to send:
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
3. 复制 Webhook Secret，添加到 Vercel 环境变量

### 3. 配置 OAuth 回调 URL

#### GitHub OAuth
1. 访问 https://github.com/settings/developers
2. 更新 OAuth App:
   - Homepage URL: `https://your-domain.vercel.app`
   - Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

#### Google OAuth
1. 访问 https://console.cloud.google.com/apis/credentials
2. 更新 OAuth 2.0 Client:
   - Authorized JavaScript origins: `https://your-domain.vercel.app`
   - Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`

### 4. 更新 Better Auth URL

在 Vercel Dashboard 的环境变量中:
```env
BETTER_AUTH_URL=https://your-actual-domain.vercel.app
```

重新部署以应用更改。

---

## 📊 验证部署

### 检查列表

- [ ] 网站可以正常访问
- [ ] 登录页面正常显示
- [ ] 可以使用手机号 + 星球编号登录
- [ ] 登录成功后显示欢迎弹窗
- [ ] 欢迎弹窗显示正确的用户名
- [ ] 日报列表可以正常加载
- [ ] 数据库连接正常
- [ ] Stripe 支付功能正常（如果启用）
- [ ] 邮件发送功能正常（如果启用）

### 测试步骤

1. **测试登录功能**
```
访问: https://your-domain.vercel.app/auth/login
输入测试用户的手机号和星球编号
验证欢迎弹窗是否显示
```

2. **测试日报功能**
```
访问: https://your-domain.vercel.app/reports
检查日报列表是否加载
点击查看日报详情
```

3. **测试知识库**
```
访问: https://your-domain.vercel.app/knowledge
检查知识库内容是否显示
```

---

## 🐛 常见问题

### Q: 部署失败，提示构建错误

**A**: 检查以下内容:
1. 确保所有环境变量已正确配置
2. 检查 `DATABASE_URL` 是否可以从 Vercel 访问
3. 查看 Vercel 部署日志获取具体错误信息

### Q: 登录后没有显示欢迎弹窗

**A**: 检查:
1. 浏览器控制台是否有错误
2. 数据库中是否有用户数据
3. 环境变量 `DATABASE_URL` 是否正确

### Q: 数据库连接失败

**A**:
1. 确认数据库 URL 格式正确
2. 检查数据库是否允许 Vercel IP 访问
3. 对于 Neon/Supabase，确认已启用 "Pooler" 模式

### Q: Stripe Webhook 不工作

**A**:
1. 确认 Webhook URL 正确
2. 检查 Webhook Secret 是否正确配置
3. 在 Stripe Dashboard 查看 Webhook 日志

---

## 🔒 安全建议

### 环境变量安全

- ✅ 永远不要提交 `.env` 文件到 Git
- ✅ 使用 Vercel 环境变量管理敏感信息
- ✅ 生产环境使用不同的密钥
- ✅ 定期轮换 API 密钥和 Secret

### 数据库安全

- ✅ 使用强密码
- ✅ 启用 SSL 连接
- ✅ 定期备份数据
- ✅ 限制数据库访问 IP

### 用户安全

- ✅ 启用 HTTPS（Vercel 默认）
- ✅ 实施速率限制
- ✅ 记录安全事件
- ✅ 定期审查用户访问日志

---

## 📈 性能优化

### Vercel 配置优化

1. **启用 Edge Functions**（如需要）
2. **配置 CDN 缓存**
3. **启用图片优化**
4. **配置合适的 Region**（建议使用香港节点 hkg1）

### 数据库优化

1. **使用连接池**
2. **添加适当的索引**
3. **启用查询缓存**
4. **定期分析慢查询**

---

## 📞 支持

如果遇到问题:

1. **查看文档**: 阅读项目中的其他文档文件
2. **检查日志**: Vercel Dashboard -> Deployments -> 查看日志
3. **数据库状态**: 使用 `pnpm db:studio` 查看数据库
4. **社区支持**: 在项目的 GitHub Issues 中提问

---

## 📝 更新日志

### v1.0.0 (2025-11-06)
- ✅ 初始版本发布
- ✅ 实现手机号 + 星球编号登录
- ✅ 添加欢迎弹窗功能
- ✅ 实现千人千面用户问候
- ✅ 集成官方通知系统
- ✅ 完整的日报管理系统
- ✅ 知识库系统
- ✅ 用户积分系统
- ✅ Stripe 支付集成

---

🎉 祝部署成功！
