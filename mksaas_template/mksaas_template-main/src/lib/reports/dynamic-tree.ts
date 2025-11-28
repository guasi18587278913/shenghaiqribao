import { db } from '@/db';
import { categoryStats, dailyReport, dailyTopic } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageTree } from 'fumadocs-core/server';
import * as LucideIcons from 'lucide-react';
import { createElement } from 'react';

/**
 * 分类配置
 * 与 content/reports/meta.json 保持一致
 */
export const REPORT_CATEGORIES = [
  {
    slug: 'overseas-experience',
    title: '出海经验',
    description: '产品出海的实战经验和策略分享',
    icon: 'Globe',
  },
  {
    slug: 'qa-selection',
    title: '问答精选',
    description: '社群中高质量问答的精选内容',
    icon: 'MessageCircle',
  },
  {
    slug: 'industry-trends',
    title: '行业动态',
    description: 'AI 和出海领域的最新动态和趋势',
    icon: 'TrendingUp',
  },
  {
    slug: 'network-proxy',
    title: '网络与代理',
    description: '网络配置、代理服务等技术话题',
    icon: 'Network',
  },
  {
    slug: 'tech-tools',
    title: '技术工具',
    description: '开发工具、第三方服务推荐和使用技巧',
    icon: 'Wrench',
  },
] as const;

/**
 * 从数据库生成 Fumadocs PageTree
 */
export async function generateReportsPageTree(
  locale = 'zh'
): Promise<PageTree.Root> {
  // 获取所有已发布的日报
  const reports = await db.query.dailyReport.findMany({
    where: eq(dailyReport.status, 'published'),
    orderBy: [desc(dailyReport.date)],
    with: {
      topics: true,
    },
    limit: 100, // 限制最近100篇
  });

  // 按分类组织日报
  const categorizedReports: Record<string, typeof reports> = {};

  for (const category of REPORT_CATEGORIES) {
    categorizedReports[category.slug] = reports.filter((report) =>
      report.topics.some((topic) => topic.category === category.slug)
    );
  }

  // 生成 PageTree 结构
  const tree: PageTree.Root = {
    name: 'AI 产品出海日报',
    children: [
      // 首页
      {
        type: 'page',
        name: '首页',
        url: '/reports',
        icon: createIconElement('BookOpen'),
      },
      // 分隔符
      {
        type: 'separator',
        name: '--- 分类 ---',
      },
      // 各个分类
      ...REPORT_CATEGORIES.map((category) => ({
        type: 'folder' as const,
        name: category.title,
        icon: createIconElement(category.icon),
        defaultOpen: false,
        children:
          categorizedReports[category.slug]?.slice(0, 20).map((report) => ({
            type: 'page' as const,
            name: formatReportTitle(report),
            url: `/reports/${report.id}`,
          })) || [],
      })),
    ],
  };

  return tree;
}

/**
 * 格式化日报标题
 */
function formatReportTitle(report: typeof dailyReport.$inferSelect): string {
  const date = new Date(report.date);
  const dateStr = date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
  return `${dateStr} - ${report.title}`;
}

/**
 * 创建图标元素
 */
function createIconElement(iconName: string): React.ReactNode {
  const IconComponent = (LucideIcons as Record<string, any>)[iconName];
  if (IconComponent) {
    return createElement(IconComponent);
  }
  return undefined;
}

/**
 * 获取单个日报的面包屑导航
 */
export async function getReportBreadcrumb(reportId: string) {
  const report = await db.query.dailyReport.findFirst({
    where: eq(dailyReport.id, reportId),
    with: {
      topics: {
        limit: 1,
      },
    },
  });

  if (!report || report.topics.length === 0) {
    return null;
  }

  const category = REPORT_CATEGORIES.find(
    (c) => c.slug === report.topics[0].category
  );

  return {
    category: category?.title || '未分类',
    categorySlug: report.topics[0].category,
    reportTitle: report.title,
    reportDate: report.date,
  };
}
