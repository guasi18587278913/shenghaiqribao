import { docsI18nConfig } from '@/lib/docs/i18n';
import { knowledgeSource, reportsSource } from '@/lib/source';
import { createTokenizer } from '@orama/tokenizers/mandarin';
import { createI18nSearchAPI } from 'fumadocs-core/search/server';

/**
 * 搜索 API - 优化版
 *
 * 特性：
 * 1. 标题权重提升 - 标题匹配排在前面
 * 2. 容错性优化 - 允许一定的拼写误差
 * 3. 中文分词支持
 */

// 构建索引数据
const knowledgeIndexes = knowledgeSource
  .getLanguages()
  .flatMap(({ language, pages }) =>
    pages.map((page) => ({
      title: page.data.title,
      description: page.data.description,
      structuredData: page.data.structuredData,
      id: page.url,
      url: page.url,
      locale: language,
    }))
  );

const reportsIndexes = reportsSource
  .getLanguages()
  .flatMap(({ language, pages }) =>
    pages.map((page) => ({
      title: page.data.title,
      description: page.data.description,
      structuredData: page.data.structuredData,
      id: page.url,
      url: page.url,
      locale: language,
    }))
  );

const searchAPI = createI18nSearchAPI('advanced', {
  i18n: docsI18nConfig,
  indexes: [...knowledgeIndexes, ...reportsIndexes],
  localeMap: {
    zh: {
      components: {
        tokenizer: createTokenizer(),
      },
      search: {
        threshold: 0.3,
        tolerance: 1,
        boost: {
          title: 2.5,
          description: 1.5,
        },
      },
    },
    en: {
      search: {
        threshold: 0.3,
        tolerance: 1,
        boost: {
          title: 2.5,
          description: 1.5,
        },
      },
    },
  },
  search: {
    limit: 20,
  },
});

// 直接使用 Fumadocs 搜索 API，无额外后处理
export const GET = searchAPI.GET;
