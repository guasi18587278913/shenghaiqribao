'use client';

import { useState } from 'react';
import type { Locale } from 'next-intl';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

const STYLE_OPTIONS = [
  { id: 'premium', label: 'Premium（高级阅读）', cls: 'prose-premium' },
  { id: 'chinese', label: '中文优化（紧凑）', cls: 'prose-chinese' },
];

export default function TypographyPreviewPage(_props: PageProps) {
  const [styleId, setStyleId] = useState<'premium' | 'chinese'>('premium');
  const current = STYLE_OPTIONS.find((o) => o.id === styleId)!;

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">日报排版预览</h1>
        <div className="flex gap-2">
          {STYLE_OPTIONS.map((o) => (
            <Button
              key={o.id}
              variant={styleId === o.id ? 'default' : 'outline'}
              onClick={() => setStyleId(o.id as any)}
              size="sm"
            >
              {o.label}
            </Button>
          ))}
        </div>
      </div>

      <article className={`prose prose-slate dark:prose-invert max-w-none ${current.cls}`}>
        <h1>11-17 AI产品出海日报</h1>
        <p className="text-xl text-muted-foreground">
          大家热议<strong>AI 应用落地</strong>与信息助手，分享了私教啃硬课、订阅升级与出海收款的实战经验。
          <mark>本页用于展示排版风格</mark>，非真实内容，请以上线版为准。
        </p>

        <h2>一、小问题速记：Vercel &amp; Claude Skills</h2>
        <ul>
          <li>
            有同学部署项目时遇到 Vercel 一直排队卡住，查看
            <code>status.vercel.com</code> 后确定是平台状态问题。
          </li>
          <li>
            “中转 Claude 模型 API 能否在 Claude Code 里用 skills？”
            <br />
            结论：<strong>可以</strong>；原因：skills 是本地能力封装；实际操作：先
            <mark>本地配置</mark>
            后使用。
          </li>
        </ul>

        <h2>二、工作流与协作</h2>
        <p>
          推荐 “<strong>GPT-5 + Codex + 实时预览</strong>” 协作流程，非技术同学也能搭骨架。遇到复杂后端逻辑时，Codex 的
          <mark>代码审核/重构</mark> 优势明显。
        </p>
        <blockquote>
          <p>
            提示：使用 <code>bypass</code> 模式务必在容器化环境中运行，避免越权扫描本地文件带来的风险。
          </p>
        </blockquote>
        <ul>
          <li>环境：Docker + bash + git + openssh + make + g++（按需）</li>
          <li>IDE：Cursor Plan 配合 4.5 模型处理复杂需求</li>
          <li>实践：分阶段保存，便于回退与对话提示词打磨</li>
        </ul>

        <h2>三、支付与订阅</h2>
        <p>
          Stripe 审核一般 <strong>约 1 周</strong>。有同学尝试 Creem 的订阅升级能力，提醒关注
          <mark>立即生效 vs 次月生效</mark> 两种模式的抵扣处理。
        </p>

        <h2>四、今日小结（示例）</h2>
        <ul>
          <li>
            <strong>容器化</strong> 是高级玩法的安全前提；把危险操作放回“沙盒”。
          </li>
          <li>
            <strong>工具组合</strong>：让擅长“审查与重构”的去做审查，让“快速补全”的去覆盖流水线。
          </li>
          <li>
            <strong>订阅升级</strong>：前端交互要闭环，后台逻辑要考虑抵扣与税务。
          </li>
        </ul>

        <hr />
        <p>
          你当前正在查看：<code>{current.label}</code>
          。上方按钮可一键切换风格。若你希望把此风格设为日报默认，我可以把
          <code>reports page</code> 的容器类名替换为该风格。
        </p>
      </article>
    </div>
  );
}

