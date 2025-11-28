'use client';

import type { KnowledgeCategory } from '@/lib/knowledge-categories';
import type { Locale } from 'next-intl';
import { useState } from 'react';
import { SidebarAAllExpand } from './variants/sidebar-a-all-expand';
import { SidebarBNoExpand } from './variants/sidebar-b-no-expand';
import { SidebarCHoverPopup } from './variants/sidebar-c-hover-popup';
import { SidebarDAutoCollapse } from './variants/sidebar-d-auto-collapse';
import { SidebarECurrent } from './variants/sidebar-e-current';

interface SidebarTestClientProps {
  locale: Locale;
  knowledgeCategories: KnowledgeCategory[];
}

type VariantType = 'current' | 'a' | 'b' | 'c' | 'd';

export function SidebarTestClient({
  locale,
  knowledgeCategories,
}: SidebarTestClientProps) {
  const [selectedVariant, setSelectedVariant] =
    useState<VariantType>('current');

  const variants = [
    {
      id: 'current' as const,
      name: '当前方案',
      description: '展开/收起,文章列表小字体',
    },
    { id: 'a' as const, name: '方案A', description: '默认全收起,按需展开' },
    { id: 'b' as const, name: '方案B', description: '只显示分类,无二级' },
    { id: 'c' as const, name: '方案C', description: 'Hover悬浮弹出' },
    {
      id: 'd' as const,
      name: '方案D 推荐',
      description: '自动收起其他+限制数量',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Selection Bar */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold">侧边栏设计方案对比</h1>
              <p className="text-sm text-muted-foreground mt-1">
                选择不同方案查看效果对比,找到最适合的设计
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all text-left
                    ${
                      selectedVariant === variant.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }
                  `}
                >
                  <div className="font-semibold text-sm">{variant.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {variant.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Display Area */}
      <div className="flex">
        {/* Render selected variant */}
        {selectedVariant === 'current' && (
          <SidebarECurrent
            knowledgeCategories={knowledgeCategories}
            selectedCategory={null}
            onSelectCategory={() => {}}
          />
        )}
        {selectedVariant === 'a' && (
          <SidebarAAllExpand
            knowledgeCategories={knowledgeCategories}
            selectedCategory={null}
            onSelectCategory={() => {}}
          />
        )}
        {selectedVariant === 'b' && (
          <SidebarBNoExpand
            knowledgeCategories={knowledgeCategories}
            selectedCategory={null}
            onSelectCategory={() => {}}
          />
        )}
        {selectedVariant === 'c' && (
          <SidebarCHoverPopup
            knowledgeCategories={knowledgeCategories}
            selectedCategory={null}
            onSelectCategory={() => {}}
          />
        )}
        {selectedVariant === 'd' && (
          <SidebarDAutoCollapse
            knowledgeCategories={knowledgeCategories}
            selectedCategory={null}
            onSelectCategory={() => {}}
          />
        )}

        {/* Main Content Area - Sample */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">
              预览区域 - {variants.find((v) => v.id === selectedVariant)?.name}
            </h2>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                这是主内容区域。左侧是侧边栏的
                {variants.find((v) => v.id === selectedVariant)?.name}。
              </p>

              <h3>设计特点:</h3>
              <p>
                {variants.find((v) => v.id === selectedVariant)?.description}
              </p>

              <h3>测试说明:</h3>
              <ul>
                <li>尝试点击不同的分类</li>
                <li>观察展开/收起的交互</li>
                <li>注意文字大小和层级区分</li>
                <li>测试滚动时的空间利用</li>
              </ul>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">对比要点:</p>
                <ul className="text-sm space-y-1">
                  <li>✓ 文字可读性 (大小、对比度)</li>
                  <li>✓ 空间利用率 (垂直滚动距离)</li>
                  <li>✓ 层级区分度 (一级/二级视觉差异)</li>
                  <li>✓ 交互流畅性 (点击反馈、展开逻辑)</li>
                  <li>✓ 整体美观度</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
