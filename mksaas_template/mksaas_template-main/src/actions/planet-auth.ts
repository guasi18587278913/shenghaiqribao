/**
 * 星球用户认证 - 手机号 + 星球编号登录
 */
'use server';

import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export interface PlanetLoginInput {
  phone: string;
  planetNumber: string;
}

export interface PlanetLoginResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 星球用户登录
 */
export async function planetLogin(
  input: PlanetLoginInput
): Promise<PlanetLoginResult> {
  try {
    const { phone, planetNumber } = input;

    // 验证输入
    if (!phone || !planetNumber) {
      return {
        success: false,
        error: '请输入手机号和星球编号',
      };
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return {
        success: false,
        error: '手机号格式不正确',
      };
    }

    // 查询用户
    const users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.phone, phone))
      .limit(1);

    if (users.length === 0) {
      return {
        success: false,
        error: '用户不存在，请联系管理员',
      };
    }

    const user = users[0];

    // 验证星球编号
    if (user.planetNumber !== planetNumber) {
      return {
        success: false,
        error: '星球编号不正确',
      };
    }

    // 检查用户是否被封禁
    if (user.banned) {
      return {
        success: false,
        error: user.banReason || '账号已被封禁',
      };
    }

    // 创建会话
    const session = await auth.api.signInEmail({
      body: {
        email: user.email,
        password: `planet_${planetNumber}`, // 使用星球编号作为密码
        callbackURL: '/dashboard',
      },
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: '登录失败，请重试',
      };
    }

    return {
      success: true,
      message: '登录成功',
    };
  } catch (error: any) {
    console.error('Planet login error:', error);
    return {
      success: false,
      error: '登录失败，请重试',
    };
  }
}

/**
 * 检查手机号是否已注册
 */
export async function checkPhoneExists(phone: string): Promise<boolean> {
  try {
    const users = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.phone, phone))
      .limit(1);

    return users.length > 0;
  } catch (error) {
    console.error('Check phone error:', error);
    return false;
  }
}

/**
 * 为已登录用户验证并保存星球信息
 */
export async function verifyPlanetAccess(
  input: PlanetLoginInput
): Promise<PlanetLoginResult> {
  try {
    const { phone, planetNumber } = input;

    // 验证输入
    if (!phone || !planetNumber) {
      return {
        success: false,
        error: '请输入手机号和星球编号',
      };
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return {
        success: false,
        error: '手机号格式不正确（请输入11位有效手机号）',
      };
    }

    // 验证星球编号格式（纯数字）
    const planetRegex = /^\d+$/;
    if (!planetRegex.test(planetNumber)) {
      return {
        success: false,
        error: '星球编号格式不正确（仅支持纯数字）',
      };
    }

    // 获取当前登录用户
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    // 检查手机号是否被其他用户使用
    const existingUsers = await db
      .select()
      .from(userTable)
      .where(eq(userTable.phone, phone))
      .limit(1);

    if (existingUsers.length > 0 && existingUsers[0].id !== session.user.id) {
      return {
        success: false,
        error: '该手机号已被其他用户使用',
      };
    }

    // 更新用户的手机号和星球编号
    await db
      .update(userTable)
      .set({
        phone,
        planetNumber,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, session.user.id));

    return {
      success: true,
      message: '验证成功！现在您可以访问日报了',
    };
  } catch (error: any) {
    console.error('Verify planet access error:', error);
    return {
      success: false,
      error: '验证失败，请重试',
    };
  }
}

/**
 * 检查当前用户是否已完成星球验证
 */
export async function checkPlanetVerification(): Promise<{
  verified: boolean;
  isAdmin: boolean;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { verified: false, isAdmin: false };
    }

    // 检查是否是管理员（管理员豁免验证）
    const isAdmin = session.user.role === 'admin';
    if (isAdmin) {
      return { verified: true, isAdmin: true };
    }

    // 检查用户是否已填写手机号和星球编号
    const users = await db
      .select({
        phone: userTable.phone,
        planetNumber: userTable.planetNumber,
      })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (users.length === 0) {
      return { verified: false, isAdmin: false };
    }

    const user = users[0];
    const verified = !!(user.phone && user.planetNumber);

    return { verified, isAdmin: false };
  } catch (error) {
    console.error('Check planet verification error:', error);
    return { verified: false, isAdmin: false };
  }
}
