/**
 * Sidebar Variants Index
 *
 * 侧边栏变体组件集合
 * 包含5个不同设计方案的侧边栏实现
 */

export { SidebarECurrent } from './sidebar-e-current';
export type {} from './sidebar-e-current';

export { SidebarAAllExpand } from './sidebar-a-all-expand';
export type {} from './sidebar-a-all-expand';

export { SidebarBNoExpand } from './sidebar-b-no-expand';
export type {} from './sidebar-b-no-expand';

export { SidebarCHoverPopup } from './sidebar-c-hover-popup';
export type {} from './sidebar-c-hover-popup';

export { SidebarDAutoCollapse } from './sidebar-d-auto-collapse';
export type {} from './sidebar-d-auto-collapse';

/**
 * Sidebar Variants Comparison
 *
 * 方案对比表
 */
export const SIDEBAR_VARIANTS = {
  E: {
    name: '当前方案',
    description: '基准实现 - 保持原有的完整设计',
    component: 'SidebarECurrent',
    features: [
      '多个分类可同时展开',
      '展开时显示全部文章',
      '文字使用默认大小',
      '完整对比参考',
    ],
  },
  A: {
    name: '方案A: 默认全收起',
    description: '所有分类默认收起,用户手动展开',
    component: 'SidebarAAllExpand',
    features: [
      '默认全部收起状态',
      '用户可手动展开任意分类',
      '文字使用 text-sm',
      '显示分类文章数量',
      '多个分类可同时展开',
    ],
  },
  B: {
    name: '方案B: 只显示分类',
    description: '简洁紧凑 - 不显示二级文章列表',
    component: 'SidebarBNoExpand',
    features: [
      '完全不显示二级文章',
      '只显示分类列表',
      '点击分类进行筛选',
      '显示分类统计',
      '视觉简洁紧凑',
    ],
  },
  C: {
    name: '方案C: Hover悬浮弹出',
    description: '空间节省 - 鼠标悬停显示浮层',
    component: 'SidebarCHoverPopup',
    features: [
      '使用 HoverCard 组件',
      '鼠标悬停显示文章浮层',
      '点击分类切换选中',
      '节省侧边栏空间',
      '浮层最高380px可滚动',
    ],
  },
  D: {
    name: '方案D: 自动收起 (推荐)',
    description: '推荐方案 - 同时最多一个分类展开',
    component: 'SidebarDAutoCollapse',
    features: [
      '默认全部收起',
      '只能同时展开一个分类',
      '自动收起其他展开的分类',
      '每个分类最多显示8篇',
      '超过显示"查看全部"按钮',
      '层级清晰,节省空间',
      '最佳用户体验',
    ],
  },
} as const;

/**
 * Usage Example / 使用示例:
 *
 * 导入方式:
 * import { SidebarECurrent, SidebarAAllExpand, SidebarBNoExpand, SidebarCHoverPopup, SidebarDAutoCollapse } from '@/components/test/variants';
 *
 * 使用方式:
 * <SidebarDAutoCollapse
 *   knowledgeCategories={categories}
 *   selectedCategory={selected}
 *   onSelectCategory={(category) => setSelected(category)}
 * />
 */
