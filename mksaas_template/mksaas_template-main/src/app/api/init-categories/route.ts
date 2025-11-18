import { db } from '@/db';
import { categoryStats } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

/**
 * 临时初始化API
 * 访问 /api/init-categories 即可初始化分类数据
 * ⚠️ 生产环境请删除此文件
 */
export async function GET() {
  try {
    // 步骤1: 添加数据库字段
    try {
      await db.execute(sql`
        ALTER TABLE category_stats
        ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '📁';

        ALTER TABLE category_stats
        ADD COLUMN IF NOT EXISTS description TEXT;

        ALTER TABLE category_stats
        ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

        ALTER TABLE category_stats
        DROP COLUMN IF EXISTS display_order;

        CREATE INDEX IF NOT EXISTS category_stats_order_idx ON category_stats ("order");
      `);
    } catch (error) {
      console.log('字段可能已存在，继续...');
    }

    // 步骤2: 检查是否已有数据
    const existing = await db.select().from(categoryStats).limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: '分类已存在，无需重复初始化',
        hint: '访问 /reports 查看效果',
      });
    }

    // 步骤3: 初始化10个分类
    const initialCategories = [
      {
        id: nanoid(),
        name: '账号与设备',
        slug: 'account-device',
        icon: '🔐',
        description: '账号注册、风控策略、设备选购与配置',
        order: 1,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '网络与代理',
        slug: 'network-proxy',
        icon: '🌐',
        description: '网络配置、代理设置、科学上网指南',
        order: 2,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '支付与订阅',
        slug: 'payment-subscription',
        icon: '💳',
        description: '国际支付、订阅管理、虚拟卡使用',
        order: 3,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '开发工具',
        slug: 'dev-tools',
        icon: '🛠️',
        description: 'AI开发工具、Cursor、Claude Code等使用攻略',
        order: 4,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '项目执行',
        slug: 'project-execution',
        icon: '🚀',
        description: '环境配置、部署上线、调试排错全流程',
        order: 5,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '产品与增长',
        slug: 'product-growth',
        icon: '📈',
        description: '从创意到上线、产品验证、增长方法论',
        order: 6,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '社群与学习',
        slug: 'community-learning',
        icon: '👥',
        description: '社群资源、学习路径、知识沉淀',
        order: 7,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '认知与避坑',
        slug: 'mindset-pitfalls',
        icon: '💡',
        description: '学习认知、常见误区、避坑指南',
        order: 8,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '成本规划',
        slug: 'cost-planning',
        icon: '💰',
        description: '成本优化、预算规划、省钱策略',
        order: 9,
        isFeatured: true,
        count: 0,
      },
      {
        id: nanoid(),
        name: '设备与环境',
        slug: 'device-environment',
        icon: '💻',
        description: '开发环境、设备选型、系统配置',
        order: 10,
        isFeatured: true,
        count: 0,
      },
    ];

    await db.insert(categoryStats).values(initialCategories);

    return NextResponse.json({
      success: true,
      message: '✅ 成功初始化 10 个分类！',
      categories: initialCategories.map((c) => ({
        icon: c.icon,
        name: c.name,
        order: c.order,
      })),
      next: '现在访问 /reports 查看效果（注意：需要先登录并验证星球成员身份）',
    });
  } catch (error: any) {
    console.error('初始化失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '初始化失败',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
