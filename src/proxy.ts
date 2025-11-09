import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE_NAME,
  routing,
} from './i18n/routing';
import {
  DEFAULT_LOGIN_REDIRECT,
  protectedRoutes,
  routesNotAllowedByLoggedInUsers,
} from './routes';

const intlMiddleware = createMiddleware(routing);

/**
 * 1. Next.js 16 proxy (replaces middleware in Next.js 15 and earlier)
 * https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 *
 * 2. Better Auth integration
 * https://www.better-auth.com/docs/integrations/next#middleware
 *
 * In Next.js proxy, it's recommended to only check for the existence of a session cookie
 * to handle redirection. To avoid blocking requests by making API or database calls.
 */
export default async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  console.log('>> proxy start, pathname', nextUrl.pathname);

  // Normalize URL encoding to lowercase (fixes Chinese character URL issues)
  // Browser may encode URLs with uppercase hex (e.g., %E4%B8%8E), but Next.js
  // expects lowercase (e.g., %e4%b8%8e) for proper route matching
  const normalizedPathname = nextUrl.pathname.replace(
    /%[0-9A-F]{2}/g,
    (match) => match.toLowerCase()
  );

  // If the pathname has uppercase encoding, redirect to normalized version
  if (normalizedPathname !== nextUrl.pathname) {
    const normalizedUrl = new URL(nextUrl);
    normalizedUrl.pathname = normalizedPathname;
    console.log(
      '<< proxy end, redirecting to normalized URL:',
      normalizedPathname
    );
    return NextResponse.redirect(normalizedUrl);
  }

  // Handle internal docs link redirection for internationalization
  // Check if this is a docs page without locale prefix
  if (nextUrl.pathname.startsWith('/docs/') || nextUrl.pathname === '/docs') {
    // Get the user's preferred locale from cookie
    const localeCookie = req.cookies.get(LOCALE_COOKIE_NAME);
    const preferredLocale = localeCookie?.value;

    // If user has a non-default locale preference, redirect to localized version
    if (
      preferredLocale &&
      preferredLocale !== DEFAULT_LOCALE &&
      LOCALES.includes(preferredLocale)
    ) {
      const localizedPath = `/${preferredLocale}${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      console.log(
        '<< proxy end, redirecting docs link to preferred locale:',
        localizedPath
      );
      return NextResponse.redirect(new URL(localizedPath, nextUrl));
    }
  }

  // do not use getSession() here, it will cause error related to edge runtime
  // const session = await getSession();
  // In Edge Runtime middleware, we can't fetch localhost APIs
  // So we simply check for the session cookie instead
  const sessionCookie = req.cookies.get('better-auth.session_token');
  const isLoggedIn = !!sessionCookie;
  // console.log('middleware, isLoggedIn', isLoggedIn);

  // Get the pathname of the request (e.g. /zh/dashboard to /dashboard)
  const pathnameWithoutLocale = getPathnameWithoutLocale(
    nextUrl.pathname,
    LOCALES
  );

  // If the route can not be accessed by logged in users, redirect if the user is logged in
  if (isLoggedIn) {
    const isNotAllowedRoute = routesNotAllowedByLoggedInUsers.some((route) =>
      new RegExp(`^${route}$`).test(pathnameWithoutLocale)
    );
    if (isNotAllowedRoute) {
      console.log(
        '<< proxy end, not allowed route, already logged in, redirecting to dashboard'
      );
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route}$`).test(pathnameWithoutLocale)
  );
  // console.log('middleware, isProtectedRoute', isProtectedRoute);

  // If the route is a protected route, redirect to login if user is not logged in
  if (!isLoggedIn && isProtectedRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    // Get locale from the URL or use default locale
    const locale = getLocaleFromPathname(nextUrl.pathname, LOCALES) || DEFAULT_LOCALE;

    console.log(
      '<< proxy end, not logged in, redirecting to login, callbackUrl',
      callbackUrl
    );
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // Apply intlMiddleware for all routes
  console.log('<< proxy end, applying intlMiddleware');
  return intlMiddleware(req);
}

/**
 * Get the pathname of the request (e.g. /zh/dashboard to /dashboard)
 */
function getPathnameWithoutLocale(pathname: string, locales: string[]): string {
  const localePattern = new RegExp(`^/(${locales.join('|')})/`);
  return pathname.replace(localePattern, '/');
}

/**
 * Get the locale from the pathname (e.g. /zh/dashboard to zh)
 */
function getLocaleFromPathname(pathname: string, locales: string[]): string | null {
  const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`);
  const match = pathname.match(localePattern);
  return match ? match[1] : null;
}

/**
 * Next.js internationalized routing
 * specify the routes the middleware applies to
 *
 * https://next-intl.dev/docs/routing#base-path
 */
export const config = {
  // The `matcher` is relative to the `basePath`
  matcher: [
    // Match all pathnames except for
    // - if they start with `/api`, `/_next` or `/_vercel`
    // - if they contain a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
