'use server';

import { db } from '@/db';
import { categoryStats } from '@/db/schema';
import { auth } from '@/lib/auth';
import { sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { headers } from 'next/headers';

/**
 * 初始化10个主分类数据
 * 只有管理员可以执行
 */
export async function initializeCategories() {
  try {
    // 检查权限
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        error: '权限不足：只有管理员可以初始化分类',
      };
    }

    // 检查是否已有分类数据
    const existing = await db.select().from(categoryStats).limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: '分类已存在，如需重新初始化请先清空数据',
        categoriesCount: existing.length,
      };
    }

    // 初始分类数据
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

    // 批量插入
    await db.insert(categoryStats).values(initialCategories);

    return {
      success: true,
      message: '成功初始化 10 个分类',
      categories: initialCategories.map((c) => ({
        name: c.name,
        icon: c.icon,
        order: c.order,
      })),
    };
  } catch (error: any) {
    console.error('Initialize categories error:', error);
    return {
      success: false,
      error: '初始化失败：' + (error.message || '未知错误'),
    };
  }
}

/**
 * 添加缺失的数据库字段
 * 这是一个一次性操作，用于更新现有数据库
 */
export async function addCategoryFields() {
  try {
    // 检查权限
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        error: '权限不足：只有管理员可以执行数据库操作',
      };
    }

    // 执行SQL添加字段
    await db.execute(sql`
      -- 添加 icon 字段
      ALTER TABLE category_stats
      ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '📁';

      -- 添加 description 字段
      ALTER TABLE category_stats
      ADD COLUMN IF NOT EXISTS description TEXT;

      -- 添加 order 字段
      ALTER TABLE category_stats
      ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

      -- 删除旧的 display_order 字段（如果存在）
      ALTER TABLE category_stats
      DROP COLUMN IF EXISTS display_order;

      -- 添加索引
      CREATE INDEX IF NOT EXISTS category_stats_order_idx ON category_stats ("order");
    `);

    return {
      success: true,
      message: '成功添加数据库字段（icon, description, order）',
    };
  } catch (error: any) {
    console.error('Add category fields error:', error);
    return {
      success: false,
      error: '添加字段失败：' + (error.message || '未知错误'),
    };
  }
}
