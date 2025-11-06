# AI出海社群日报系统

基于 MkSaaS 模板开发的社群日报系统，自动处理微信群聊记录，使用 AI 提炼有价值内容，生成每日精华日报。

## 🎯 功能特性

### ✅ 已实现功能

- **消息管理**
  - 微信群聊记录上传（支持 .txt 和 .html 格式）
  - 三阶段智能过滤（本地过滤 → AI 初筛 → AI 精炼）
  - 自动去重和消息合并
  - 支持 4 个微信群的消息导入

- **AI 处理引擎**
  - 使用 DeepSeek 进行成本优化的初步筛选
  - 使用 GPT-4o 进行高质量的话题生成
  - 自动话题聚类和摘要生成
  - 智能分类（技术教程、产品案例、出海经验、工具推荐、行业动态、问答精选）

- **日报管理**
  - 日报创建和编辑
  - 话题管理（标题、摘要、分类、标签、重要度）
  - 草稿/发布状态管理
  - 可视化编辑器（支持添加编辑点评）

- **前端展示**
  - 日报列表页面
  - 日报详情页面
  - 话题卡片展示
  - 响应式设计

- **互动功能**
  - 评论系统（支持嵌套评论）
  - 精华评论标记
  - 浏览数、点赞数统计

- **数据库设计**
  - 完整的 PostgreSQL schema
  - 优化的索引设计
  - 支持高并发访问

## 📦 项目结构

```
src/
├── db/
│   └── schema.ts                    # 数据库 schema（新增日报相关表）
├── types/
│   └── daily-report.ts              # TypeScript 类型定义
├── lib/
│   └── daily-report/
│       ├── message-parser.ts        # 消息解析和过滤
│       └── ai-processor.ts          # AI 处理引擎
├── actions/
│   └── daily-report.ts              # Server Actions
├── components/
│   └── daily-report/
│       ├── message-upload-form.tsx  # 消息上传表单
│       ├── report-list.tsx          # 日报列表
│       ├── daily-report-card.tsx    # 日报卡片
│       ├── topic-card.tsx           # 话题卡片
│       └── comment-section.tsx      # 评论区
└── app/
    └── [locale]/
        ├── (protected)/
        │   └── dashboard/
        │       └── reports/
        │           ├── page.tsx              # 日报管理首页
        │           └── upload/
        │               └── page.tsx          # 消息上传页面
        └── (marketing)/
            └── reports/
                ├── page.tsx                  # 公开日报列表
                └── [id]/
                    └── page.tsx              # 日报详情页
```

## 🚀 快速开始

### 1. 环境配置

在 `.env` 文件中添加以下配置：

```bash
# 数据库（必需）
DATABASE_URL="postgresql://user:password@host:5432/database"

# AI API Keys（必需）
DEEPSEEK_API_KEY="your-deepseek-api-key"
OPENAI_API_KEY="your-openai-api-key"

# 其他已有的 MkSaaS 配置...
```

### 2. 数据库迁移

```bash
# 生成迁移文件
pnpm db:generate

# 应用迁移
pnpm db:migrate

# 或直接推送 schema（开发环境）
pnpm db:push
```

### 3. 启动开发服务器

```bash
pnpm install
pnpm dev
```

访问 http://localhost:3000

### 4. 访问管理后台

- 登录账户后访问: `/dashboard/reports`
- 上传消息: `/dashboard/reports/upload`
- 公开日报列表: `/reports`

## 📝 使用流程

### 日常工作流程（每天）

#### 第一步：导出微信群聊记录

1. 打开微信 PC 版或使用第三方工具导出聊天记录
2. 选择导出格式：.txt 或 .html
3. 导出当天的聊天记录（建议每天晚上 22:00）

#### 第二步：上传消息

1. 访问 `/dashboard/reports/upload`
2. 选择对应的群组（群1-4）
3. 上传导出的聊天记录文件
4. 系统会自动：
   - 解析消息
   - 过滤掉纯表情、红包、系统消息等噪音（Stage 1）
   - 合并 5 分钟内的连续消息
   - 存储到数据库

#### 第三步：AI 处理生成日报草稿

```typescript
// 使用 Server Action 处理消息
import { processMessagesAndCreateReport } from '@/actions/daily-report';

// 在管理后台调用
const result = await processMessagesAndCreateReport(
  new Date('2025-10-31'),
  ['group1', 'group2', 'group3', 'group4'],
  userId
);

// 返回结果
{
  success: true,
  reportId: 'report_xxx',
  stats: {
    totalMessages: 2000,
    filteredMessages: 450,
    topicsGenerated: 8,
    estimatedCost: { totalCost: 0.023 }
  }
}
```

AI 处理流程：
- **Stage 2**: DeepSeek 初筛（成本 ~¥2-3）
- **Stage 3**: GPT-4o 话题生成（成本 ~¥15-20）
- 总成本: 约 ¥17-23/天

#### 第四步：人工审核优化

