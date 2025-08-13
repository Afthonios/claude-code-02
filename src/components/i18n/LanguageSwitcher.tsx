"use client";

import { useRouter, usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import { locales, type Locale } from "../../i18n";
import { useTransition } from "react";
import { Globe } from "lucide-react";

/**
 * LanguageSwitcher component for switching between supported locales
 * Updates the URL path to maintain the same route in the new locale
 */
export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  
  const currentLocale = params.locale as Locale;

  const switchToLocale = (locale: Locale) => {
    // Don't switch if already on the same locale
    if (locale === currentLocale) return;

    startTransition(() => {
      // Replace the current locale in the pathname with the new locale
      const segments = pathname.split('/');
      segments[1] = locale;
      const newPath = segments.join('/');
      
      router.push(newPath);
    });
  };

  const getLanguageLabel = (locale: Locale) => {
    switch (locale) {
      case 'fr':
        return 'FR';
      case 'en':
        return 'EN';
    }
  };

  const getLanguageName = (locale: Locale) => {
    switch (locale) {
      case 'fr':
        return 'Français';
      case 'en':
        return 'English';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <div 
        role="group" 
        aria-label="Language selector"
        className="flex rounded-md border border-input bg-background"
      >
        {locales.map((locale) => {
          const isActive = locale === currentLocale;
          const isDisabled = isPending;
          
          return (
            <button
              key={locale}
              onClick={() => switchToLocale(locale)}
              disabled={isDisabled}
              className={`
                px-3 py-1.5 text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                disabled:pointer-events-none disabled:opacity-50
                first:rounded-l-md last:rounded-r-md
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
                }
                ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-label={`Switch to ${getLanguageName(locale)}`}
              title={`Switch to ${getLanguageName(locale)}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {getLanguageLabel(locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}