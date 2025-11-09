'use server';

import { db } from '@/db/index';
import { session, user } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';

/**
 * Login with phone number and planet number
 */
export async function loginWithPhonePlanet(
  phone: string,
  planetNumber: string
) {
  try {
    // Validate input
    if (!phone || !planetNumber) {
      return {
        success: false,
        error: '请输入手机号和星球编号',
      };
    }

    // Find user by phone and planet number
    const foundUser = await db.query.user.findFirst({
      where: and(eq(user.phone, phone), eq(user.planetNumber, planetNumber)),
    });

    if (!foundUser) {
      return {
        success: false,
        error: '手机号或星球编号错误',
      };
    }

    // Check if user is banned
    if (foundUser.banned) {
      return {
        success: false,
        error: foundUser.banReason || '账号已被禁用',
      };
    }

    // Create session
    const sessionId = nanoid();
    const sessionToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const now = new Date();

    await db.insert(session).values({
      id: sessionId,
      userId: foundUser.id,
      token: sessionToken,
      expiresAt,
      ipAddress: null,
      userAgent: null,
      createdAt: now,
      updatedAt: now,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return {
      success: true,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        planetNumber: foundUser.planetNumber,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: '登录失败，请稍后重试',
    };
  }
}

/**
 * Logout
 */
export async function logout() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;

    if (sessionToken) {
      // Delete session from database
      await db.delete(session).where(eq(session.token, sessionToken));
    }

    // Clear cookie
    cookieStore.delete('session-token');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: '登出失败',
    };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;

    if (!sessionToken) {
      return null;
    }

    const foundSession = await db.query.session.findFirst({
      where: eq(session.token, sessionToken),
      with: {
        user: true,
      },
    });

    if (!foundSession) {
      return null;
    }

    // Check if session is expired
    if (new Date() > foundSession.expiresAt) {
      await db.delete(session).where(eq(session.id, foundSession.id));
      return null;
    }

    return {
      user: foundSession.user,
      session: foundSession,
    };
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}
