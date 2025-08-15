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
  const [competencesLoading, setCompetencesLoading] = useState(true);
  
  // Memoize competence options to prevent loss during re-renders
  const stableCompetenceOptions = useMemo(() => {
    console.log('🔍 [CoursesPageClient] Stable competence options updated:', competenceOptions);
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
  
  console.log('🔍 [CoursesPageClient] Component initialized with:', {
    locale,
    initialCoursesCount: initialCourses.length,
    hasInitialLoad: initialCourses.length > 0
  });
  
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
        console.log('🔍 [CoursesPageClient] Skipping competence load - already loading');
        return;
      }
      
      // For debugging: always load competences to ensure we have the data
      if (lastLoadedLocale.current === locale && competenceOptions.length > 0) {
        console.log('🔍 [CoursesPageClient] Competences already loaded for locale and options exist:', competenceOptions.length);
        return;
      }
      
      console.log('🔍 [CoursesPageClient] Loading competences for locale:', locale);
      isLoadingCompetences.current = true;
      setCompetencesLoading(true);
      try {
        const competences = await competencesApi.getAll();
        console.log('🔍 [CoursesPageClient] Received competences:', competences.length);
        
        if (competences.length === 0) {
          console.log('🔍 [CoursesPageClient] No competences returned, using fallback');
          // Provide fallback competence options if API returns empty
          setCompetenceOptions([
            { value: 'communication', label: locale === 'fr' ? 'Communication' : 'Communication', colorLight: '#3B82F6', colorDark: '#1D4ED8' },
            { value: 'leadership', label: locale === 'fr' ? 'Leadership' : 'Leadership', colorLight: '#10B981', colorDark: '#047857' },
            { value: 'teamwork', label: locale === 'fr' ? 'Travail d\'équipe' : 'Teamwork', colorLight: '#F59E0B', colorDark: '#D97706' },
            { value: 'problem-solving', label: locale === 'fr' ? 'Résolution de problèmes' : 'Problem Solving', colorLight: '#EF4444', colorDark: '#DC2626' },
          ]);
          lastLoadedLocale.current = locale;
          setCompetencesLoading(false);
          isLoadingCompetences.current = false;
          return;
        }
        
        const options = competences
          .filter(competence => competence.translations && competence.translations.length > 0)
          .map((competence: DirectusCompetence) => {
            const translation = filterTranslations(competence.translations, locale);
            return {
              value: String(competence.id), // Ensure ID is always a string
              label: translation?.title || `Competence ${competence.id}`,
              colorLight: competence.color_light,
              colorDark: competence.color_dark,
            };
          });
        
        console.log('🔍 [CoursesPageClient] Setting competence options:', options.length);
        setCompetenceOptions(options);
        lastLoadedLocale.current = locale;
        setCompetencesLoading(false);
        isLoadingCompetences.current = false;
      } catch (error) {
        console.error('🔍 [CoursesPageClient] Error loading competences:', error);
        console.log('🔍 [CoursesPageClient] Using fallback competences due to error');
        // Set fallback options on error to prevent blocking UI
        setCompetenceOptions([
          { value: 'communication', label: locale === 'fr' ? 'Communication' : 'Communication', colorLight: '#3B82F6', colorDark: '#1D4ED8' },
          { value: 'leadership', label: locale === 'fr' ? 'Leadership' : 'Leadership', colorLight: '#10B981', colorDark: '#047857' },
          { value: 'teamwork', label: locale === 'fr' ? 'Travail d\'équipe' : 'Teamwork', colorLight: '#F59E0B', colorDark: '#D97706' },
          { value: 'problem-solving', label: locale === 'fr' ? 'Résolution de problèmes' : 'Problem Solving', colorLight: '#EF4444', colorDark: '#DC2626' },
        ]);
        lastLoadedLocale.current = locale;
        setCompetencesLoading(false);
        isLoadingCompetences.current = false;
      }
    };


    // Add a small delay to avoid immediate execution that might cause issues
    const timeout = setTimeout(() => {
      console.log('🔍 [CoursesPageClient] Starting competence loading with delay');
      loadCompetences();
    }, 100);
    return () => clearTimeout(timeout);
  }, [locale]);

  // Fetch courses based on current filters
  const fetchCourses = useCallback(async (skipIfLoading = false) => {
    if (skipIfLoading && isLoading) {
      console.log('🔍 [CoursesPageClient] Skipping fetchCourses - already loading');
      return;
    }
    console.log('🔍 [CoursesPageClient] Starting fetchCourses');
    console.log('🔍 [CoursesPageClient] Current search:', search);
    console.log('🔍 [CoursesPageClient] Current filters:', filters);
    
    setIsLoading(true);
    setError(null);
    
    try {
      const directusFilters = getDirectusFilters();
      console.log('🔍 [CoursesPageClient] Generated Directus filters:', directusFilters);
      
      const searchQuery = search.trim();
      console.log('🔍 [CoursesPageClient] Search query:', searchQuery);
      
      const fetchOptions: {
        filter: Record<string, unknown>;
        limit: number;
        sort: string[];
        search?: string;
      } = {
        filter: directusFilters,
        limit: 50,
        sort: ['-date_created'],
      };

      if (searchQuery) {
        fetchOptions.search = searchQuery;
      }

      console.log('🔍 [CoursesPageClient] Final fetch options:', fetchOptions);

      const result = await coursesApi.getAll(fetchOptions);
      console.log('🔍 [CoursesPageClient] API response:', result);
      console.log('🔍 [CoursesPageClient] Number of courses returned:', result?.length || 0);
      
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
      console.log('🔍 [CoursesPageClient] Finished fetchCourses');
    }
  }, [search, filters.competences, getDirectusFilters, isLoading, hasInitialLoad]); // Use specific filter values instead of entire filters object

  // Initialize courses from initialCourses if needed
  useEffect(() => {
    if (courses.length === 0 && initialCourses.length > 0) {
      console.log('🔍 [CoursesPageClient] Initializing courses from props');
      setCourses(initialCourses);
    }
  }, [initialCourses.length, courses.length]);

  // Fetch courses when search or filters change
  useEffect(() => {
    const currentFilters = JSON.stringify(filters.competences);
    const currentSearch = search;
    
    // Check if filters or search actually changed
    const filtersChanged = currentFilters !== previousFilters.current;
    const searchChanged = currentSearch !== previousSearch.current;
    
    if (hasActiveFilters && (filtersChanged || searchChanged)) {
      console.log('🔍 [CoursesPageClient] Filters/search changed, fetching courses');
      console.log('🔍 [CoursesPageClient] Previous filters:', previousFilters.current);
      console.log('🔍 [CoursesPageClient] Current filters:', currentFilters);
      console.log('🔍 [CoursesPageClient] Previous search:', previousSearch.current);
      console.log('🔍 [CoursesPageClient] Current search:', currentSearch);
      
      // Update refs
      previousFilters.current = currentFilters;
      previousSearch.current = currentSearch;
      
      fetchCourses(true);
    } else if (!hasActiveFilters && (previousFilters.current !== '' || previousSearch.current !== '')) {
      // Reset to initial courses when filters are cleared
      console.log('🔍 [CoursesPageClient] Filters cleared, resetting to initial courses');
      setCourses(initialCourses);
      previousFilters.current = '';
      previousSearch.current = '';
    }
  }, [search, filters.competences, hasActiveFilters, fetchCourses, initialCourses]); // Include fetchCourses and initialCourses
  
  // Additional effect to debug filter changes
  useEffect(() => {
    console.log('🔍 [CoursesPageClient] Filters changed:', filters);
  }, [filters]);

  const handleClearAllFilters = () => {
    clearAll();
    setIsFilterSidebarOpen(false);
  };

  const handleFilterRemove = (filterType: keyof typeof filters, value: string) => {
    removeFilter(filterType, value);
  };

  const toggleFilterSidebar = () => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Debug Panel - remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-yellow-800 dark:text-yellow-200">
                🔧 Debug Info (Development Only)
              </summary>
              <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                <div><strong>Search:</strong> &ldquo;{search}&rdquo;</div>
                <div><strong>Active Filters:</strong> {JSON.stringify(filters, null, 2)}</div>
                <div><strong>Courses Count:</strong> {courses.length}</div>
                <div><strong>Has Active Filters:</strong> {hasActiveFilters.toString()}</div>
                <div><strong>Error:</strong> {error || 'None'}</div>
                <div><strong>Is Loading:</strong> {isLoading.toString()}</div>
                <button 
                  onClick={fetchCourses}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  🔄 Manual Refresh
                </button>
              </div>
            </details>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('title')}
          </h1>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="w-full lg:w-auto">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={t('searchPlaceholder')}
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={toggleFilterSidebar}
              className="lg:hidden flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('filters.title')}
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                  {Object.values(filters).flat().length + (search ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading ? (
                'Loading...'
              ) : (
                `${courses.length} course${courses.length !== 1 ? 's' : ''} found`
              )}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {/* Debug: Show competence options in console */}
        {process.env.NODE_ENV === 'development' && console.log('🔍 [CoursesPageClient] Rendering with competence options:', stableCompetenceOptions)}
        <ActiveFilters
          filters={filters}
          searchQuery={search}
          onFilterRemove={handleFilterRemove}
          onSearchClear={clearSearch}
          onClearAll={handleClearAllFilters}
          competenceOptions={stableCompetenceOptions}
        />

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            competenceOptions={competenceOptions}
            isOpen={isFilterSidebarOpen}
            onToggle={toggleFilterSidebar}
          />

          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={fetchCourses}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
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
                {courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <CourseCard key={course.id} course={course} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No courses found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {hasActiveFilters
                        ? 'Try adjusting your search criteria or clearing some filters.'
                        : 'No courses are available at the moment.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearAllFilters}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                      >
                        Clear all filters
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