# 侧边栏变体组件 (Sidebar Variants)

本目录包含5个不同设计方案的知识分类侧边栏组件,可用于对比测试和选择最佳设计方案。

## 文件概览

### 1. sidebar-e-current.tsx - 当前方案 (Base for Comparison)

**导出组件:** `SidebarECurrent`

**描述:** 保持原有的完整实现,作为基准对比参考。

**特点:**
- 多个分类可同时展开
- 展开时显示全部文章
- 文字使用默认大小
- 完整对比参考

**使用场景:** 对比参考基准

---

### 2. sidebar-a-all-expand.tsx - 方案A: 默认全收起

**导出组件:** `SidebarAAllExpand`

**描述:** 所有分类默认收起,用户可以手动展开任意分类,支持多个分类同时展开。

**特点:**
- 所有分类默认收起状态
- 用户可手动展开任意分类
- 文字使用 `text-sm` 改进可读性
- 显示每个分类的文章数量
- 多个分类可同时展开
- 空状态提示"暂无文章"

**优势:**
- 界面简洁,不会一打开就显示大量内容
- 用户可灵活选择展开哪些分类
- 文章数量清晰可见

**适用场景:** 中等数量分类和文章的场景

---

### 3. sidebar-b-no-expand.tsx - 方案B: 只显示分类,无二级

**导出组件:** `SidebarBNoExpand`

**描述:** 完全不显示二级文章列表,只显示分类,用户点击分类进行筛选,设计简洁紧凑。

**特点:**
- 完全不显示二级文章列表
- 只显示分类列表
- 点击分类进行内容筛选
- 显示分类和文章的统计数据
- 视觉简洁紧凑

**优势:**
- 侧边栏最简洁,占用空间最小
- 减少视觉复杂度
- 快速分类导航

**适用场景:** 空间受限或内容很多的场景

---

### 4. sidebar-c-hover-popup.tsx - 方案C: Hover悬浮弹出

**导出组件:** `SidebarCHoverPopup`

**描述:** 使用 HoverCard 组件,鼠标悬停显示文章列表浮层,点击分类切换选中状态。

**特点:**
- 使用 HoverCard 组件实现悬浮
- 鼠标悬停显示文章列表浮层
- 点击分类切换选中状态
- 浮层宽度320px (w-80)
- 文章列表可滚动 (max-h-80)
- 显示分类文章统计

**优势:**
- 节省侧边栏空间,保持整洁
- 交互友好,信息按需展示
- 浮层可自适应位置

**适用场景:** 侧边栏空间受限或希望保持界面简洁的场景

---

### 5. sidebar-d-auto-collapse.tsx - 方案D: 自动收起 (推荐)

**导出组件:** `SidebarDAutoCollapse`

**描述:** 推荐方案 - 默认全收起,点击分类展开,同时最多只有一个分类展开,其他会自动收起。

**特点:**
- 默认全部收起
- 点击某个分类时展开该分类
- 自动收起其他已展开的分类
- 同时最多只有一个分类展开
- 每个分类最多显示8篇文章 (ARTICLES_LIMIT = 8)
- 超过限制时显示"查看全部 X 篇"按钮
- 文字使用 `text-sm`,层级清晰
- 空状态提示"暂无文章"

**优势:**
- 空间利用最优,界面不会过于拥挤
- 用户焦点明确,同时只展开一个分类
- 长列表自动截断,显示摘要内容
- 层级关系清晰,易于理解
- 操作直观,自动收起避免混淆

**适用场景:** 推荐作为默认方案,适合大多数场景

---

## 组件 Props 对比

所有组件都遵循统一的接口设计:

```typescript
interface SidebarProps {
  knowledgeCategories: KnowledgeCategory[];
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  className?: string;
}
```

| 属性 | 类型 | 必需 | 说明 |
|-----|------|------|------|
| `knowledgeCategories` | `KnowledgeCategory[]` | 是 | 知识分类数据 |
| `selectedCategory` | `string \| null` | 否 | 当前选中分类 slug,默认为 null |
| `onSelectCategory` | `(category: string \| null) => void` | 否 | 分类选择回调,默认为空函数 |
| `className` | `string` | 否 | 自定义 CSS 类名 |

---

## 导入和使用

