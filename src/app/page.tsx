import { redirect } from 'next/navigation';

/**
 * Root Page - Redirects to default locale
 *
 * In Next.js 16 with proxy.ts, the next-intl middleware with localePrefix: 'as-needed'
 * doesn't automatically redirect root path. This page handles that explicitly.
 */
export default function RootPage() {
  redirect('/en');
}
