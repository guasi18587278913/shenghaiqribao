import { CalendarIcon, ClockIcon } from 'lucide-react';

interface ReportDetailProps {
  title: string;
  description?: string;
  date: string;
  locale: string;
  children: React.ReactNode;
}

export function ReportDetail({
  title,
  description,
  date,
  locale,
  children
}: ReportDetailProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header区域 */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-card via-card/95 to-card/80">
        {/* 装饰性背景 */}
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/3 blur-3xl" />

        <div className="relative mx-auto w-full max-w-4xl px-6 py-12 md:py-16 md:px-8">
          {/* 标题区域 */}
          <div className="text-center">
            {title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent mb-4 leading-tight">
                {title}
              </h1>
            )}

            {description && (
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
                {description}
              </p>
            )}

            {/* 元信息 */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>

              {/* 阅读时间估算 */}
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>约 5 分钟阅读</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <article className="report-content">
          {/**
           * 使用与知识库相同的 `prose` 排版体系，确保 Markdown/MDX 标题、列表、引用等样式正确呈现。
           * - `prose-premium`: 优化后的阅读体验（同 /knowledge 页面）
           * - `max-w-none`: 不限制内容宽度，交由外层容器控制
           */}
          <div className="prose prose-slate dark:prose-invert prose-premium max-w-none">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}

// 导出MDX样式组件
export function getReportMdxComponents() {
  return {
    h1: ({ children }: any) => (
      <h1 className="scroll-m-20 text-2xl md:text-3xl font-bold tracking-tight my-6">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="scroll-m-20 border-b pb-2 text-xl md:text-2xl font-semibold tracking-tight mt-8 mb-4 pt-2 flex items-start gap-2">
        <span className="text-primary">#</span>
        <span>{children}</span>
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="scroll-m-20 text-lg md:text-xl font-semibold tracking-tight mt-6 mb-3 pl-4 border-l-4 border-primary bg-primary/5 py-3 rounded-r-lg">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="leading-7 text-sm md:text-base [&:not(:first-child)]:mt-4">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-none space-y-1 my-4 ml-2">{children}</ul>
    ),
    li: ({ children }: any) => (
      <li className="flex items-start gap-2 py-1 text-sm md:text-base">
        <span className="text-primary text-sm mt-1.5 flex-shrink-0">•</span>
        <span className="flex-1">{children}</span>
      </li>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-primary">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-muted-foreground">{children}</em>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary/40 bg-primary/5 pl-6 pr-4 py-4 my-4 italic text-muted-foreground rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ children, className }: any) => (
      <code className={
        className
          ? "block my-4 leading-8 bg-muted p-4 text-sm rounded-lg"
          : "inline bg-muted px-1.5 py-0.5 rounded text-primary text-sm"
      }>
        {children}
      </code>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="text-primary hover:text-primary/80 underline underline-offset-4"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    hr: () => (
      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <span className="text-primary/50 text-lg">◆</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>
    )
  };
}
