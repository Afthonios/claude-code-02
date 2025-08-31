'use client';

import { useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { useTranslations } from 'next-intl';
import { coursesApi, freeWeeklyApi } from '@/lib/directus';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useCompetenceProcessing } from '@/hooks/useCompetenceProcessing';
import { useWeeklyCoursePositioning } from '@/hooks/useWeeklyCoursePositioning';
import { useCoursesPageState } from '@/hooks/useCoursesPageState';
import { filterCourses, generateDirectusFilters, hasActiveFilters, getBookmarks } from '@/lib/services/courseFiltering';
import { COURSE_TYPES } from '@/lib/constants/courseTypes';
import SearchBar from './SearchBar';
import FilterSidebar from './FilterSidebar';
import ActiveFilters from './ActiveFilters';
import CourseCard from './CourseCard';
import type { DirectusCourse } from '@/types/directus';


interface CoursesPageClientProps {
  locale: string;
  initialCourses: DirectusCourse[];
  initialWeeklyFreeCourse?: DirectusCourse | null;
  hasApiError?: boolean;
}

function CoursesPageClient({ locale, initialCourses, initialWeeklyFreeCourse, hasApiError = false }: CoursesPageClientProps) {
  const t = useTranslations('courses');
  
  // TODO: Replace with actual user authentication check
  const isPaidUser = false; // This should be determined from user session/auth
  
  // Use the new state management hook
  const { state, actions } = useCoursesPageState({
    courses: initialCourses,
    weeklyFreeCourse: initialWeeklyFreeCourse || null,
    hasInitialLoad: initialCourses.length > 0,
    apiError: hasApiError
  });
  
  // Use refs to track previous values and prevent unnecessary re-renders
  const previousFilters = useRef<string>('');  
  const previousSearch = useRef<string>('');
  
  // Use the new hooks for competence processing
  const { competenceOptions } = useCompetenceProcessing(locale, initialCourses);

  // Load free weekly course (only if not provided via SSR)
  useEffect(() => {
    // Skip client-side fetch if we already have the weekly course from SSR
    if (initialWeeklyFreeCourse !== undefined) {
      console.log('🎯 [Weekly Course] Using SSR weekly course:', initialWeeklyFreeCourse ? {
        id: initialWeeklyFreeCourse.id,
        title: initialWeeklyFreeCourse.translations?.[0]?.title,
        course_type: initialWeeklyFreeCourse.course_type
      } : null);
      return;
    }
    
    const loadWeeklyCourse = async () => {
      console.log('🎯 [Weekly Course] Starting to load weekly course via client...');
      try {
        const course = await freeWeeklyApi.getCurrentWeekCourse();
        console.log('🎯 [Weekly Course] Loaded course:', course ? {
          id: course.id,
          title: course.translations?.[0]?.title,
          course_type: course.course_type
        } : 'null');
        actions.setWeeklyFreeCourse(course);
      } catch (error) {
        console.error('🎯 [Weekly Course] Error loading weekly free course:', error);
        actions.setWeeklyFreeCourse(null);
      }
    };

    loadWeeklyCourse();
  }, [initialWeeklyFreeCourse, actions]);
  
  const {
    search,
    filters,
    setSearch,
    setFilters,
    removeFilter,
    clearAll,
    clearSearch,
  } = useSearchFilters();

  // Memoized fetch courses function with stable dependencies  
  const fetchCourses = useCallback(async (skipIfLoading = false) => {
    if (skipIfLoading && state.isLoading) {
      return;
    }
    
    actions.setLoading(true);
    actions.setError(null);
    
    try {
      const directusFilters = generateDirectusFilters(filters);
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
      
      if (result.success) {
        actions.setCourses(result.data);
        actions.setInitialLoad(true);
        actions.setApiError(false);
        actions.setError(null);
      } else if (result.error === 'api_failure') {
        actions.setApiError(true);
        actions.setError(null);
      } else {
        actions.setCourses([]);
        actions.setInitialLoad(true);
        actions.setApiError(false);
        actions.setError(null);
      }
    } catch (fetchError) {
      console.error('❌ [CoursesPageClient] Error fetching courses:', fetchError);
      
      let errorMessage = 'Failed to load courses. Please try again later.';
      if (fetchError instanceof Error) {
        if (fetchError.message.includes('fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (fetchError.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = `Error loading courses: ${fetchError.message}`;
        }
      }
      
      actions.setError(errorMessage);
      if (state.hasInitialLoad) {
        actions.setCourses([]);
      }
    } finally {
      actions.setLoading(false);
    }
  }, [search, filters, state.isLoading, state.hasInitialLoad, actions]);

  // Initialize courses from initialCourses if needed
  useEffect(() => {
    if (state.courses.length === 0 && initialCourses.length > 0) {
      actions.setCourses(initialCourses);
    }
  }, [initialCourses, state.courses.length, actions]);

  // Check if filters are active
  const hasFiltersActive = hasActiveFilters(filters, search);

  // Debounced effect for search and filter changes
  useEffect(() => {
    const currentFilters = JSON.stringify({ 
      competences: filters.competences, 
      courseType: filters.courseType,
      showBookmarked: filters.showBookmarked,
      hideCompleted: filters.hideCompleted
    });
    const currentSearch = search.trim();
    
    // Check if filters or search actually changed
    const filtersChanged = currentFilters !== previousFilters.current;
    const searchChanged = currentSearch !== previousSearch.current;
    
    if (!filtersChanged && !searchChanged) {
      return;
    }
    
    // Update refs immediately to prevent duplicate calls
    previousFilters.current = currentFilters;
    previousSearch.current = currentSearch;
    
    // Debounce API calls for search, immediate for filters
    const isSearchOnly = searchChanged && !filtersChanged;
    const delay = isSearchOnly ? 300 : 0;
    
    const timeoutId = setTimeout(() => {
      if (hasFiltersActive) {
        fetchCourses(true);
      } else {
        // Reset to initial courses when no filters active
        actions.setCourses(initialCourses);
      }
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [search, filters.competences, filters.showBookmarked, filters.courseType, filters.hideCompleted, hasFiltersActive, fetchCourses, initialCourses, actions]);
  

  // Memoized event handlers to prevent child re-renders
  const handleClearAllFilters = useCallback(() => {
    clearAll();
    actions.setFilterSidebarOpen(false);
  }, [clearAll, actions]);

  const handleRetryApiCall = useCallback(() => {
    actions.setApiError(false);
    fetchCourses();
  }, [fetchCourses, actions]);

  const handleFilterRemove = useCallback((filterType: keyof typeof filters, value: string) => {
    // Handle boolean filters differently
    if ((filterType === 'showBookmarked' || filterType === 'hideCompleted') && value === 'false') {
      setFilters({
        ...filters,
        [filterType]: false,
      });
    } else {
      removeFilter(filterType, value);
    }
  }, [filters, setFilters, removeFilter]);


  // Memoized course type counts
  const courseTypeCounts = useMemo(() => {
    const counts = {
      formation: 0,
      parcours: 0,
    };
    
    // Count from all available courses (not filtered) - use constants
    initialCourses.forEach(course => {
      if (course.course_type === COURSE_TYPES.FORMATION) {
        counts.formation++;
      } else if (course.course_type === COURSE_TYPES.PARCOURS) {
        counts.parcours++;
      }
    });
    
    return counts;
  }, [initialCourses]);

  // Use the new filtering service and weekly course positioning hook
  const baseFilteredCourses = useMemo(() => {
    return filterCourses({
      courses: state.courses,
      filters,
      search,
      bookmarks: getBookmarks()
    });
  }, [state.courses, filters, search]);

  // Apply weekly course positioning logic
  const filteredCourses = useWeeklyCoursePositioning(
    baseFilteredCourses, 
    state.weeklyFreeCourse, 
    filters
  );

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
              onClick={actions.toggleFilterSidebar}
              className="lg:hidden flex items-center px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-muted"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('filters.title')}
              {hasFiltersActive && (
                <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                  {Object.values(filters).flat().length + (search ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {state.isLoading ? (
                t('resultsCount.loading')
              ) : (() => {
                // Determine which message to show based on selected course type
                const { courseType } = filters;
                
                if (courseType.length === 1) {
                  // Single course type selected
                  if (courseType.includes(COURSE_TYPES.FORMATION)) {
                    return t('resultsCount.foundFormations', { count: filteredCourses.length });
                  } else if (courseType.includes(COURSE_TYPES.PARCOURS)) {
                    return t('resultsCount.foundParcours', { count: filteredCourses.length });
                  }
                } else if (courseType.length === 0) {
                  // No course type filter selected - show neutral "cours/courses"
                  return t('resultsCount.foundCours', { count: filteredCourses.length });
                }
                
                // Default fallback (multiple types or other cases)
                return t('resultsCount.found', { count: filteredCourses.length });
              })()}
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
          competenceOptions={competenceOptions}
        />

        {/* Main Content Area */}
        <div className="flex gap-8 safari-flex-container">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            competenceOptions={competenceOptions}
            isOpen={state.isFilterSidebarOpen}
            onToggle={actions.toggleFilterSidebar}
            isPaidUser={isPaidUser}
            courseTypeCounts={courseTypeCounts}
          />

          {/* Main Content */}
          <div className="flex-1 lg:ml-0 safari-flex-content">
            {state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-destructive">{state.error}</p>
                <button
                  onClick={() => fetchCourses()}
                  className="mt-2 text-sm text-destructive hover:text-destructive/80 underline"
                >
                  {t('noResults.tryAgain')}
                </button>
              </div>
            )}

            {/* Loading State */}
            {state.isLoading && (
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

            {/* API Error State */}
            {state.apiError && (
              <div className="text-center py-12">
                <div className="text-red-400 dark:text-red-600 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('apiError.title')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('apiError.message')}
                </p>
                <button
                  onClick={handleRetryApiCall}
                  disabled={state.isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-md transition-colors"
                >
                  {state.isLoading ? t('common.loading') : t('apiError.retry')}
                </button>
              </div>
            )}

            {/* Course Results */}
            {!state.isLoading && !state.error && !state.apiError && (
              <>
                {filteredCourses.length > 0 ? (
                  <div className="course-grid-safari">
                    {filteredCourses.map((course, index) => (
                      <div key={course.id} className="course-card-container">
                        <CourseCard 
                          course={course} 
                          locale={locale} 
                          priority={index < 8} // First 8 courses get priority loading
                          isWeeklyFreeCourse={state.weeklyFreeCourse?.id === course.id}
                        />
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
                      {hasFiltersActive
                        ? t('noResults.withFilters')
                        : t('noResults.withoutFilters')}
                    </p>
                    {hasFiltersActive && (
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

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: CoursesPageClientProps, nextProps: CoursesPageClientProps) => {
  // Check locale
  if (prevProps.locale !== nextProps.locale) return false;
  
  // Check hasApiError
  if (prevProps.hasApiError !== nextProps.hasApiError) return false;
  
  // Check initialCourses length and basic comparison
  if (prevProps.initialCourses.length !== nextProps.initialCourses.length) return false;
  
  // For performance, only do deep comparison if arrays are small or do shallow check
  if (prevProps.initialCourses.length > 100) {
    // For large arrays, just check first and last few items
    const checkItems = Math.min(3, prevProps.initialCourses.length);
    for (let i = 0; i < checkItems; i++) {
      if (prevProps.initialCourses[i]?.id !== nextProps.initialCourses[i]?.id) return false;
    }
    // Check last items
    const lastIndex = prevProps.initialCourses.length - 1;
    if (lastIndex >= 0 && prevProps.initialCourses[lastIndex]?.id !== nextProps.initialCourses[lastIndex]?.id) return false;
  } else {
    // For smaller arrays, do full comparison
    for (let i = 0; i < prevProps.initialCourses.length; i++) {
      if (prevProps.initialCourses[i]?.id !== nextProps.initialCourses[i]?.id) return false;
    }
  }
  
  return true;
};

export default memo(CoursesPageClient, arePropsEqual);