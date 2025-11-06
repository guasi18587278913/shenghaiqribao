# 日报网站部署指南

本指南将帮助你部署新的导航功能和分类系统。

## 📋 前置准备

在部署之前，请确保你有：

- PostgreSQL 数据库访问权限
- 已配置的环境变量（`.env` 文件）
- Node.js 和 pnpm 已安装
- 项目代码已拉取到最新版本

## 🗄️ 数据库迁移

### 1. 生成迁移文件

```bash
pnpm db:generate
```

这将根据 `src/db/schema.ts` 中的更改生成迁移文件。

### 2. 查看生成的迁移

检查 `drizzle` 目录中生成的迁移文件，确认以下更改：

- ✅ 新增 `category_stats` 表
- ✅ `daily_report` 表新增 `year` 和 `month` 字段
- ✅ 新增相关索引

### 3. 应用迁移到数据库

**开发环境：**
```bash
pnpm db:push
```

**生产环境：**
```bash
pnpm db:migrate
```

### 4. 验证迁移

连接到数据库，验证表结构：

```sql
-- 检查 category_stats 表
SELECT * FROM category_stats LIMIT 1;

-- 检查 daily_report 的新字段
SELECT id, year, month FROM daily_report LIMIT 5;
```

## 🔄 数据同步

### 1. 同步现有分类统计

如果你的数据库中已有日报和话题数据，需要同步分类统计：

创建一个临时脚本 `scripts/sync-categories.ts`：

```typescript
import { syncAllCategoryStats } from '@/actions/category-stats';
import { db } from '@/db/db';
import { dailyReport } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('开始同步分类统计...');

  // 1. 同步分类统计
  await syncAllCategoryStats();
  console.log('✅ 分类统计已同步');

  // 2. 更新现有日报的 year 和 month 字段
  const reports = await db.select().from(dailyReport);

  for (const report of reports) {
    const date = new Date(report.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    await db.update(dailyReport)
      .set({ year, month })
      .where(sql`${dailyReport.id} = ${report.id}`);
  }

  console.log(`✅ 已更新 ${reports.length} 个日报的年月信息`);
  console.log('同步完成！');
}

main();
```

运行脚本：

```bash
pnpm tsx scripts/sync-categories.ts
```

### 2. 验证数据同步

```sql
-- 检查分类统计
SELECT name, count, last_seen FROM category_stats ORDER BY count DESC;

-- 检查日报的年月字段
SELECT id, date, year, month FROM daily_report ORDER BY date DESC LIMIT 10;
```

## 🚀 部署新代码

### 1. 构建生产版本

```bash
pnpm build
```

### 2. 验证构建成功

确保没有 TypeScript 错误或 ESLint 警告。

### 3. 测试生产构建

```bash
pnpm start
```

访问以下页面验证功能：

- ✅ `/reports` - 日报列表页（带侧边栏）
- ✅ `/reports/[id]` - 日报详情页（带日期导航和分类筛选）
- ✅ `/reports/category/[slug]` - 分类浏览页
- ✅ 移动端响应式（抽屉菜单 + 底部导航）

### 4. 部署到生产环境

**Vercel 部署：**
```bash
vercel --prod
```

**Docker 部署：**
```bash
docker build -t daily-report-app .
docker run -p 3000:3000 --env-file .env daily-report-app
```

**其他平台：**
按照你的部署平台文档进行部署。

## 🧪 功能测试清单

部署后，请测试以下功能：

### 桌面端（宽度 > 768px）
- [ ] 左侧边栏固定显示
- [ ] 时间归档可折叠展开
- [ ] 分类导航显示分类统计
- [ ] 点击月份展开具体日期
- [ ] 点击日期跳转到对应日报
- [ ] 点击分类跳转到分类浏览页

### 移动端（宽度 < 768px）
- [ ] 左上角汉堡菜单显示
- [ ] 点击汉堡菜单打开抽屉侧边栏
- [ ] 底部导航栏固定显示（最新/归档/分类）
- [ ] 主内容区域有底部间距（不被底部导航遮挡）
- [ ] 抽屉侧边栏可以滑动关闭

