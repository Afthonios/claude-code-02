"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@/i18n';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const t = useTranslations('navigation');
  const params = useParams();
  const currentLocale = params.locale as Locale;
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({
      callbackUrl: `/${currentLocale}`,
    });
  };

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
    );
  }

  if (!session) {
    return (
      <nav className="hidden md:flex items-center space-x-2">
        <Link
          href={`/${currentLocale}/auth/login`}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent text-secondary border border-secondary/30 hover:border-secondary dark:text-accent dark:border-accent/30 dark:hover:border-accent h-9 px-3"
        >
          {t('login')}
        </Link>
        <Link
          href={`/${currentLocale}/auth/signup`}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
        >
          {t('signup')}
        </Link>
      </nav>
    );
  }

  // Generate user initials for avatar
  const initials = session.user?.name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-md p-2 text-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          {initials}
        </div>
        <span className="hidden md:inline-block text-foreground">
          {session.user?.name}
        </span>
        {/* Dropdown arrow */}
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-popover shadow-md z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-popover-foreground">
              {session.user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session.user?.email}
            </p>
          </div>
          
          <div className="py-1">
            <Link
              href={`/${currentLocale}/dashboard`}
              className="block px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('dashboard')}
            </Link>
            <Link
              href={`/${currentLocale}/profile`}
              className="block px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('profile')}
            </Link>
            <div className="border-t border-border mt-1"></div>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}