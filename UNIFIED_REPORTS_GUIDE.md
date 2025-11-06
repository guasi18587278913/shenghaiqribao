# 统一日报+知识库系统 - 使用指南

## 📋 已完成功能

### ✅ 核心实现

1. **数据库结构** ✅
   - 新增 `knowledge_collection` 表（知识库合集）
   - 新增 `collection_topic` 表（合集和话题的多对多关系）
   - 完整的索引和关系设计

2. **Server Actions** ✅
   - `unified-reports.ts` - 统一的数据获取接口
   - 分类统计、按月查询、按主题查询
   - 知识库合集管理

3. **前端组件** ✅
   - `UnifiedSidebar` - 统一的分类侧边栏
   - `DateView` - 按日期浏览视图
   - `TopicView` - 按主题浏览视图
   - `CollectionCard` - 知识库合集卡片
   - `ViewSwitcher` - 视图切换器

4. **页面** ✅
   - `/reports` - 统一的日报+知识库页面
   - `/knowledge/[slug]` - 知识库合集详情页

---

## 🚀 快速启动

### 第1步：应用数据库迁移

```bash
cd /Users/liyadong/Documents/GitHub/日报网站-mksaas/mksaas_template/mksaas_template-main

# 方法1：推送schema到数据库（开发环境推荐）
pnpm db:push

# 或方法2：生成迁移文件再应用（生产环境推荐）
pnpm db:generate
pnpm db:migrate
```

**注意事项**：
- 执行 `pnpm db:push` 时会有交互式提示
- 如果询问 `user_phone_unique` 约束，选择 "No, add the constraint without truncating the table"
- 如果询问 `icon` 列，选择 "+ icon create column"

### 第2步：启动开发服务器

```bash
pnpm dev
```

访问：http://localhost:3002/reports

---

## 🎯 功能使用说明

### 用户视角

#### 1. 访问日报页面

```
http://localhost:3002/reports
```

默认显示：
- 左侧：主题分类导航
- 顶部：视图切换（按日期 / 按主题）
- 右侧：内容区域

#### 2. 按日期浏览

1. 点击顶部 "按日期浏览" 标签
2. 使用右上角的月份选择器选择月份
3. 点击左侧分类可过滤该分类的日报
4. 点击日报卡片查看详情

**URL 格式**：
```
/reports?view=date&month=2025-11&category=dev-tools
```

#### 3. 按主题浏览（知识库）

1. 点击顶部 "按主题浏览" 标签
2. 左侧选择分类查看该分类的合集
3. 如果不选分类，显示精选合集
4. 点击合集卡片查看详细内容

**URL 格式**：
```
/reports?view=topic&category=account-device
```

#### 4. 查看知识库合集详情

- 点击任何合集卡片
- 进入 `/knowledge/[slug]` 页面
- 按顺序查看该合集的所有话题
- 每个话题可以：
  - 查看编辑注释
  - 查看标签和分类
  - 点击"查看原讨论"跳转到源日报

---

## 👨‍💻 编辑/管理员操作

### 创建知识库合集

目前需要通过数据库或脚本创建。后续可以添加后台管理界面。

#### 方法1：直接插入数据库

```sql
-- 1. 创建合集
INSERT INTO knowledge_collection (
  id, title, slug, description, category, icon,
  topic_count, is_featured, created_by, created_at, updated_at
) VALUES (
  'claude-guide-2024',
  'Claude使用完全指南',
  'claude-complete-guide',
  '从注册到API调用的完整教程，整合了100+条Claude相关讨论',
  '开发工具',
  '🤖',
  0,
  true,
  'your-user-id',
  NOW(),
  NOW()
);

-- 2. 添加话题到合集
INSERT INTO collection_topic (
  id, collection_id, topic_id, sort_order, curator_note, added_at, added_by
) VALUES (
  'ct-1',
  'claude-guide-2024',
  'topic-id-from-daily-topic-table',
  1,
  '这个讨论解决了Claude注册时的手机号验证问题',
  NOW(),
  'your-user-id'
);

-- 3. 更新合集的话题数量
UPDATE knowledge_collection
SET topic_count = (
  SELECT COUNT(*) FROM collection_topic WHERE collection_id = 'claude-guide-2024'
)
WHERE id = 'claude-guide-2024';
```

