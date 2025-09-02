"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import type { Locale } from '@/i18n';
import { UserRole, hasRoleOrHigher, isB2BUser, isPayingCustomer, hasAdminPrivileges } from '@/lib/roles';

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

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  const hasRoleOrHigherThan = (role: UserRole) => {
    if (!user?.role) return false;
    return hasRoleOrHigher(user.role, role);
  };

  const isAdmin = () => {
    return user?.role ? hasAdminPrivileges(user.role) : false;
  };

  const isB2B = () => {
    return user?.role ? isB2BUser(user.role) : false;
  };

  const isPaid = () => {
    return user?.role ? isPayingCustomer(user.role) : false;
  };

  const canAccessRoute = (requiredRole: UserRole) => {
    if (!user?.role) return requiredRole === UserRole.AUTHENTICATED;
    return hasRoleOrHigher(user.role, requiredRole);
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
    
    // Role Helpers
    hasRole,
    hasRoleOrHigher: hasRoleOrHigherThan,
    isAdmin,
    isB2B,
    isPaid,
    canAccessRoute,
  };
}