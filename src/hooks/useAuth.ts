"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import type { Locale } from '@/i18n';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as Locale;

  const isLoading = status === 'loading';
  const isAuthenticated = !!session;
  const user = session?.user;

  const signOutUser = async (redirectTo?: string) => {
    await signOut({
      callbackUrl: redirectTo || `/${currentLocale}`,
    });
  };

  const redirectToLogin = (callbackUrl?: string) => {
    const callback = callbackUrl || window.location.pathname;
    const encodedCallback = encodeURIComponent(callback);
    router.push(`/${currentLocale}/auth/login?callbackUrl=${encodedCallback}`);
  };

  const redirectToSignup = (callbackUrl?: string) => {
    const callback = callbackUrl || window.location.pathname;
    const encodedCallback = encodeURIComponent(callback);
    router.push(`/${currentLocale}/auth/signup?callbackUrl=${encodedCallback}`);
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  return {
    // State
    isLoading,
    isAuthenticated,
    user,
    session,
    
    // Actions
    signOut: signOutUser,
    redirectToLogin,
    redirectToSignup,
    
    // Helpers
    hasRole,
    isAdmin,
  };
}