### 日报列表页 (`/reports`)
- [ ] 显示日报卡片网格
- [ ] 分页功能正常
- [ ] 侧边栏显示时间归档和分类
- [ ] 移动端底部导航高亮"最新"

### 日报详情页 (`/reports/[id]`)
- [ ] 顶部显示日期导航（上一天/下一天）
- [ ] 显示分类筛选器（水平滚动）
- [ ] 话题按分类分组显示
- [ ] 每个分类有标题和话题数量
- [ ] 侧边栏高亮当前日期
- [ ] 移动端底部导航高亮"最新"

### 分类浏览页 (`/reports/category/[slug]`)
- [ ] 显示分类名称和总话题数
- [ ] 话题按日期分组显示
- [ ] 每组显示日期标题
- [ ] 显示话题详情（标题、摘要、标签、统计数据）
- [ ] "返回首页"按钮正常工作
- [ ] 分页功能正常
- [ ] 侧边栏高亮当前分类
- [ ] 移动端底部导航高亮"分类"

## 🐛 常见问题

### 问题 1: 分类统计显示为 0

**原因：** 未同步现有数据

**解决：** 运行分类同步脚本：
```bash
pnpm tsx scripts/sync-categories.ts
```

### 问题 2: 时间归档为空

**原因：** `year` 和 `month` 字段未填充

**解决：** 检查迁移是否成功，运行数据同步脚本

### 问题 3: 移动端底部导航遮挡内容

**原因：** 主内容区域缺少底部内边距

**解决：** 确保 `<main>` 元素有 `pb-16 md:pb-0` 类名

### 问题 4: 侧边栏在移动端显示

**原因：** 响应式类名配置错误

**解决：**
- 桌面侧边栏：`hidden md:block`
- 移动侧边栏：使用 `md:hidden` 和变换动画
- 底部导航：`md:hidden`

### 问题 5: 分类页面返回 404

**原因：** 分类 slug 不存在或分类未同步

**解决：**
1. 检查 URL 中的 slug 是否正确
2. 确认 `category_stats` 表中有该分类
3. 运行分类同步脚本

## 📊 监控和维护

### 定期任务

**每日：**
- 监控分类统计是否正常更新
- 检查新增日报的 year/month 字段是否自动填充

**每周：**
- 检查时间归档结构是否完整
- 验证分类浏览页数据准确性

**每月：**
- 清理过时的分类（如果需要）
- 优化数据库索引性能

### 性能优化建议

1. **分类统计缓存：** 考虑使用 Redis 缓存热门分类数据
2. **时间归档缓存：** 归档结构变化不频繁，可以缓存
3. **分页优化：** 对于大量数据，考虑使用游标分页
4. **图片优化：** 使用 Next.js Image 组件优化加载

## 🔐 安全注意事项

1. **输入验证：** 所有分类 slug 和日期参数都经过验证
2. **SQL 注入防护：** 使用 Drizzle ORM 的参数化查询
3. **访问控制：** 确保只有已发布的日报可公开访问
4. **速率限制：** 考虑为 API 路由添加速率限制

## 📚 相关文档

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Drizzle ORM 迁移指南](https://orm.drizzle.team/docs/migrations)
- [Vercel 部署指南](https://vercel.com/docs)
- [项目 README](./README.md)

## 🆘 获取帮助

如果遇到问题：

1. 检查数据库连接和环境变量
2. 查看应用日志
3. 验证迁移是否成功应用
4. 检查浏览器控制台是否有 JavaScript 错误
5. 参考本文档的"常见问题"部分

---

**部署完成检查清单：**

- [ ] 数据库迁移已应用
- [ ] 现有数据已同步
- [ ] 生产构建成功
- [ ] 所有测试用例通过
- [ ] 桌面端功能正常
- [ ] 移动端响应式正常
- [ ] 性能满足要求
- [ ] 安全检查完成

祝部署顺利！🎉
