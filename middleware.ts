import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale,
  
  // Always use locale prefix for all routes
  // This ensures /fr and /en are always in the URL
  localePrefix: 'always'
  
  // Alternative domains for different locales (optional)
  // domains: [
  //   {
  //     domain: 'afthonios.fr',
  //     defaultLocale: 'fr'
  //   },
  //   {
  //     domain: 'afthonios.com',
  //     defaultLocale: 'en'
  //   }
  // ]
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Explicitly handle common routes
    '/courses',
    '/cours-de-la-semaine',
    '/gestion-de-projet',
    '/nouvelle-offre',
    '/auth/:path*',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(fr|en)/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. other paths without locale)
    '/((?!api|_next|_vercel|favicon.ico|logo.svg|file.svg|globe.svg|next.svg|vercel.svg|window.svg|.*\\..*).*)'
  ]
};