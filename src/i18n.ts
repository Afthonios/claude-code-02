import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// List of supported locales
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale (French as specified in CLAUDE.md)
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async ({ locale }) => {
  // Handle undefined locale by using default locale
  const resolvedLocale = locale || defaultLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(resolvedLocale as Locale)) notFound();

  return {
    locale: resolvedLocale as string,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
    timeZone: 'Europe/Paris',
  };
});