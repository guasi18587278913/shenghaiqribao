# 快速开始指南 (Quick Start)

## 5分钟快速上手

### 1. 基础使用

选择你想使用的组件,导入并使用:

```typescript
import { SidebarDAutoCollapse } from '@/components/test/variants';

export function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="flex">
      <SidebarDAutoCollapse
        knowledgeCategories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <main className="flex-1">
        {/* Your main content here */}
      </main>
    </div>
  );
}
```

### 2. 数据准备

确保你的分类数据符合格式:

```typescript
const categories: KnowledgeCategory[] = [
  {
    slug: 'ai-basics',
    title: 'AI基础',
    icon: 'BookOpen',
    articles: [
      { slug: 'intro', title: 'AI简介' },
      { slug: 'ml', title: '机器学习基础' },
    ],
  },
  {
    slug: 'web3',
    title: 'Web3出海',
    icon: 'Rocket',
    articles: [
      { slug: 'defi', title: 'DeFi概念' },
      { slug: 'nft', title: 'NFT应用' },
    ],
  },
];
```

### 3. 方案对比

根据你的需求选择合适的方案:

| 需求 | 推荐方案 |
|-----|--------|
| 快速导航,最少配置 | **D** (SidebarDAutoCollapse) |
| 需要多个分类同时展开 | A (SidebarAAllExpand) |
| 空间极其受限 | B (SidebarBNoExpand) |
| 喜欢悬停预览效果 | C (SidebarCHoverPopup) |
| 对比当前实现 | E (SidebarECurrent) |

**最推荐: 方案D** ⭐

### 4. 常见修改

#### 修改文章显示数量 (方案D)

打开 `sidebar-d-auto-collapse.tsx`,找到:

```typescript
const ARTICLES_LIMIT = 8;  // 改成你想要的数字
```

#### 修改侧边栏宽度

使用 `className` 属性:

```typescript
<SidebarDAutoCollapse
  knowledgeCategories={categories}
  selectedCategory={selected}
  onSelectCategory={setSelected}
  className="w-72" // 原来是 w-64,改成 w-72 (更宽)
/>
```

#### 修改样式主题

所有组件都支持深色模式,自动响应系统主题。

### 5. 集成到现有项目

**步骤1:** 导入组件
```typescript
import { SidebarDAutoCollapse } from '@/components/test/variants';
```

**步骤2:** 替换旧组件
```typescript
// 旧的
<KnowledgeCategorySidebar {...props} />

// 新的
<SidebarDAutoCollapse {...props} />
```

**步骤3:** 测试和微调
- 测试不同屏幕尺寸
- 测试深色/浅色模式
- 根据需要调整样式

---

## 核心特性

### 所有方案都有

✅ 响应式设计
✅ 深色模式支持
✅ Lucide 图标集成
✅ 流畅动画
✅ 键盘无障碍支持
✅ TypeScript 完全类型安全

### 方案D独有

✅ 自动收起其他分类
✅ 长列表智能截断
✅ "查看更多"链接
✅ 最优空间利用

---

## 常见问题

### Q: 如何处理没有文章的分类?

A: 所有方案都内置了空状态检查,会显示"暂无文章"提示。

### Q: 可以改变颜色/样式吗?

A: 可以,所有组件使用 TailwindCSS,通过修改类名或传入 `className` 属性自定义。

### Q: 支持国际化吗?

A: 当前文本是硬编码的中文,可以传入配置或使用 i18n 库进行翻译。

### Q: 性能如何?

A: 所有方案都经过优化,即使有大量分类和文章也能流畅运行。

### Q: 可以添加搜索功能吗?

A: 可以,在侧边栏顶部添加搜索输入框,过滤 `knowledgeCategories` 即可。

### Q: 如何处理分类变化?

A: 组件接收 `knowledgeCategories` 作为 prop,它会自动响应变化。

---

## 文件结构

```
src/components/test/variants/
├── sidebar-e-current.tsx          # 当前方案 (基准)
├── sidebar-a-all-expand.tsx       # 方案A: 默认全收起
├── sidebar-b-no-expand.tsx        # 方案B: 只显示分类
├── sidebar-c-hover-popup.tsx      # 方案C: Hover悬浮
├── sidebar-d-auto-collapse.tsx    # 方案D: 自动收起 (推荐)
├── index.ts                        # 导出和信息索引
├── VARIANTS_README.md              # 详细文档
├── COMPARISON.md                   # 方案对比表
└── QUICKSTART.md                   # 本文件
```

---

## 下一步

1. **查看对比表:** 阅读 [COMPARISON.md](./COMPARISON.md)
2. **学习详情:** 阅读 [VARIANTS_README.md](./VARIANTS_README.md)
3. **代码实现:** 打开各方案的 `.tsx` 文件
4. **复制到生产:** 选择最佳方案并集成

---

## 获取帮助

- 查看 [COMPARISON.md](./COMPARISON.md) 的决策树
- 查看组件源码中的注释
- 参考 [VARIANTS_README.md](./VARIANTS_README.md) 的常见问题

---

**祝你使用愉快!** 🚀
