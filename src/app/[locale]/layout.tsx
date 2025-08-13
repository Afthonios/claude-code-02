import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

import { locales, type Locale } from "../../i18n";
import ThemeProvider from "../../components/layout/ThemeProvider";
import Header from "../../components/layout/Header";
import LocaleHandler from "../../components/layout/LocaleHandler";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: {
      template: '%s | Afthonios',
      default: t('title'),
    },
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      type: 'website',
      locale: locale,
      alternateLocale: locales.filter(l => l !== locale),
      title: t('title'),
      description: t('description'),
      siteName: 'Afthonios',
    },
    alternates: {
      canonical: `https://afthonios.com/${locale}`,
      languages: {
        'fr': 'https://afthonios.com/fr',
        'en': 'https://afthonios.com/en',
      }
    }
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <ThemeProvider>
      <NextIntlClientProvider messages={messages}>
        <LocaleHandler />
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}