/**
 * Knowledge Base Categories Configuration
 *
 * 知识库分类配置
 * 支持动态读取文件系统的分类结构
 */

export interface KnowledgeCategory {
  name: string;           // 中文名称
  slug: string;           // URL slug
  icon: string;           // Lucide 图标名
  description: string;    // 描述
  order: number;          // 排序
  articleCount?: number;  // 文章数（动态统计）
}

/**
 * 静态分类配置（用于AI推荐和初始化）
 */
export const STATIC_CATEGORIES: KnowledgeCategory[] = [
  {
    name: '账号与设备',
    slug: 'account',
    icon: 'User',
    description: 'Google、Claude、GitHub 等核心账号的注册、养号与风控',
    order: 1,
  },
  {
    name: '网络与代理',
    slug: 'network',
    icon: 'Globe',
    description: '网络环境配置、代理选择、IP 风险检测',
    order: 2,
  },
  {
    name: '支付与订阅',
    slug: 'payment',
    icon: 'CreditCard',
    description: '海外支付方式、虚拟卡申请、订阅管理',
    order: 3,
  },
  {
    name: '开发工具',
    slug: 'dev-tools',
    icon: 'Code',
    description: 'Cursor、Claude Code、GitHub 等开发工具配置',
    order: 4,
  },
  {
    name: '项目执行',
    slug: 'project',
    icon: 'Rocket',
    description: '项目规划、开发流程、部署上线',
    order: 5,
  },
  {
    name: '产品与增长',
    slug: 'product-growth',
    icon: 'TrendingUp',
    description: '产品设计、用户增长、数据分析',
    order: 6,
  },
  {
    name: '社群与学习',
    slug: 'community',
    icon: 'Users',
    description: '社群运营、学习方法、资源分享',
    order: 7,
  },
  {
    name: '学习认知与避坑',
    slug: 'learning',
    icon: 'Lightbulb',
    description: '学习方法、认知提升、常见误区',
    order: 8,
  },
  {
    name: '成本规划',
    slug: 'cost',
    icon: 'DollarSign',
    description: '成本控制、预算规划、省钱技巧',
    order: 9,
  },
];

/**
 * 根据 slug 获取分类
 */
export function getCategoryBySlug(slug: string): KnowledgeCategory | undefined {
  return STATIC_CATEGORIES.find(cat => cat.slug === slug);
}

/**
 * 根据名称获取分类
 */
export function getCategoryByName(name: string): KnowledgeCategory | undefined {
  return STATIC_CATEGORIES.find(cat => cat.name === name);
}

/**
 * 根据关键词推荐分类
 */
export function suggestCategoryByKeywords(text: string): {
  category: KnowledgeCategory | null;
  confidence: number;
} {
  const keywords: Record<string, string[]> = {
    account: ['账号', '注册', '登录', 'google', 'claude', 'github', '验证', '风控', '设备', 'mac', 'windows', '账户'],
    network: ['网络', '代理', 'vpn', 'tun', '节点', '科学上网', '梯子', 'ip', '翻墙', 'clash', 'v2ray'],
    payment: ['支付', '付费', '订阅', '信用卡', '虚拟卡', 'paypal', 'stripe', '充值', '续费', '信用卡', 'depay'],
    'dev-tools': ['cursor', 'claude code', 'codex', 'ide', '编程', '开发', 'vscode', 'copilot', 'ai编程', 'github'],
    project: ['部署', '上线', 'supabase', 'neon', 'vercel', 'git', 'api', '项目', '调试', '运维', '数据库'],
    'product-growth': ['产品', '增长', '用户', '数据', '分析', 'idea', '验证', '推广', '获客', '营销'],
    community: ['社群', '学习', '交流', '分享', '资源', '合作', '圈友', '社区'],
    learning: ['认知', '避坑', '误区', '方法', '心态', '技巧', '新手', '踩坑'],
    cost: ['成本', '预算', '省钱', '费用', '免费', '优惠', '合购', '拼车', '便宜'],
  };

  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};

  // 计算每个分类的匹配分数
  for (const [slug, words] of Object.entries(keywords)) {
    scores[slug] = words.reduce((score, word) => {
      return score + (lowerText.includes(word.toLowerCase()) ? 1 : 0);
    }, 0);
  }

  // 找到最高分
  const bestMatch = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])[0];

  if (bestMatch && bestMatch[1] > 0) {
    const category = getCategoryBySlug(bestMatch[0]);
    // 置信度：匹配数 / 3，最大为 1
    const confidence = Math.min(bestMatch[1] / 3, 1);
    return { category: category || null, confidence };
  }

  return { category: null, confidence: 0 };
}

/**
 * 生成文件名 slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')           // 空格替换为连字符
    .replace(/[^\w\-\u4e00-\u9fa5]+/g, '') // 只保留字母、数字、连字符和中文
    .replace(/\-\-+/g, '-')         // 多个连字符合并为一个
    .replace(/^-+/, '')             // 去掉开头的连字符
    .replace(/-+$/, '');            // 去掉结尾的连字符
}
