import { reportsSource } from '@/lib/source';
import type { Locale } from 'next-intl';
import { redirect } from 'next/navigation';

/**
 * Home Page - Redirects to the latest daily report (MDX)
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const language = locale as string;

  // Get all MDX reports and find the latest one
  const allReports = reportsSource.getPages(language);

  if (allReports.length > 0) {
    // Sort by date (newest first)
    const sortedReports = allReports
      .filter((report) => report.data.published !== false)
      .sort(
        (a, b) =>
          new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
      );

    if (sortedReports.length > 0) {
      const latestReport = sortedReports[0];
      // Redirect to the latest report
      redirect(latestReport.url);
    }
  }

  // Fallback: if no reports exist, redirect to reports list
  redirect(`/${locale}/reports`);
}
