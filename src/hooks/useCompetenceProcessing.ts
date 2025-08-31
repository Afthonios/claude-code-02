'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { competencesApi, filterTranslations } from '@/lib/directus';
import { getFallbackCompetences, MAX_MAIN_COMPETENCES, type CompetenceOption } from '@/lib/constants/competences';
import { countCoursesByCompetence } from '@/lib/utils/competenceMatching';
import type { DirectusCourse, DirectusCompetence } from '@/types/directus';

/**
 * Hook for processing competences with counts and fallback handling
 */
export function useCompetenceProcessing(locale: string, courses: DirectusCourse[]) {
  const [competenceOptions, setCompetenceOptions] = useState<CompetenceOption[]>([]);
  
  // Refs to prevent duplicate loads and track state
  const isLoadingCompetences = useRef<boolean>(false);
  const lastLoadedLocale = useRef<string>('');

  // Load competence options from Directus API with fallback
  const loadCompetences = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (isLoadingCompetences.current) {
      return;
    }
    
    // Skip if already loaded for current locale
    if (lastLoadedLocale.current === locale && competenceOptions.length > 0) {
      return;
    }
    
    isLoadingCompetences.current = true;
    try {
      const competences = await competencesApi.getAll();
      
      if (competences.length === 0) {
        console.log('📊 [useCompetenceProcessing] Using fallback competences for locale:', locale);
        setCompetenceOptions(getFallbackCompetences(locale));
        lastLoadedLocale.current = locale;
        return;
      }
      
      // Map and filter to get main competences, ensuring unique IDs
      const seenIds = new Set<string>();
      const allOptions = competences
        .filter(competence => competence.translations && competence.translations.length > 0)
        .map((competence: DirectusCompetence) => {
          const translation = filterTranslations(competence.translations, locale);
          const option: CompetenceOption = {
            value: String(competence.id),
            label: translation?.card_title || translation?.title || `Competence ${competence.id}`,
          };
          
          if (translation?.title) {
            option.title = translation.title;
          }
          if (competence.color_light) {
            option.colorLight = competence.color_light.startsWith('#') 
              ? competence.color_light 
              : `#${competence.color_light}`;
          }
          if (competence.color_dark) {
            option.colorDark = competence.color_dark.startsWith('#') 
              ? competence.color_dark 
              : `#${competence.color_dark}`;
          }
          
          return option;
        })
        .filter(option => {
          if (seenIds.has(option.value)) {
            console.warn(`🔍 [useCompetenceProcessing] Duplicate competence ID found: ${option.value}`);
            return false;
          }
          seenIds.add(option.value);
          return true;
        });
      
      // Take only the configured number of main competences
      const mainCompetences = allOptions.slice(0, MAX_MAIN_COMPETENCES);
      const uniqueCompetences = mainCompetences.filter((competence, index, array) => 
        array.findIndex(c => c.value === competence.value) === index
      );
      
      console.log('📊 [useCompetenceProcessing] Loaded competences from Directus:', uniqueCompetences.length, 'competences for locale', locale);
      setCompetenceOptions(uniqueCompetences);
      lastLoadedLocale.current = locale;
    } catch (error) {
      console.error('🔍 [useCompetenceProcessing] Error loading competences:', error);
      setCompetenceOptions(getFallbackCompetences(locale));
      lastLoadedLocale.current = locale;
    } finally {
      isLoadingCompetences.current = false;
    }
  }, [locale, competenceOptions.length]);

  // Load competences when locale changes or on initial load
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Load competences if locale changed or if we have no competences yet
    if (lastLoadedLocale.current !== locale || (competenceOptions.length === 0 && !isLoadingCompetences.current)) {
      timeoutId = setTimeout(() => {
        loadCompetences();
      }, 100);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [locale, loadCompetences, competenceOptions.length]);

  // Memoized competence options with course counts
  const competenceOptionsWithCounts = useMemo(() => {
    if (competenceOptions.length === 0 || courses.length === 0) {
      return competenceOptions;
    }

    // Get competence counts from courses
    const competenceCounts = countCoursesByCompetence(courses);

    // Add counts to competence options and sort by count (descending)
    const optionsWithCounts = competenceOptions
      .map(option => ({
        ...option,
        count: competenceCounts[option.value] || 0
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0)); // Sort by count, highest first

    return optionsWithCounts;
  }, [competenceOptions, courses]);

  return {
    competenceOptions: competenceOptionsWithCounts,
    isLoading: isLoadingCompetences.current,
    reload: loadCompetences
  };
}