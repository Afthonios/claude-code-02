import createIntlMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';
import { locales, defaultLocale } from './src/i18n';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale,
  
  // Always use locale prefix for all routes
  // This ensures /fr and /en are always in the URL
  localePrefix: 'always'
});

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/my-courses',
  '/settings'
];

// Define admin-only routes
const adminRoutes = [
  '/admin'
];

export default withAuth(
  function middleware(req: NextRequest) {
    // First apply internationalization middleware
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Extract the locale from the pathname
        const pathnameHasLocale = locales.some(
          (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        );
        
        // Get the path without locale prefix
        const pathWithoutLocale = pathnameHasLocale 
          ? pathname.substring(3) // Remove /{locale} prefix
          : pathname;
        
        // Check if the route requires authentication
        const isProtectedRoute = protectedRoutes.some(route => 
          pathWithoutLocale.startsWith(route)
        );
        
        // Check if the route requires admin access
        const isAdminRoute = adminRoutes.some(route => 
          pathWithoutLocale.startsWith(route)
        );
        
        // If it's not a protected route, allow access
        if (!isProtectedRoute && !isAdminRoute) {
          return true;
        }
        
        // If it's a protected route, user must be authenticated
        if (isProtectedRoute && !token) {
          return false;
        }
        
        // If it's an admin route, user must be authenticated and have admin role
        if (isAdminRoute) {
          return !!token && token.role === 'admin';
        }
        
        // Default: allow access if user has token
        return !!token;
      },
    },
  }
);

export const config = {
  // Match only internationalized pathnames and protected routes
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Explicitly handle common routes
    '/courses',
    '/cours-de-la-semaine',
    '/gestion-de-projet',
    '/nouvelle-offre',
    '/auth/:path*',
    
    // Protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/my-courses/:path*',
    '/settings/:path*',
    '/admin/:path*',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(fr|en)/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. other paths without locale)
    '/((?!api|_next|_vercel|favicon.ico|logo.svg|file.svg|globe.svg|next.svg|vercel.svg|window.svg|.*\\..*).*)'
  ]
};