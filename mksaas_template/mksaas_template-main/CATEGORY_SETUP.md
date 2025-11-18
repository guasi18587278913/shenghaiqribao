# 分类系统设置指南

本文档介绍如何初始化和使用新的日报分类系统。

## 🎯 功能概览

新的分类系统包含：
- **10个精心设计的主分类**（基于知识库结构）
- **Emoji图标**：让分类更直观
- **悬浮提示**：鼠标悬停显示详细描述
- **自动排序**：按order字段排列
- **响应式设计**：桌面和移动端完美适配

## 📋 分类列表

| 顺序 | Icon | 分类名称 | Slug | 描述 |
|------|------|---------|------|------|
| 01 | 🔐 | 账号与设备 | account-device | 账号注册、风控策略、设备选购与配置 |
| 02 | 🌐 | 网络与代理 | network-proxy | 网络配置、代理设置、科学上网指南 |
| 03 | 💳 | 支付与订阅 | payment-subscription | 国际支付、订阅管理、虚拟卡使用 |
| 04 | 🛠️ | 开发工具 | dev-tools | AI开发工具、Cursor、Claude Code等使用攻略 |
| 05 | 🚀 | 项目执行 | project-execution | 环境配置、部署上线、调试排错全流程 |
| 06 | 📈 | 产品与增长 | product-growth | 从创意到上线、产品验证、增长方法论 |
| 07 | 👥 | 社群与学习 | community-learning | 社群资源、学习路径、知识沉淀 |
| 08 | 💡 | 认知与避坑 | mindset-pitfalls | 学习认知、常见误区、避坑指南 |
| 09 | 💰 | 成本规划 | cost-planning | 成本优化、预算规划、省钱策略 |
| 10 | 💻 | 设备与环境 | device-environment | 开发环境、设备选型、系统配置 |

## 🚀 快速开始

### 方式一：通过管理后台（推荐）

1. **访问管理页面**
   ```
   http://localhost:3000/admin/categories
   ```

2. **点击"执行数据库更新"**
   - 为 category_stats 表添加必要字段
   - 首次运行必须执行

3. **点击"初始化分类数据"**
   - 创建10个预设分类
   - 自动填充icon、description等信息

### 方式二：手动SQL执行

如果你有数据库直接访问权限：

```sql
-- 1. 添加字段
ALTER TABLE category_stats ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '📁';
ALTER TABLE category_stats ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE category_stats ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE category_stats DROP COLUMN IF EXISTS display_order;
CREATE INDEX IF NOT EXISTS category_stats_order_idx ON category_stats ("order");

-- 2. 然后运行初始化脚本
-- 可以使用管理后台的"初始化分类数据"按钮
```

### 方式三：使用种子脚本

```bash
# 运行TypeScript种子脚本
pnpm tsx src/db/seed-categories.ts
```

## 📁 相关文件

### 新增文件
```
src/
├── db/
│   ├── seed-categories.ts              # 种子数据脚本
│   └── add-category-fields.sql         # SQL迁移脚本
├── actions/
│   └── admin-categories.ts             # 管理员操作
├── components/
│   ├── admin/
│   │   └── category-admin-panel.tsx    # 管理面板组件
│   └── reports/
│       └── category-nav.tsx            # 分类导航（已升级）
└── app/
    └── [locale]/(marketing)/
        └── admin/categories/
            └── page.tsx                # 管理页面
```

### 修改文件
```
src/
└── db/
    └── schema.ts                       # 扩展了 categoryStats 表
```

## 🎨 视觉效果

### 侧边栏分类导航

```
📚 内容分类

🔐 账号与设备      [5]  01
🌐 网络与代理      [3]  02
💳 支付与订阅      [8]  03
🛠️ 开发工具        [12] 04
🚀 项目执行        [10] 05
...
```

- **Icon**: 大号emoji，一目了然
- **名称**: 清晰的分类名称
- **计数**: 灰色徽章显示日报数量
- **编号**: 右侧小号灰字显示顺序（01-10）

### 悬浮卡片

鼠标悬停在分类上时，显示：
- 分类icon和名称
- 详细描述
- 日报总数
- 分类编号

## 🔐 权限说明

- **查看分类**：所有已验证用户
- **初始化分类**：仅管理员（role: 'admin'）
- **管理页面**：`/admin/categories`（仅管理员可访问）

## 💡 使用建议

### 1. 创建日报时选择分类

在创建或编辑日报主题时，从这10个分类中选择合适的分类：

```typescript
// 示例：创建日报主题
{
  title: "Cursor最新功能解析",
  category: "dev-tools",  // 使用slug
  // ...
}
```

### 2. 分类路由

用户可以通过以下URL查看特定分类的日报：

```
/reports/category/{slug}

例如：
/reports/category/dev-tools      # 开发工具分类
/reports/category/product-growth # 产品与增长分类
```

### 3. 分类统计

系统会自动更新每个分类的：
- `count`: 日报数量
- `lastSeen`: 最后使用时间
- `firstSeen`: 首次使用时间

## 🐛 常见问题

### Q1: 分类没有显示icon？

**A**: 请确保已执行"步骤1: 添加数据库字段"。可以在管理后台点击"执行数据库更新"。

### Q2: 初始化按钮无响应？

**A**: 检查：
1. 是否以管理员身份登录
2. 浏览器控制台是否有错误
3. 数据库连接是否正常

### Q3: 如何修改分类信息？

**A**: 目前可以直接在数据库中修改：

```sql
UPDATE category_stats
SET icon = '🎯', description = '新的描述'
WHERE slug = 'dev-tools';
```

后续可以开发分类管理功能。

### Q4: 能否添加新分类？

**A**: 可以！有两种方式：

**方式1**: 直接在数据库中插入
```sql
INSERT INTO category_stats (id, name, slug, icon, description, "order", is_featured)
VALUES ('custom_id', '自定义分类', 'custom-slug', '🎯', '分类描述', 11, true);
```

**方式2**: 等待后续的分类管理功能

## 🔄 更新日志

### v1.0.0 (2025-11-05)
- ✅ 扩展数据库schema，添加icon、description、order字段
- ✅ 创建10个预设分类数据
- ✅ 升级CategoryNav组件，支持icon和HoverCard
- ✅ 创建管理后台页面
- ✅ 添加server actions和种子脚本

## 📞 技术支持

如有问题，请查看：
- 项目README.md
- 源代码注释
- 或联系开发团队

---

**Happy Coding!** 🚀
