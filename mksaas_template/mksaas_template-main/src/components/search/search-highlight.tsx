'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

// 存储最近的搜索关键词（跨页面保持）
const SEARCH_QUERY_KEY = 'fd-search-query';

// 选择器列表，用于查找搜索输入框
const SEARCH_INPUT_SELECTORS = [
  '[data-slot="command-input"]',
  '[cmdk-input]',
  'input[placeholder*="搜索"]',
  'input[placeholder*="Search"]',
  'input[placeholder*="search"]',
  '[role="dialog"] input[type="text"]',
  '[role="dialog"] input:not([type])',
];

/**
 * 获取当前搜索输入框的值
 */
function getSearchInputValue(): string | null {
  for (const selector of SEARCH_INPUT_SELECTORS) {
    const input = document.querySelector(selector) as HTMLInputElement;
    if (input && input.value.trim().length >= 1) {
      return input.value.trim();
    }
  }
  return null;
}

/**
 * 搜索高亮组件
 *
 * 当从搜索结果跳转到页面时，自动高亮匹配的文本
 */
export function SearchHighlight() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHighlighted = useRef(false);

  // 监听搜索输入框，捕获搜索关键词
  useEffect(() => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName !== 'INPUT') return;

      // Fumadocs 搜索框的多种特征匹配
      const isSearchInput =
        target.placeholder?.includes('搜索') ||
        target.placeholder?.toLowerCase().includes('search') ||
        target.getAttribute('data-slot') === 'command-input' ||
        target.hasAttribute('cmdk-input') ||
        target.closest('[cmdk-root]') ||
        target.closest('[role="dialog"]');

      if (isSearchInput) {
        const query = target.value.trim();
        if (query.length >= 1) {
          sessionStorage.setItem(SEARCH_QUERY_KEY, query);
        }
      }
    };

    // 使用 MutationObserver 监听搜索对话框打开
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLElement) {
              // 检查是否是搜索对话框
              if (
                node.matches?.('[role="dialog"]') ||
                node.querySelector?.('[role="dialog"]')
              ) {
                // 给输入框添加事件监听
                setTimeout(() => {
                  const input = getSearchInputValue();
                  if (input) {
                    sessionStorage.setItem(SEARCH_QUERY_KEY, input);
                  }
                }, 100);
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 监听搜索结果点击
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // 检查是否点击了搜索结果链接
      const link = target.closest('a[href]') as HTMLAnchorElement;
      const isInDialog =
        target.closest('[role="dialog"]') || target.closest('[cmdk-root]');

      if (link && isInDialog) {
        // 在搜索对话框中点击了链接，保留当前的搜索关键词
        const query = getSearchInputValue();
        if (query && query.length >= 1) {
          sessionStorage.setItem(SEARCH_QUERY_KEY, query);
        }
      }
    };

    // 监听键盘事件（Enter 键选择搜索结果）
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const isInDialog =
          document.activeElement?.closest('[role="dialog"]') ||
          document.activeElement?.closest('[cmdk-root]');
        if (isInDialog) {
          const query = getSearchInputValue();
          if (query && query.length >= 1) {
            sessionStorage.setItem(SEARCH_QUERY_KEY, query);
          }
        }
      }
    };

    document.addEventListener('input', handleInput, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown, true);

    return () => {
      observer.disconnect();
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeydown, true);
    };
  }, []);

  useEffect(() => {
    hasHighlighted.current = false;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (hasHighlighted.current) return;

    const hash = window.location.hash;

    // 从 sessionStorage 获取搜索关键词
    const searchQuery = sessionStorage.getItem(SEARCH_QUERY_KEY);

    // 也从 URL 参数获取搜索关键词（备选方案）
    const urlSearchQuery =
      searchParams.get('q') ||
      searchParams.get('query') ||
      searchParams.get('search');

    // 使用优先级：sessionStorage > URL参数
    const finalQuery = searchQuery || urlSearchQuery;

    // 如果有 hash 或搜索关键词，执行高亮
    if (hash || finalQuery) {
      // 延迟执行以确保页面内容已渲染
      const timer = setTimeout(() => {
        hasHighlighted.current = true;

        // 1. 先高亮标题（如果有 hash）
        if (hash) {
          const targetId = decodeURIComponent(hash.slice(1));
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            targetElement.classList.add('search-highlight-target');
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });

            setTimeout(() => {
              targetElement.classList.remove('search-highlight-target');
            }, 4000);
          }
        }

        // 2. 高亮搜索关键词匹配的文本
        if (finalQuery && finalQuery.length >= 1) {
          highlightSearchText(finalQuery);
          // 清除搜索关键词，避免重复高亮
          sessionStorage.removeItem(SEARCH_QUERY_KEY);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * 高亮页面中匹配搜索关键词的文本
 */
function highlightSearchText(query: string) {
  // 获取内容区域
  const contentArea =
    document.querySelector('article') ||
    document.querySelector('main') ||
    document.querySelector('.prose') ||
    document.querySelector('#nd-docs-layout');

  if (!contentArea) return;

  // 使用 TreeWalker 遍历所有文本节点
  const walker = document.createTreeWalker(contentArea, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // 跳过 script, style, 已高亮的元素
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;

      const tagName = parent.tagName.toLowerCase();
      if (
        tagName === 'script' ||
        tagName === 'style' ||
        tagName === 'noscript'
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      if (parent.classList.contains('search-highlight-text')) {
        return NodeFilter.FILTER_REJECT;
      }

      // 检查是否包含搜索关键词
      if (node.textContent?.toLowerCase().includes(query.toLowerCase())) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_REJECT;
    },
  });

  const nodesToHighlight: { node: Text; index: number }[] = [];
  let textNode: Text | null = walker.nextNode() as Text;

  while (textNode) {
    const text = textNode.textContent || '';
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index !== -1) {
      nodesToHighlight.push({ node: textNode, index });
    }
    textNode = walker.nextNode() as Text;
  }

  // 限制高亮数量，避免性能问题
  const maxHighlights = 20;
  let highlightCount = 0;
  let firstHighlight: Element | null = null;

  for (const { node, index } of nodesToHighlight) {
    if (highlightCount >= maxHighlights) break;

    const text = node.textContent || '';
    const matchLength = query.length;

    // 创建高亮元素
    const before = document.createTextNode(text.slice(0, index));
    const mark = document.createElement('mark');
    mark.className = 'search-highlight-text';
    mark.textContent = text.slice(index, index + matchLength);
    const after = document.createTextNode(text.slice(index + matchLength));

    // 替换原文本节点
    const parent = node.parentNode;
    if (parent) {
      parent.insertBefore(before, node);
      parent.insertBefore(mark, node);
      parent.insertBefore(after, node);
      parent.removeChild(node);

      if (!firstHighlight) {
        firstHighlight = mark;
      }
      highlightCount++;
    }
  }

  // 滚动到第一个高亮位置
  if (firstHighlight) {
    setTimeout(() => {
      firstHighlight?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  }

  // 5秒后移除高亮
  setTimeout(() => {
    const highlights = document.querySelectorAll('.search-highlight-text');
    highlights.forEach((el) => {
      const text = el.textContent || '';
      const textNode = document.createTextNode(text);
      el.parentNode?.replaceChild(textNode, el);
    });
    // 合并相邻文本节点
    contentArea.normalize();
  }, 5000);
}

/**
 * 保存搜索关键词（供搜索组件调用）
 */
export function saveSearchQuery(query: string) {
  if (query && query.length >= 2) {
    sessionStorage.setItem(SEARCH_QUERY_KEY, query);
  }
}
