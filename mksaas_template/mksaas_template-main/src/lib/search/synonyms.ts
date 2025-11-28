/**
 * AI/出海行业同义词库
 * 搜索时会自动扩展查询词
 */
export const synonyms: Record<string, string[]> = {
  // AI 模型相关
  llm: ['大模型', '大语言模型', 'large language model'],
  大模型: ['llm', '大语言模型', 'large language model'],
  claude: ['anthropic', 'claude code', 'opus', 'sonnet'],
  anthropic: ['claude', 'claude code'],
  gpt: ['chatgpt', 'openai', 'gpt-4', 'gpt4'],
  chatgpt: ['gpt', 'openai', 'gpt-4'],
  openai: ['gpt', 'chatgpt', 'gpt-4'],
  gemini: ['google ai', 'bard', 'google gemini'],

  // 开发工具相关
  cursor: ['cursor ai', 'ai编程', 'ai编辑器'],
  codex: ['openai codex', 'ai编程'],
  v0: ['vercel v0', 'v0.dev'],
  bolt: ['bolt.new', 'stackblitz'],
  lovable: ['lovable.dev'],

  // 支付相关
  支付: ['付款', 'payment', '订阅', '充值'],
  stripe: ['支付网关', '信用卡支付'],
  虚拟卡: ['visa卡', '万事达卡', 'mastercard'],
  订阅: ['subscription', '会员', '付费'],

  // 账号相关
  账号: ['账户', 'account', '注册'],
  风控: ['封号', '封禁', 'ban', '风险控制'],
  代理: ['vpn', '梯子', '节点', '科学上网'],

  // 产品相关
  出海: ['海外', 'global', '国际化'],
  seo: ['搜索引擎优化', '搜索优化'],
  落地页: ['landing page', '着陆页'],

  // 常见缩写
  api: ['接口', 'api接口'],
  ui: ['界面', '用户界面'],
  ux: ['用户体验'],
};

/**
 * 获取搜索词的同义词扩展
 */
export function expandSynonyms(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const expanded = new Set<string>([query]);

  // 检查每个同义词组
  for (const [key, values] of Object.entries(synonyms)) {
    if (lowerQuery.includes(key.toLowerCase())) {
      values.forEach((v) => expanded.add(v));
    }
    // 反向匹配
    for (const value of values) {
      if (lowerQuery.includes(value.toLowerCase())) {
        expanded.add(key);
        values.forEach((v) => expanded.add(v));
      }
    }
  }

  return Array.from(expanded);
}

/**
 * 热门搜索词（可以根据实际搜索数据动态更新）
 */
export const hotSearchTerms = [
  'Cursor',
  'Claude Code',
  '支付方案',
  '账号注册',
  '风控',
  'API',
  'Gemini',
  'V0',
];
