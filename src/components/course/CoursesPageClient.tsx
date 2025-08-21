'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { coursesApi, competencesApi } from '@/lib/directus';
import { filterTranslations } from '@/lib/directus';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import SearchBar from './SearchBar';
import FilterSidebar from './FilterSidebar';
import ActiveFilters from './ActiveFilters';
import CourseCard from './CourseCard';
import type { DirectusCourse, DirectusCompetence } from '@/types/directus';

interface CoursesPageClientProps {
  locale: string;
  initialCourses: DirectusCourse[];
}

export default function CoursesPageClient({ locale, initialCourses }: CoursesPageClientProps) {
  const t = useTranslations('courses');
  const [courses, setCourses] = useState<DirectusCourse[]>(initialCourses);
  const [competenceOptions, setCompetenceOptions] = useState<Array<{ value: string; label: string; colorLight?: string; colorDark?: string }>>([]);
  
  // Memoize competence options to prevent loss during re-renders
  const stableCompetenceOptions = useMemo(() => {
    return competenceOptions.length > 0 ? competenceOptions : [];
  }, [competenceOptions]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(initialCourses.length > 0);
  
  // Use refs to track previous values and prevent unnecessary re-renders
  const previousFilters = useRef<string>('');  
  const previousSearch = useRef<string>('');
  const isLoadingCompetences = useRef<boolean>(false);
  const lastLoadedLocale = useRef<string>('');
  
  
  const {
    search,
    filters,
    setSearch,
    setFilters,
    removeFilter,
    clearAll,
    clearSearch,
    getDirectusFilters,
    hasActiveFilters,
  } = useSearchFilters();

  // Load competence options for filter
  useEffect(() => {
    const loadCompetences = async () => {
      // Prevent multiple simultaneous loads
      if (isLoadingCompetences.current) {
        return;
      }
      
      // For debugging: always load competences to ensure we have the data
      if (lastLoadedLocale.current === locale && competenceOptions.length > 0) {
        return;
      }
      
      isLoadingCompetences.current = true;
      try {
        const competences = await competencesApi.getAll();
        
        if (competences.length === 0) {
          // Provide fallback competence options if API returns empty
          setCompetenceOptions([
            { value: 'communication', label: locale === 'fr' ? 'Communication' : 'Communication', colorLight: '#3B82F6', colorDark: '#1D4ED8' },
            { value: 'leadership', label: locale === 'fr' ? 'Leadership' : 'Leadership', colorLight: '#10B981', colorDark: '#047857' },
            { value: 'teamwork', label: locale === 'fr' ? 'Travail d\'équipe' : 'Teamwork', colorLight: '#F59E0B', colorDark: '#D97706' },
            { value: 'problem-solving', label: locale === 'fr' ? 'Résolution de problèmes' : 'Problem Solving', colorLight: '#EF4444', colorDark: '#DC2626' },
          ]);
          lastLoadedLocale.current = locale;
          isLoadingCompetences.current = false;
          return;
        }
        
        const options = competences
          .filter(competence => competence.translations && competence.translations.length > 0)
          .map((competence: DirectusCompetence) => {
            const translation = filterTranslations(competence.translations, locale);
            const option: { value: string; label: string; colorLight?: string; colorDark?: string } = {
              value: String(competence.id), // Ensure ID is always a string
              label: translation?.title || `Competence ${competence.id}`,
            };
            if (competence.color_light) option.colorLight = competence.color_light;
            if (competence.color_dark) option.colorDark = competence.color_dark;
            return option;
          });
        
        setCompetenceOptions(options);
        lastLoadedLocale.current = locale;
        isLoadingCompetences.current = false;
      } catch (error) {
        console.error('🔍 [CoursesPageClient] Error loading competences:', error);
        // Set fallback options on error to prevent blocking UI
        setCompetenceOptions([
          { value: 'communication', label: locale === 'fr' ? 'Communication' : 'Communication', colorLight: '#3B82F6', colorDark: '#1D4ED8' },
          { value: 'leadership', label: locale === 'fr' ? 'Leadership' : 'Leadership', colorLight: '#10B981', colorDark: '#047857' },
          { value: 'teamwork', label: locale === 'fr' ? 'Travail d\'équipe' : 'Teamwork', colorLight: '#F59E0B', colorDark: '#D97706' },
          { value: 'problem-solving', label: locale === 'fr' ? 'Résolution de problèmes' : 'Problem Solving', colorLight: '#EF4444', colorDark: '#DC2626' },
        ]);
        lastLoadedLocale.current = locale;
        isLoadingCompetences.current = false;
      }
    };


    // Add a small delay to avoid immediate execution that might cause issues
    const timeout = setTimeout(() => {
      loadCompetences();
    }, 100);
    return () => clearTimeout(timeout);
  }, [locale, competenceOptions.length]);

  // Fetch courses based on current filters
  const fetchCourses = useCallback(async (skipIfLoading = false) => {
    if (skipIfLoading && isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const directusFilters = getDirectusFilters();
      
      const searchQuery = search.trim();
      
      const fetchOptions: {
        filter: Record<string, unknown>;
        limit: number;
        sort: string[];
        search?: string;
      } = {
        filter: directusFilters,
        limit: 1000,
        sort: ['-date_created'],
      };

      if (searchQuery) {
        fetchOptions.search = searchQuery;
      }


      const result = await coursesApi.getAll(fetchOptions);
      
      setCourses(result || []);
      setHasInitialLoad(true);
      
      // Clear any previous errors on successful load
      if (error) {
        setError(null);
      }
    } catch (fetchError) {
      console.error('❌ [CoursesPageClient] Error fetching courses:', fetchError);
      
      // More specific error messages
      if (fetchError instanceof Error) {
        if (fetchError.message.includes('fetch')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else if (fetchError.message.includes('timeout')) {
          setError('Request timed out. Please try again.');
        } else {
          setError(`Error loading courses: ${fetchError.message}`);
        }
      } else {
        setError('Failed to load courses. Please try again later.');
      }
      
      // Only clear courses if this isn't the initial load
      if (hasInitialLoad) {
        setCourses([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, getDirectusFilters, isLoading, hasInitialLoad, error]);

  // Initialize courses from initialCourses if needed
  useEffect(() => {
    if (courses.length === 0 && initialCourses.length > 0) {
      setCourses(initialCourses);
    }
  }, [initialCourses, courses.length]);

  // Fetch courses when search or filters change
  useEffect(() => {
    const currentFilters = JSON.stringify(filters.competences);
    const currentSearch = search;
    
    // Check if filters or search actually changed
    const filtersChanged = currentFilters !== previousFilters.current;
    const searchChanged = currentSearch !== previousSearch.current;
    
    if (hasActiveFilters && (filtersChanged || searchChanged)) {
      
      // Update refs
      previousFilters.current = currentFilters;
      previousSearch.current = currentSearch;
      
      fetchCourses(true);
    } else if (!hasActiveFilters && (previousFilters.current !== '' || previousSearch.current !== '')) {
      // Reset to initial courses when filters are cleared
      setCourses(initialCourses);
      previousFilters.current = '';
      previousSearch.current = '';
    }
  }, [search, filters.competences, filters.showBookmarked, hasActiveFilters, fetchCourses, initialCourses]); // Include fetchCourses and initialCourses
  

  const handleClearAllFilters = () => {
    clearAll();
    setIsFilterSidebarOpen(false);
  };

  const handleFilterRemove = (filterType: keyof typeof filters, value: string) => {
    // Handle boolean filters differently
    if (filterType === 'showBookmarked' && value === 'false') {
      setFilters({
        ...filters,
        showBookmarked: false,
      });
    } else {
      removeFilter(filterType, value);
    }
  };

  const toggleFilterSidebar = () => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen);
  };

  // Filter courses based on bookmarks (client-side filtering)
  const filteredCourses = useMemo(() => {
    if (!filters.showBookmarked) {
      return courses;
    }
    
    // Get bookmarked course IDs from localStorage
    const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
    return courses.filter(course => bookmarks.includes(course.id));
  }, [courses, filters.showBookmarked]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-gray-900">
      <div className="container py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('title')}
          </h1>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="w-full lg:w-[30%]">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={t('searchPlaceholder')}
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={toggleFilterSidebar}
              className="lg:hidden flex items-center px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-muted"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('filters.title')}
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                  {Object.values(filters).flat().length + (search ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                t('resultsCount.loading')
              ) : (
                t('resultsCount.found', { count: filteredCourses.length })
              )}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          filters={filters}
          searchQuery={search}
          onFilterRemove={handleFilterRemove}
          onSearchClear={clearSearch}
          onClearAll={handleClearAllFilters}
          competenceOptions={stableCompetenceOptions}
        />

        {/* Main Content Area */}
        <div className="flex gap-8 safari-flex-container">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            competenceOptions={competenceOptions}
            isOpen={isFilterSidebarOpen}
            onToggle={toggleFilterSidebar}
          />

          {/* Main Content */}
          <div className="flex-1 lg:ml-0 safari-flex-content">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-destructive">{error}</p>
                <button
                  onClick={() => fetchCourses()}
                  className="mt-2 text-sm text-destructive hover:text-destructive/80 underline"
                >
                  {t('noResults.tryAgain')}
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="course-grid-safari">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="min-w-0 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Course Results */}
            {!isLoading && !error && (
              <>
                {filteredCourses.length > 0 ? (
                  <div className="course-grid-safari">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="course-card-container">
                        <CourseCard course={course} locale={locale} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {t('noResults.title')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {hasActiveFilters
                        ? t('noResults.withFilters')
                        : t('noResults.withoutFilters')}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearAllFilters}
                        className="text-primary hover:text-primary/80 underline"
                      >
                        {t('noResults.clearFilters')}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}