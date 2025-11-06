/**
 * Category Helper Functions
 * Pure utility functions for category slug/name/icon conversions
 */

/**
 * Convert category name to URL-friendly slug
 */
export function getCategorySlug(category: string): string {
  const slugMap: Record<string, string> = {
    设备与环境: 'equipment',
    账号与设备: 'account-device',
    网络与代理: 'network-proxy',
    支付与订阅: 'payment',
    开发工具: 'dev-tools',
    项目执行: 'project',
    产品与增长: 'product-growth',
    社群与学习: 'community',
    学习认知与避坑: 'learning',
    成本规划: 'cost',
    技术教程: 'tech-tutorial',
    产品案例: 'product-case',
    出海经验: 'overseas',
    工具推荐: 'tools',
    行业动态: 'industry',
    问答精选: 'qa',
  };
  return slugMap[category] || category.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Get category icon (emoji)
 */
export function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    设备与环境: '💻',
    账号与设备: '📱',
    网络与代理: '🌐',
    支付与订阅: '💳',
    开发工具: '🔧',
    项目执行: '🚀',
    产品与增长: '📈',
    社群与学习: '👥',
    学习认知与避坑: '💡',
    成本规划: '💰',
    技术教程: '💻',
    产品案例: '📦',
    出海经验: '🌍',
    工具推荐: '🛠️',
    行业动态: '📰',
    问答精选: '❓',
  };
  return iconMap[category] || '📁';
}

/**
 * Get category name from slug
 */
export function getCategoryName(slug: string): string {
  const nameMap: Record<string, string> = {
    equipment: '设备与环境',
    'account-device': '账号与设备',
    'network-proxy': '网络与代理',
    payment: '支付与订阅',
    'dev-tools': '开发工具',
    project: '项目执行',
    'product-growth': '产品与增长',
    community: '社群与学习',
    learning: '学习认知与避坑',
    cost: '成本规划',
    'tech-tutorial': '技术教程',
    'product-case': '产品案例',
    overseas: '出海经验',
    tools: '工具推荐',
    industry: '行业动态',
    qa: '问答精选',
  };
  return nameMap[slug] || slug;
}
