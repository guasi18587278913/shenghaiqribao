import { redirect } from 'next/navigation';

/**
 * Home Page - Redirects to reports list
 */
export default function HomePage() {
  redirect('/reports');
}