#### 方法2：创建脚本（推荐）

创建 `scripts/create-collection.ts`:

```typescript
import { db } from '@/db/db'
import { knowledgeCollection, collectionTopic } from '@/db/schema'
import { generateId } from '@/lib/utils'

async function createCollection() {
  // 1. 创建合集
  const [collection] = await db.insert(knowledgeCollection).values({
    id: generateId(),
    title: 'Claude使用完全指南',
    slug: 'claude-complete-guide',
    description: '从注册到API调用的完整教程',
    category: '开发工具',
    icon: '🤖',
    topicCount: 0,
    isFeatured: true,
    createdBy: 'admin-user-id',
  }).returning()

  console.log('合集创建成功:', collection)

  // 2. 添加话题（示例）
  const topicIds = ['topic-1', 'topic-2', 'topic-3'] // 从daily_topic表获取

  for (const [index, topicId] of topicIds.entries()) {
    await db.insert(collectionTopic).values({
      id: generateId(),
      collectionId: collection.id,
      topicId: topicId,
      sortOrder: index + 1,
      curatorNote: '编辑注释...',
    })
  }

  // 3. 更新话题数量
  await db.update(knowledgeCollection)
    .set({ topicCount: topicIds.length })
    .where(eq(knowledgeCollection.id, collection.id))

  console.log('话题添加完成!')
}

createCollection().catch(console.error)
```

运行：
```bash
tsx scripts/create-collection.ts
```

### 管理合集中的话题

#### 添加话题到合集

```typescript
import { db } from '@/db/db'
import { collectionTopic } from '@/db/schema'

await db.insert(collectionTopic).values({
  id: generateId(),
  collectionId: 'collection-id',
  topicId: 'topic-id',
  sortOrder: 10,
  curatorNote: '这是一个重要的讨论，解决了...',
})
```

#### 调整话题排序

```typescript
// 更新sortOrder字段
await db.update(collectionTopic)
  .set({ sortOrder: 5 })
  .where(eq(collectionTopic.id, 'collection-topic-id'))
```

#### 移除话题

```typescript
await db.delete(collectionTopic)
  .where(eq(collectionTopic.id, 'collection-topic-id'))
```

---

## 📊 URL 参数说明

### `/reports` 页面支持的参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `view` | `date` \| `topic` | 视图模式 | `?view=date` |
| `category` | `string` | 分类slug | `?category=dev-tools` |
| `month` | `string` | 月份（YYYY-MM） | `?month=2025-11` |

### 完整示例

```
# 按日期浏览，查看2025年11月的开发工具分类
/reports?view=date&month=2025-11&category=dev-tools

# 按主题浏览，查看账号与设备分类的知识库合集
/reports?view=topic&category=account-device

# 按日期浏览，不过滤分类，查看当前月
/reports?view=date

# 按主题浏览，显示精选合集
/reports?view=topic
```

---

## 🎨 自定义和扩展

### 添加新分类

在 `src/actions/unified-reports.ts` 中修改：

```typescript
export function getCategorySlug(category: string): string {
  const slugMap: Record<string, string> = {
    // ... 现有分类
    '你的新分类': 'your-new-category',
  }
  return slugMap[category] || category.toLowerCase().replace(/\s+/g, '-')
}

export function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    // ... 现有分类
    '你的新分类': '🎯',
  }
  return iconMap[category] || '📁'
}
```

### 修改侧边栏样式

编辑 `src/components/reports/unified-sidebar.tsx`

### 修改视图切换样式

编辑 `src/components/reports/view-switcher.tsx`

---

## 🔧 技术架构

### 数据流

```
用户操作 → URL参数变化 → ViewSwitcher (Client Component)
                                  ↓
                      根据URL参数触发导航
                                  ↓
                 Page.tsx (Server Component) 读取参数
                                  ↓
                   传递给 DateView 或 TopicView
                                  ↓
                    调用 Server Actions 获取数据
                                  ↓
                            渲染内容
```

### 核心概念

**同一批数据，两种视图**：

```typescript
// 数据源
Topics = [topic1, topic2, topic3, ...]

// 视图1：按时间组织
DateView = Topics.filter(t => t.reportId === selectedReport)

// 视图2：按主题组织
TopicView = Topics.filter(t => t.collectionIds.includes(selectedCollection))
```

### 文件结构

