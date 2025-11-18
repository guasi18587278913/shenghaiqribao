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
 * 与 daily-report 系统的 16 个分类保持一致
 */
export const STATIC_CATEGORIES: KnowledgeCategory[] = [
  // === 新增分类（排在前面，因为更常用） ===
  {
    name: '技术教程',
    slug: 'tech-tutorial',
    icon: 'BookOpen',
    description: '编程教程、技术指南、开发实践',
    order: 1,
  },
  {
    name: '产品案例',
    slug: 'product-case',
    icon: 'Package',
    description: '成功案例、产品分析、实战经验',
    order: 2,
  },
  {
    name: '出海经验',
    slug: 'overseas-experience',
    icon: 'Plane',
    description: '出海策略、市场洞察、本地化经验',
    order: 3,
  },
  {
    name: '工具推荐',
    slug: 'tool-recommendation',
    icon: 'Wrench',
    description: '效率工具、开发工具、资源推荐',
    order: 4,
  },
  {
    name: '行业动态',
    slug: 'industry-trends',
    icon: 'TrendingUp',
    description: 'AI行业趋势、技术前沿、市场变化',
    order: 5,
  },
  {
    name: '问答精选',
    slug: 'qa-selection',
    icon: 'MessageCircle',
    description: '高质量问答、常见问题、解决方案',
    order: 6,
  },
  {
    name: '设备与环境',
    slug: 'device-environment',
    icon: 'Monitor',
    description: '硬件选购、开发环境配置、系统优化',
    order: 7,
  },

  // === 原有分类（保持不变） ===
  {
    name: '账号与设备',
    slug: 'account',
    icon: 'User',
    description: 'Google、Claude、GitHub 等核心账号的注册、养号与风控',
    order: 8,
  },
  {
    name: '网络与代理',
    slug: 'network',
    icon: 'Globe',
    description: '网络环境配置、代理选择、IP 风险检测',
    order: 9,
  },
  {
    name: '支付与订阅',
    slug: 'payment',
    icon: 'CreditCard',
    description: '海外支付方式、虚拟卡申请、订阅管理',
    order: 10,
  },
  {
    name: '开发工具',
    slug: 'dev-tools',
    icon: 'Code',
    description: 'Cursor、Claude Code、GitHub 等开发工具配置',
    order: 11,
  },
  {
    name: '项目执行',
    slug: 'project',
    icon: 'Rocket',
    description: '项目规划、开发流程、部署上线',
    order: 12,
  },
  {
    name: '产品与增长',
    slug: 'product-growth',
    icon: 'TrendingUp',
    description: '产品设计、用户增长、数据分析',
    order: 13,
  },
  {
    name: '社群与学习',
    slug: 'community',
    icon: 'Users',
    description: '社群运营、学习方法、资源分享',
    order: 14,
  },
  {
    name: '学习认知与避坑',
    slug: 'learning',
    icon: 'Lightbulb',
    description: '学习方法、认知提升、常见误区',
    order: 15,
  },
  {
    name: '成本规划',
    slug: 'cost',
    icon: 'DollarSign',
    description: '成本控制、预算规划、省钱技巧',
    order: 16,
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
 * 根据关键词推荐分类（增强版）
 * 支持 16 个分类，与 daily-report 系统一致
 */
export function suggestCategoryByKeywords(text: string): {
  category: KnowledgeCategory | null;
  confidence: number;
} {
  const keywords: Record<string, string[]> = {
    // === 新增分类 ===
    'tech-tutorial': [
      '教程', '指南', '入门', '实践', '步骤', '教学',
      'tutorial', 'guide', 'howto', '如何', '怎么',
      '从零', '基础', '进阶', '完整', '详解'
    ],
    'product-case': [
      '案例', '实战', '成功', '失败', '经验', '分享',
      '做了', '上线了', '发布了', '赚了', '收入',
      '用户', '增长', 'mvp', '验证', '小程序', 'app'
    ],
    'overseas-experience': [
      '出海', '海外', '国际化', '本地化', '跨境',
      '市场', '策略', '推广', '合规', '税务',
      '海外市场', '海外用户', 'global', 'international'
    ],
    'tool-recommendation': [
      '推荐', '工具', '软件', '资源', '插件', '库',
      '好用', '效率', '神器', '利器', '必备',
      'recommend', 'tool', 'plugin', 'library', 'framework'
    ],
    'industry-trends': [
      '趋势', '行业', '动态', '新闻', '前沿', '技术',
      '发布', '更新', '新版本', '新功能',
      'ai', '人工智能', '大模型', 'gpt', 'claude',
      'trend', 'news', 'release', 'update'
    ],
    'qa-selection': [
      '问题', '问答', '疑问', '求助', '请教', '咨询',
      '为什么', '怎么办', '如何解决', '报错', '不行',
      '回答', '解答', '解决', '方案',
      'question', 'answer', 'qa', 'help', 'issue'
    ],
    'device-environment': [
      '设备', '环境', '配置', '系统', '电脑', '服务器',
      '硬件', '性能', '优化', '安装', '部署环境',
      'mac', 'windows', 'linux', 'docker', 'vm',
      '内存', 'cpu', '显卡', 'gpu', 'm1', 'm2', 'm3', 'm4'
    ],

    // === 原有分类（更新关键词） ===
    account: [
      '账号', '注册', '登录', '验证', '风控', '账户', '封号',
      'google', 'claude', 'github', 'apple', 'microsoft',
      '选购', '购买'
    ],
    network: [
      '网络', '代理', 'vpn', 'tun', '节点', '科学上网', '梯子', '翻墙',
      'ip', '地区', 'region', 'clash', 'v2ray', 'shadowsocks',
      '全局', '规则', '增强模式', 'http', 'https', '协议'
    ],
    payment: [
      '支付', '付费', '订阅', '续费', '充值', '扣费',
      '信用卡', '虚拟卡', '银行卡', '国际卡',
      'paypal', 'stripe', 'depay', 'nobepay',
      '美元', '刀', 'usd', '价格', '费用', '套餐'
    ],
    'dev-tools': [
      'cursor', 'claude code', 'codex', 'atlas', 'copilot',
      'vscode', 'ide', '编程', '开发', 'ai编程',
      'chat', 'composer', '快捷键', '命令', '功能',
      '报错', '错误', '解决', '调试', 'debug',
      '安装', '配置', '设置', '使用', '技巧',
      'sonnet', 'claude', 'chatgpt', 'deepseek',
      '模型', 'model', 'bypass', '危险模式'
    ],
    project: [
      '部署', '上线', '发布', '运维', '服务器',
      'supabase', 'neon', 'vercel', 'netlify', 'cloudflare',
      'git', 'github', 'gitlab', 'api', '接口',
      '项目', '代码', 'bug', '测试', '数据库',
      'database', 'sql', 'postgres', 'mysql', '容器化', 'docker'
    ],
    'product-growth': [
      '产品', '增长', '用户', '数据', '分析',
      'idea', '创意', '验证', '推广', '获客', '营销',
      '流量', '转化', 'seo', '运营', '策略',
      '击中', '痛点', '目标用户', '精准'
    ],
    community: [
      '社群', '学习', '交流', '分享', '资源', '合作',
      '圈友', '社区', '群友', '成员', '课程', '训练营',
      '线下', '集训', '活动', '小排', '老师', '群内'
    ],
    learning: [
      '认知', '避坑', '误区', '方法', '心态', '技巧',
      '新手', '小白', '踩坑', '经验', '建议',
      '学习', '理解', '思考', '方向', '路径',
      '进步', '成长', '提升'
    ],
    cost: [
      '成本', '预算', '省钱', '费用', '免费', '优惠',
      '合购', '拼车', '便宜', '划算', '性价比',
      '价格', '多少钱', '元', '块', '刀', '美元',
      '折扣', '代购', '闲鱼', '拼多多', '国补', '教育优惠',
      '小几十', '几十块'
    ],
  };

  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};

  // 计算每个分类的匹配分数（使用加权算法）
  for (const [slug, words] of Object.entries(keywords)) {
    let score = 0;
    for (const word of words) {
      const lowerWord = word.toLowerCase();
      // 完整单词匹配得 2 分
      if (lowerText.includes(` ${lowerWord} `) ||
          lowerText.startsWith(lowerWord) ||
          lowerText.endsWith(lowerWord)) {
        score += 2;
      }
      // 部分匹配得 1 分
      else if (lowerText.includes(lowerWord)) {
        score += 1;
      }
    }
    scores[slug] = score;
  }

  // 强化支付/订阅场景的优先级
  const paymentHints = ['支付', '订阅', '充值', '扣费', '续费'];
  const hasPaymentHint = paymentHints.some((h) => text.includes(h));
  if (hasPaymentHint) {
    scores['payment'] = (scores['payment'] ?? 0) + 3;
  }

  // 找到最高分
  const bestMatch = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])[0];

  if (bestMatch && bestMatch[1] > 0) {
    const category = getCategoryBySlug(bestMatch[0]);
    // 置信度计算：分数 / 5，最大为 1
    const confidence = Math.min(bestMatch[1] / 5, 1);

    console.log(`[Category] 推荐分类: ${category?.name}, 置信度: ${confidence.toFixed(2)}, 得分: ${bestMatch[1]}`);

    return { category: category || null, confidence };
  }

  console.log('[Category] 未找到匹配的分类');
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