### 方式1: 单个导入

```typescript
import { SidebarDAutoCollapse } from '@/components/test/variants';

// 在组件中使用
<SidebarDAutoCollapse
  knowledgeCategories={categories}
  selectedCategory={selected}
  onSelectCategory={setSelected}
/>
```

### 方式2: 从 index.ts 导入

```typescript
import {
  SidebarECurrent,
  SidebarAAllExpand,
  SidebarBNoExpand,
  SidebarCHoverPopup,
  SidebarDAutoCollapse,
} from '@/components/test/variants';
```

### 方式3: 访问变体信息

```typescript
import { SIDEBAR_VARIANTS } from '@/components/test/variants';

// 遍历所有变体
Object.entries(SIDEBAR_VARIANTS).forEach(([key, variant]) => {
  console.log(`${key}: ${variant.name}`);
  console.log(`描述: ${variant.description}`);
  console.log(`特点:`, variant.features);
});
```

---

## 开发建议

### 选择方案的考虑因素

1. **分类数量**
   - 少于5个: 推荐方案A或B
   - 5-10个: 推荐方案D(自动收起)
   - 超过10个: 推荐方案B(无扩展)或C(Hover弹出)

2. **文章数量**
   - 每个分类文章少于5篇: 推荐方案A或B
   - 每个分类文章5-15篇: 推荐方案D
   - 每个分类文章超过20篇: 推荐方案C(浮层滚动)

3. **空间限制**
   - 空间充足: 推荐方案A或D
   - 空间受限: 推荐方案B或C

4. **用户交互习惯**
   - 希望快速浏览: 推荐方案B
   - 希望详细查看: 推荐方案A或D
   - 希望轻量级交互: 推荐方案C

### 最终推荐

**推荐使用方案D (SidebarDAutoCollapse)**,原因:

- 空间利用最优
- 用户交互清晰
- 性能最佳(同时最多渲染一个分类的文章)
- 扩展性好(可轻松处理大量分类)
- 视觉层级清晰
- 适应性强(适合大多数场景)

---

## 样式和响应式

所有组件都:
- 使用相同的基础样式(宽度w-64,sticky定位等)
- 支持深色模式 (dark:)
- 响应式设计(overflow-y-auto)
- 使用 TailwindCSS 和 cn() 工具函数

---

## 数据结构

期望的 `KnowledgeCategory` 数据结构:

```typescript
interface KnowledgeCategory {
  slug: string;
  title: string;
  description?: string;
  icon: string; // Lucide icon name
  articles: Array<{
    slug: string;
    title: string;
    description?: string;
  }>;
}
```

---

## 常见问题

### Q: 如何在实际项目中使用这些组件?

A: 选择最适合你的设计方案,将对应的组件导入并使用,参考上方"导入和使用"部分。

### Q: 可以同时使用多个变体吗?

A: 可以,这些组件是独立的,可以根据不同的页面或场景使用不同的变体。

### Q: 如何自定义组件样式?

A: 所有组件都接受 `className` 属性,可以通过 Tailwind 自定义样式。

### Q: 推荐的默认方案是哪个?

A: 推荐使用 **方案D (SidebarDAutoCollapse)**,综合考虑用户体验、空间利用和性能。

---

## 文件大小对比

| 组件 | 文件大小 | 说明 |
|-----|--------|------|
| sidebar-e-current.tsx | ~6.8 KB | 基准实现 |
| sidebar-a-all-expand.tsx | ~7.5 KB | 默认全收起 |
| sidebar-b-no-expand.tsx | ~5.7 KB | 最小 |
| sidebar-c-hover-popup.tsx | ~7.7 KB | 需要 HoverCard |
| sidebar-d-auto-collapse.tsx | ~8.7 KB | 功能最完整 |

---

## 更新日志

### 初始版本 (2024-11-07)

- 创建5个侧边栏变体组件
- 建立统一的接口规范
- 创建索引文件和文档

---

## 相关文件

- 原始实现: `/src/components/reports/knowledge-category-sidebar.tsx`
- 类型定义: `/src/lib/knowledge-categories.ts`
- UI 组件: `/src/components/ui/collapsible.tsx`, `/src/components/ui/hover-card.tsx`

---

祝你使用愉快!
