# 侧边栏变体组件集合

Welcome! 这是一个包含5个不同设计方案的知识分类侧边栏组件集合。

## 快速开始 (30秒)

```typescript
import { SidebarDAutoCollapse } from '@/components/test/variants';

<SidebarDAutoCollapse
  knowledgeCategories={categories}
  selectedCategory={selected}
  onSelectCategory={setSelected}
/>
```

## 5个方案一览

| 方案 | 组件名 | 特点 | 推荐指数 |
|-----|--------|------|--------|
| **E** | `SidebarECurrent` | 基准实现 | ⭐⭐ |
| **A** | `SidebarAAllExpand` | 默认全收起 | ⭐⭐⭐ |
| **B** | `SidebarBNoExpand` | 只显示分类 | ⭐⭐ |
| **C** | `SidebarCHoverPopup` | Hover弹出 | ⭐⭐⭐ |
| **D** | `SidebarDAutoCollapse` | 自动收起 | **⭐⭐⭐⭐⭐** |

## 推荐方案

**方案D (SidebarDAutoCollapse)** 综合体验最优:
- 空间利用最佳
- 用户交互清晰
- 自动收起避免混淆
- 文章智能截断
- 适应各种场景

## 文档导航

1. **[QUICKSTART.md](./QUICKSTART.md)** - 5分钟快速上手
2. **[COMPARISON.md](./COMPARISON.md)** - 详细方案对比表
3. **[VARIANTS_README.md](./VARIANTS_README.md)** - 完整功能文档
4. **[STRUCTURE.txt](./STRUCTURE.txt)** - 架构和结构说明
5. **[SUMMARY.txt](./SUMMARY.txt)** - 创建完成总结

## 文件列表

### 组件文件 (5个)
- `sidebar-e-current.tsx` - 当前方案 (基准对比)
- `sidebar-a-all-expand.tsx` - 方案A (默认全收起)
- `sidebar-b-no-expand.tsx` - 方案B (只显示分类)
- `sidebar-c-hover-popup.tsx` - 方案C (Hover悬浮)
- `sidebar-d-auto-collapse.tsx` - 方案D (自动收起) ⭐推荐

### 索引和导出
- `index.ts` - 导出所有组件和信息

### 文档 (4个)
- `QUICKSTART.md` - 快速开始指南
- `COMPARISON.md` - 方案对比表
- `VARIANTS_README.md` - 完整参考文档
- `STRUCTURE.txt` - 架构说明文档
- `SUMMARY.txt` - 创建总结
- `README.md` - 本文件

## 核心特性

所有组件都包含:
- ✅ TypeScript 完全支持
- ✅ 深色模式适配
- ✅ 响应式设计
- ✅ 统一的Props接口
- ✅ Lucide图标集成
- ✅ TailwindCSS样式

## 使用示例

### 基础使用

```typescript
import { SidebarDAutoCollapse } from '@/components/test/variants';
import { useState } from 'react';

export function Page() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex">
      <SidebarDAutoCollapse
        knowledgeCategories={categories}
        selectedCategory={selected}
        onSelectCategory={setSelected}
      />
      <main className="flex-1">
        {/* 主内容 */}
      </main>
    </div>
  );
}
```

### 导入所有组件

```typescript
import {
  SidebarECurrent,
  SidebarAAllExpand,
  SidebarBNoExpand,
  SidebarCHoverPopup,
  SidebarDAutoCollapse,
} from '@/components/test/variants';
```

### 获取方案信息

```typescript
import { SIDEBAR_VARIANTS } from '@/components/test/variants';

// 访问方案信息
const recommendedPlan = SIDEBAR_VARIANTS.D;
console.log(recommendedPlan.name); // "方案D: 自动收起 (推荐)"
console.log(recommendedPlan.features); // 特性列表
```

## 方案对比速览

### 方案A vs 方案D

| 特性 | A | D |
|-----|---|---|
| 默认状态 | 全收起 | 全收起 |
| 同时展开 | 多个 | 1个(最多) |
| 文章数 | 全部显示 | 限8篇 |
| 推荐指数 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 方案B的优势

- 最简洁设计
- 空间占用最小
- 适合分类很多的场景

### 方案C的创新

- 使用HoverCard悬浮显示
- 鼠标悬停查看文章
- 充分利用空间

## 常见问题

**Q: 我应该用哪个方案?**
A: 推荐使用方案D。如果有特殊需求:
- 需要多展开: 用方案A
- 空间受限: 用方案B
- 喜欢悬停: 用方案C

**Q: 可以修改显示数量吗?**
A: 可以。以方案D为例,修改 `ARTICLES_LIMIT = 8` 常量即可。

**Q: 如何自定义样式?**
A: 传入 `className` 属性或直接修改源代码的TailwindCSS类。

**Q: 支持移动设备吗?**
A: 所有组件都是响应式的,但侧边栏模式在手机上可能需要改用Drawer或Sheet。

**Q: 性能如何?**
A: 所有方案性能都很好,即使有大量分类和文章也能流畅运行。

## 技术栈

- **React 18+** - UI框架
- **TypeScript** - 类型系统
- **Next.js 15** - 框架
- **TailwindCSS** - 样式
- **Radix UI** - 无头UI组件
- **Lucide Icons** - 图标库

## 集成到项目

1. **选择方案** - 决定使用哪个组件
2. **导入组件** - `import { Sidebar... } from '@/components/test/variants'`
3. **传入数据** - 提供 `knowledgeCategories` 数据
4. **管理状态** - 使用 `selectedCategory` 和 `onSelectCategory`
5. **测试调整** - 在不同设备和主题下测试

## 文件位置

```
src/components/test/variants/
├── sidebar-a-all-expand.tsx
├── sidebar-b-no-expand.tsx
├── sidebar-c-hover-popup.tsx
├── sidebar-d-auto-collapse.tsx
├── sidebar-e-current.tsx
├── index.ts
├── QUICKSTART.md
├── COMPARISON.md
├── VARIANTS_README.md
├── STRUCTURE.txt
├── SUMMARY.txt
└── README.md (本文件)
```

## 相关文件

- 原始实现: `/src/components/reports/knowledge-category-sidebar.tsx`
- 类型定义: `/src/lib/knowledge-categories.ts`
- UI组件: `/src/components/ui/`

## 下一步

1. 阅读 [QUICKSTART.md](./QUICKSTART.md) (5分钟)
2. 查看 [COMPARISON.md](./COMPARISON.md) (选择方案)
3. 参考源代码实现细节
4. 集成到你的项目

## 支持

如有问题:
- 查看对应文档文件
- 阅读组件源代码注释
- 参考完整的 VARIANTS_README.md

## 许可证

与主项目保持一致

---

**祝你使用愉快!** 🚀

立即开始: `import { SidebarDAutoCollapse } from '@/components/test/variants';`