```
src/
├── actions/
│   └── unified-reports.ts          # 统一的Server Actions
├── components/reports/
│   ├── unified-sidebar.tsx         # 统一侧边栏
│   ├── view-switcher.tsx           # 视图切换器（Client Component）
│   ├── date-view.tsx               # 按日期视图（Server Component）
│   ├── topic-view.tsx              # 按主题视图（Server Component）
│   ├── collection-card.tsx         # 合集卡片
│   └── month-selector.tsx          # 月份选择器（已修改）
├── app/[locale]/(marketing)/
│   ├── reports/page.tsx            # 统一入口页面
│   └── knowledge/[slug]/page.tsx   # 合集详情页
└── db/schema.ts                    # 数据库表结构（已修改）
```

---

## ✅ 测试清单

### 基础功能测试

- [ ] 访问 `/reports` 默认显示按日期视图
- [ ] 点击"按日期浏览"标签，显示日报列表
- [ ] 点击"按主题浏览"标签，显示知识库合集列表
- [ ] 左侧点击不同分类，内容正确过滤
- [ ] 按日期视图：月份选择器工作正常
- [ ] 日报卡片点击可跳转到详情页
- [ ] 合集卡片点击可跳转到合集详情页

### 知识库合集测试

- [ ] 创建一个测试合集
- [ ] 添加3-5个话题到合集
- [ ] 访问合集详情页，话题按顺序显示
- [ ] 话题的编辑注释正确显示
- [ ] "查看原讨论"链接正确跳转

### URL参数测试

- [ ] `/reports?view=date` 显示日期视图
- [ ] `/reports?view=topic` 显示主题视图
- [ ] `/reports?category=dev-tools` 分类过滤生效
- [ ] `/reports?month=2025-11` 月份过滤生效
- [ ] 组合参数正常工作

---

## 🐛 常见问题

### Q1: 数据库迁移失败

**问题**: 执行 `pnpm db:push` 时报错

**解决**:
1. 检查数据库连接：确认 `.env` 中的 `DATABASE_URL` 正确
2. 确认数据库可访问
3. 尝试手动连接数据库查看是否有权限问题

### Q2: 左侧分类没有显示数量

**问题**: 分类旁边的数量显示为0

**解决**:
1. 确认 `daily_topic` 表中有数据
2. 检查 `category` 字段的值是否与代码中的分类名称匹配
3. 运行 `getCategoryStats()` 查看返回结果

### Q3: 知识库合集详情页404

**问题**: 访问 `/knowledge/[slug]` 返回404

**解决**:
1. 确认合集已创建且 `slug` 字段正确
2. 检查数据库中 `knowledge_collection` 表是否有数据
3. 确认slug拼写正确（URL中的slug要与数据库匹配）

### Q4: 页面报类型错误

**问题**: TypeScript类型错误

**解决**:
1. 运行 `pnpm install` 确保依赖完整
2. 重启开发服务器
3. 检查导入路径是否正确

---

## 📝 后续优化建议

### 短期优化（1-2周）

1. **后台管理界面**
   - 创建 `/dashboard/collections` 页面
   - 可视化创建和编辑合集
   - 拖拽排序话题

2. **搜索功能**
   - 全文搜索话题
   - 搜索建议

3. **移动端优化**
   - 添加移动端侧边栏（抽屉式）
   - 底部导航栏适配

### 中期优化（1个月）

1. **统计分析**
   - 合集浏览量统计
   - 热门话题排行
   - 用户阅读偏好分析

2. **社交功能**
   - 合集收藏
   - 分享功能
   - 评论系统集成

3. **内容推荐**
   - 相关合集推荐
   - 基于标签的推荐

### 长期优化（2-3个月）

1. **AI辅助**
   - 自动生成合集描述
   - 智能推荐话题到合集
   - 自动打标签

2. **多语言支持**
   - 英文界面
   - 多语言合集

3. **导出功能**
   - 导出合集为PDF
   - 导出为Markdown

---

## 🎉 完成！

你的统一日报+知识库系统已经ready！

**下一步操作**：
1. 运行数据库迁移：`pnpm db:push`
2. 启动开发服务器：`pnpm dev`
3. 访问 http://localhost:3002/reports 查看效果
4. 创建第一个知识库合集测试功能

有任何问题欢迎随时询问！🚀
