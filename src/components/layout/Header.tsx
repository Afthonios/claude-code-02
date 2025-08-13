"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Image from "next/image";
import type { Locale } from "@/i18n";

/**
 * Header component with site navigation, language switcher, and theme toggle
 * Responsive design with proper accessibility features
 */
export default function Header() {
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
            href={`/${currentLocale}/courses`}
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
          {/* Mobile navigation menu would go here */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component could go here */}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
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
    </header>
  );
}