import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.register' });

  return {
    title: t('title'),
    description: t('title'),
  };
}

export default async function SignupPage({ params }: Props) {
  const { locale } = await params;

  return <SignupForm locale={locale} />;
}