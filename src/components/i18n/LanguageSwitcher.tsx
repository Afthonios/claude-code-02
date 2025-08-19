"use client";

import { useRouter, usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import { locales, type Locale } from "../../i18n";
import { useTransition, useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { getCourseUrl } from "../../lib/directus";
import type { DirectusCourse } from "../../types/directus";

/**
 * LanguageSwitcher component for switching between supported locales
 * Updates the URL path to maintain the same route in the new locale
 * Handles course pages with proper localized slugs
 */
export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [courseData, setCourseData] = useState<{
    id: string;
    legacy_id: string;
    translations: Array<{
      languages_code: string;
      slug: string;
      title: string;
    }>;
  } | null>(null);
  
  const currentLocale = params.locale as Locale;

  // Check if we're on a course page and fetch course data
  useEffect(() => {
    const isCoursePage = pathname.includes('/cours/') || pathname.includes('/courses/');
    
    if (isCoursePage && params.slug) {
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      console.log('🔍 LanguageSwitcher: Fetching course data for slug:', slug);
      
      fetch(`/api/courses/${slug}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then(course => {
          console.log('✅ LanguageSwitcher: Course data loaded:', {
            id: course.id,
            legacy_id: course.legacy_id,
            translationsCount: course.translations?.length || 0,
            translations: course.translations?.map((t: { languages_code: string; slug: string; title: string }) => ({ 
              language: t.languages_code, 
              slug: t.slug,
              title: t.title 
            }))
          });
          setCourseData(course);
        })
        .catch(error => {
          console.error('❌ LanguageSwitcher: Error fetching course data:', error);
          setCourseData(null);
        });
    } else {
      setCourseData(null);
    }
  }, [pathname, params.slug]);

  const switchToLocale = (locale: Locale) => {
    // Don't switch if already on the same locale
    if (locale === currentLocale) return;

    startTransition(() => {
      // Check if we're on a course page and have course data
      const isCoursePage = pathname.includes('/cours/') || pathname.includes('/courses/');
      
      if (isCoursePage && courseData) {
        // Create a compatible course object for getCourseUrl
        const courseForUrl = {
          id: courseData.id,
          legacy_id: courseData.legacy_id,
          translations: courseData.translations
        };
        
        // Generate the proper localized course URL
        const newPath = getCourseUrl(courseForUrl as DirectusCourse, locale);
        console.log('🔄 LanguageSwitcher: Switching from', currentLocale, 'to', locale);
        console.log('📍 LanguageSwitcher: Generated URL:', newPath);
        console.log('🗂️ LanguageSwitcher: Course translations:', courseData.translations?.map(t => ({ 
          language: t.languages_code, 
          slug: t.slug 
        })));
        router.push(newPath);
      } else {
        // For non-course pages, use the simple locale replacement
        const segments = pathname.split('/');
        segments[1] = locale;
        
        // Handle the courses/cours path difference
        if (segments[2] === 'courses' && locale === 'fr') {
          segments[2] = 'cours';
        } else if (segments[2] === 'cours' && locale === 'en') {
          segments[2] = 'courses';
        }
        
        const newPath = segments.join('/');
        router.push(newPath);
      }
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