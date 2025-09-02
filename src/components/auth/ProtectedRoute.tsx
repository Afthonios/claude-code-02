"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import type { Locale } from '@/i18n';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireRole?: string;
}

export default function ProtectedRoute({ 
  children, 
  fallback,
  requireRole 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as Locale;

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      // Redirect to login with callback URL
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.push(`/${currentLocale}/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (requireRole && session.user?.role !== requireRole) {
      // User doesn't have required role, redirect to home
      router.push(`/${currentLocale}`);
      return;
    }
  }, [session, status, router, currentLocale, requireRole]);

  if (status === 'loading') {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </div>
      )
    );
  }

  if (!session) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to sign in...
            </p>
          </div>
        </div>
      )
    );
  }

  if (requireRole && session.user?.role !== requireRole) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Insufficient Permissions
            </h2>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required role: {requireRole}
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}