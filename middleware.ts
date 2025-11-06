import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session-token')?.value;

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/reports') ||
    request.nextUrl.pathname.startsWith('/knowledge') ||
    request.nextUrl.pathname.startsWith('/announcements');

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with a session, redirect to reports
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/reports', request.url));
  }

  return NextResponse.next();
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
