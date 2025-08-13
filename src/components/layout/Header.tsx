import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GraduationCap } from "lucide-react";

/**
 * Header component with site navigation, language switcher, and theme toggle
 * Responsive design with proper accessibility features
 */
export default function Header() {
  const t = useTranslations('navigation');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo and Site Name */}
        <div className="mr-4 flex">
          <Link 
            href="/" 
            className="mr-4 flex items-center space-x-2 font-bold"
            aria-label="Afthonios - Return to homepage"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Afthonios
            </span>
          </Link>
        </div>

        {/* Main Navigation - Hidden on mobile, shown on larger screens */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/courses"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            {t('courses')}
          </Link>
          <Link
            href="/cours-de-la-semaine"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            {t('courseOfTheWeek')}
          </Link>
          <Link
            href="/gestion-de-projet"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            {t('projectManagement')}
          </Link>
          <Link
            href="/nouvelle-offre"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
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
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                {t('login')}
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
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