1. 访问 `/dashboard/reports`
2. 查看 AI 生成的日报草稿
3. 编辑优化：
   - 调整话题标题
   - 补充编辑点评
   - 调整话题排序
   - 修改分类和标签
4. 点击"发布"

#### 第五步：定时发布

- 设置定时发布：次日早上 08:00
- 自动更新到网站
- 发送邮件通知（TODO）

## 💡 API 使用示例

### 创建日报

```typescript
import { createDailyReport } from '@/actions/daily-report';

await createDailyReport({
  date: new Date(),
  title: '2025-10-31 AI出海社群日报',
  summary: '今天讨论了...',
}, userId);
```

### 创建话题

```typescript
import { createTopic } from '@/actions/daily-report';

await createTopic({
  reportId: 'report_xxx',
  title: 'Cursor 新功能测评',
  summary: '多位用户分享了 Cursor 的使用心得...',
  category: '工具推荐',
  importance: 4,
  tags: ['AI编程', 'Cursor'],
  sortOrder: 0,
});
```

### 上传消息

```typescript
import { uploadMessages } from '@/actions/daily-report';
import { parseWeChatExport } from '@/lib/daily-report/message-parser';

const content = await file.text();
const messages = parseWeChatExport(content, 'group1', 'txt');

await uploadMessages({
  groupName: 'group1',
  messages,
});
```

### 完整处理流程

```typescript
import { processMessagesAndCreateReport } from '@/actions/daily-report';

const result = await processMessagesAndCreateReport(
  new Date(),
  ['group1', 'group2', 'group3', 'group4'],
  userId
);
```

## 📊 数据库表结构

### daily_report (日报表)
- id, date, title, summary, status, views, likes, commentCount
- createdBy, createdAt, updatedAt, publishedAt

### daily_topic (话题表)
- id, reportId, title, summary, editorNote
- category, importance, tags[], sourceMessages, sourceGroup
- views, likes, commentCount, sortOrder

### raw_message (原始消息表)
- id, groupName, senderName, senderId, content
- messageType, timestamp, isProcessed, aiScore
- category, linkedTopicId

### comment (评论表)
- id, userId, targetType, targetId, parentId
- content, likes, isFeatured, isDeleted

### user_preference (用户偏好表)
- userId, subscribedTags[], emailNotification
- notificationTime, unreadCount, lastViewedAt

### knowledge_item (知识库表)
- id, type, title, description, url, content
- tags[], referencedInTopics[], views, likes

## 🎨 自定义配置

### 修改群组名称

编辑 `src/components/daily-report/message-upload-form.tsx`:

```typescript
const GROUP_OPTIONS = [
  { value: 'group1', label: '你的群名称 A' },
  { value: 'group2', label: '你的群名称 B' },
  { value: 'group3', label: '你的群名称 C' },
  { value: 'group4', label: '你的群名称 D' },
];
```

### 调整话题分类

编辑 `src/types/daily-report.ts`:

```typescript
export type TopicCategory =
  | '技术教程'
  | '产品案例'
  | '出海经验'
  | '工具推荐'
  | '行业动态'
  | '问答精选'
  | '你的自定义分类'; // 添加新分类
```

### 修改 AI Prompt

编辑 `src/lib/daily-report/ai-processor.ts` 中的 prompt 内容。

## 💰 成本估算

### 每日运营成本

假设每天 2000 条消息：

```
Stage 1 (本地过滤): 免费
  2000 → 600-800 条 (过滤 60-70%)

Stage 2 (DeepSeek 初筛): ¥2-3
  600-800 → 400-500 条 (再过滤 30%)

Stage 3 (GPT-4o 精炼): ¥15-20
  400-500 → 10-15 个话题

每日总成本: ¥17-23
每月总成本: ¥500-700
```

### 优化建议

1. **使用国产模型**: DeepSeek 比 GPT-4 便宜 10 倍
2. **Prompt 优化**: 减少 token 消耗
3. **批量处理**: 降低 API 调用次数
4. **本地部署**: 考虑部署开源模型（Qwen-7B）

## 🔧 故障排查

### 问题：数据库连接失败

```bash
# 检查 DATABASE_URL 是否正确
echo $DATABASE_URL

# 测试数据库连接
pnpm db:studio
```

### 问题：AI 处理失败

```bash
# 检查 API Keys
echo $DEEPSEEK_API_KEY
echo $OPENAI_API_KEY

# 查看错误日志
tail -f .next/server.log
```

### 问题：消息解析失败

- 检查文件格式是否正确（.txt 或 .html）
- 查看文件编码（应为 UTF-8）
- 确认时间戳格式: `2025-10-31 10:30:45 用户名`

## 🚧 待开发功能

- [ ] 邮件推送功能
- [ ] 用户订阅偏好管理
- [ ] 知识库系统
- [ ] 每周精华周报
- [ ] 话题热力图
- [ ] 高级搜索功能
- [ ] 数据统计面板
- [ ] 自动化定时任务

## 📚 相关文档

- [MkSaaS 文档](https://mksaas.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Next.js 15](https://nextjs.org/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

基于 MkSaaS 许可证
