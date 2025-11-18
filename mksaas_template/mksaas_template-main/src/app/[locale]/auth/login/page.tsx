import { PhonePlanetLoginForm } from '@/components/auth/phone-planet-login-form';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'AuthPage.login' });

  return constructMetadata({
    title: pt('title') + ' | ' + t('title'),
    description: t('description'),
    locale,
    pathname: '/auth/login',
  });
}

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4">
      <PhonePlanetLoginForm />
    </div>
  );
}
