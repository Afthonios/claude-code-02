import createIntlMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';
import { locales, defaultLocale } from './src/i18n';
import { UserRole } from './src/lib/roles';

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

// Route configuration with role-based access
const routeConfig = {
  // Public routes (no authentication required)
  public: [
    '/',
    '/courses',
    '/cours-de-la-semaine',
    '/gestion-de-projet',
    '/nouvelle-offre',
    '/auth',
  ],
  
  // Authenticated routes (any logged-in user)
  authenticated: [
    '/profile',
    '/settings',
  ],
  
  // Customer routes (paid customers only)
  customer: [
    '/my-courses',
    '/course',
  ],
  
  // B2B routes (B2B members and admins)
  b2b: [
    '/b2b/workspace',
  ],
  
  // B2B admin routes (B2B admins only)
  b2bAdmin: [
    '/b2b/dashboard',
    '/b2b/manage',
    '/b2b/users',
  ],
  
  // System admin routes (system administrators only)
  admin: [
    '/admin',
  ],
};

// Helper function to check if a route matches any patterns
function matchesRoutes(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

// Helper function to determine required role for a path
function getRequiredRole(pathWithoutLocale: string): UserRole | null {
  if (matchesRoutes(pathWithoutLocale, routeConfig.admin)) {
    return UserRole.ADMIN;
  }
  if (matchesRoutes(pathWithoutLocale, routeConfig.b2bAdmin)) {
    return UserRole.B2B_ADMIN;
  }
  if (matchesRoutes(pathWithoutLocale, routeConfig.b2b)) {
    return UserRole.B2B_MEMBER;
  }
  if (matchesRoutes(pathWithoutLocale, routeConfig.customer)) {
    return UserRole.CUSTOMER_PAID;
  }
  if (matchesRoutes(pathWithoutLocale, routeConfig.authenticated)) {
    return UserRole.AUTHENTICATED;
  }
  if (matchesRoutes(pathWithoutLocale, routeConfig.public)) {
    return null; // No authentication required
  }
  
  // Default: require authentication for unknown routes
  return UserRole.AUTHENTICATED;
}

// Helper function to check if user has required role or higher
function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.AUTHENTICATED]: 1,
    [UserRole.CUSTOMER_PAID]: 2,
    [UserRole.B2B_MEMBER]: 3,
    [UserRole.B2B_ADMIN]: 4,
    [UserRole.ADMIN]: 5,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

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
        
        // Determine required role for this route
        const requiredRole = getRequiredRole(pathWithoutLocale);
        
        // If no authentication is required, allow access
        if (requiredRole === null) {
          return true;
        }
        
        // If authentication is required but user is not authenticated, deny access
        if (!token) {
          return false;
        }
        
        // Check if user has the required role
        const userRole = token.role as UserRole;
        if (!userRole) {
          // If user has no role, only allow access to basic authenticated routes
          return requiredRole === UserRole.AUTHENTICATED;
        }
        
        // Check if user's role meets the requirement
        return hasRequiredRole(userRole, requiredRole);
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
    
    // Authenticated routes
    '/profile/:path*',
    '/settings/:path*',
    
    // Customer routes
    '/my-courses/:path*',
    '/course/:path*',
    
    // B2B routes
    '/b2b/:path*',
    
    // Admin routes
    '/admin/:path*',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(fr|en)/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. other paths without locale)
    '/((?!api|_next|_vercel|favicon.ico|logo.svg|file.svg|globe.svg|next.svg|vercel.svg|window.svg|.*\\..*).*)'
  ]
};