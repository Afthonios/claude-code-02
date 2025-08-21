"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import SearchOverlay from "@/components/layout/SearchOverlay";
import Image from "next/image";
import { getCoursesListUrl } from "@/lib/directus";
import type { Locale } from "@/i18n";

/**
 * Header component with site navigation, language switcher, and theme toggle
 * Responsive design with proper accessibility features
 */
export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const t = useTranslations('navigation');
  const params = useParams();
  const currentLocale = params.locale as Locale;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo and Site Name */}
        <div className="mr-4 flex">
          <Link 
            href={`/${currentLocale}`} 
            className="mr-4 flex items-center space-x-2 font-bold"
            aria-label="Afthonios - Return to homepage"
          >
            <Image 
              src="/logo.svg" 
              alt="Afthonios Logo" 
              width={24} 
              height={24} 
              className="h-6 w-6"
            />
            <span className="hidden font-bold sm:inline-block">
              Afthonios
            </span>
          </Link>
        </div>

        {/* Main Navigation - Hidden on mobile, shown on larger screens */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href={getCoursesListUrl(currentLocale)}
            className="transition-colors text-secondary hover:underline dark:text-accent dark:hover:underline focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {t('courses')}
          </Link>
          <Link
            href={`/${currentLocale}/cours-de-la-semaine`}
            className="transition-colors text-secondary hover:underline dark:text-accent dark:hover:underline focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {t('courseOfTheWeek')}
          </Link>
          <Link
            href={`/${currentLocale}/gestion-de-projet`}
            className="transition-colors text-secondary hover:underline dark:text-accent dark:hover:underline focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {t('projectManagement')}
          </Link>
          <Link
            href={`/${currentLocale}/nouvelle-offre`}
            className="transition-colors text-secondary hover:underline dark:text-accent dark:hover:underline focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {t('newOffer')}
          </Link>
        </nav>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Space for mobile menu or future features */}
          <div className="flex-1 md:flex-none">
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="
                flex items-center justify-center w-9 h-9 rounded-md
                text-muted-foreground hover:text-foreground
                hover:bg-muted transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-ring
              "
              aria-label="Search courses"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* Auth buttons - placeholder for now */}
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
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  );
}