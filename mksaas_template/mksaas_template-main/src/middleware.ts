import { routing } from '@/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, handle internationalization
  const intlResponse = intlMiddleware(request);

  // Get the pathname after locale has been processed
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session-token')?.value;

  // Check if the route (after locale) is protected
  // Match both /reports and /[locale]/reports patterns
  const pathWithoutLocale = pathname.replace(/^\/(en|zh)/, '') || '/';

  const isProtectedRoute =
    pathWithoutLocale.startsWith('/dashboard') ||
    pathWithoutLocale.startsWith('/knowledge') ||
    pathWithoutLocale.startsWith('/announcements');

  const isAuthRoute = pathWithoutLocale.startsWith('/auth');

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    // Extract the locale from the pathname or use default
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'zh';
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with a session, redirect to reports
  if (isAuthRoute && sessionToken) {
    // Extract the locale from the pathname
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/reports`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
