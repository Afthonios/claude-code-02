'use client';

import { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import { useTranslations } from 'next-intl';
import { coursesApi, competencesApi, freeWeeklyApi } from '@/lib/directus';
import { filterTranslations } from '@/lib/directus';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import SearchBar from './SearchBar';
import FilterSidebar from './FilterSidebar';
import ActiveFilters from './ActiveFilters';
import CourseCard from './CourseCard';
import type { DirectusCourse, DirectusCompetence } from '@/types/directus';

// Fallback competences used when Directus API is not available
// Note: In production, real competence titles come from Directus competences.translations.card_title
function getMain8Competences(locale: string) {
  const competences = [
    { 
      value: 'communication-fallback', 
      label: locale === 'fr' ? 'Communication et Relations' : 'Communication & Relations', 
      colorLight: '#3B82F6', 
      colorDark: '#1D4ED8' 
    },
    { 
      value: 'leadership-fallback', 
      label: locale === 'fr' ? 'Management et Leadership' : 'Management & Leadership', 
      colorLight: '#10B981', 
      colorDark: '#047857' 
    },
    { 
      value: 'strategic-fallback', 
      label: locale === 'fr' ? 'Leadership Stratégique & Vision Inspirante' : 'Strategic Leadership & Vision', 
      colorLight: '#EF4444', 
      colorDark: '#DC2626' 
    },
    { 
      value: 'innovation-fallback', 
      label: locale === 'fr' ? 'Conduite du Changement, Innovation & Inclusion' : 'Change Management & Innovation', 
      colorLight: '#8B5CF6', 
      colorDark: '#7C3AED' 
    },
    { 
      value: 'transformation-fallback', 
      label: locale === 'fr' ? 'Changement et Transformation Organisationnelle' : 'Organizational Transformation', 
      colorLight: '#06B6D4', 
      colorDark: '#0891B2' 
    },
    { 
      value: 'customer-fallback', 
      label: locale === 'fr' ? 'Orientation client' : 'Customer Focus', 
      colorLight: '#84CC16', 
      colorDark: '#65A30D' 
    },
    { 
      value: 'diversity-fallback', 
      label: locale === 'fr' ? 'Diversité et Inclusion' : 'Diversity & Inclusion', 
      colorLight: '#EC4899', 
      colorDark: '#DB2777' 
    },
    { 
      value: 'digital-fallback', 
      label: locale === 'fr' ? 'Transformation Digitale' : 'Digital Transformation', 
      colorLight: '#F59E0B', 
      colorDark: '#D97706' 
    }
  ];
  return competences;
}

// Fallback function for when Directus API is not available - provides basic competences
function getMain8CompetencesFallback(locale: string) {
  // Use generic competence names as fallback - in practice, these will be replaced by real Directus data
  return getMain8Competences(locale);
}

interface CoursesPageClientProps {
  locale: string;
  initialCourses: DirectusCourse[];
  hasApiError?: boolean;
}

function CoursesPageClient({ locale, initialCourses, hasApiError = false }: CoursesPageClientProps) {
  const t = useTranslations('courses');
  
  // TODO: Replace with actual user authentication check
  const isPaidUser = false; // This should be determined from user session/auth
  const [courses, setCourses] = useState<DirectusCourse[]>(initialCourses);
  const [weeklyFreeCourse, setWeeklyFreeCourse] = useState<DirectusCourse | null>(null);
  const [competenceOptions, setCompetenceOptions] = useState<Array<{ value: string; label: string; title?: string; colorLight?: string; colorDark?: string }>>([]);
  
  // Remove unused memoized competence options
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(initialCourses.length > 0);
  const [apiError, setApiError] = useState<boolean>(hasApiError);
  
  // Use refs to track previous values and prevent unnecessary re-renders
  const previousFilters = useRef<string>('');  
  const previousSearch = useRef<string>('');
  const isLoadingCompetences = useRef<boolean>(false);
  const lastLoadedLocale = useRef<string>('');

  // Load free weekly course
  useEffect(() => {
    const loadWeeklyCourse = async () => {
      try {
        const course = await freeWeeklyApi.getCurrentWeekCourse();
        setWeeklyFreeCourse(course);
      } catch (error) {
        console.error('Error loading weekly free course:', error);
        setWeeklyFreeCourse(null);
      }
    };

    loadWeeklyCourse();
  }, []);
  
  
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

  // Load competence options for filter - memoized to prevent re-renders
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
        console.log('📊 [CoursesPageClient] Using fallback 8 main competences');
        setCompetenceOptions(getMain8CompetencesFallback(locale));
        lastLoadedLocale.current = locale;
        return;
      }
      
      // Map and filter to get exactly 8 main competences, ensuring unique IDs
      const seenIds = new Set<string>();
      const allOptions = competences
        .filter(competence => competence.translations && competence.translations.length > 0)
        .map((competence: DirectusCompetence) => {
          const translation = filterTranslations(competence.translations, locale);
          const option: { value: string; label: string; title?: string; colorLight?: string; colorDark?: string } = {
            value: String(competence.id),
            label: translation?.card_title || translation?.title || `Competence ${competence.id}`,
          };
          if (translation?.title) {
            option.title = translation.title;
          }
          if (competence.color_light) {
            option.colorLight = competence.color_light.startsWith('#') ? competence.color_light : `#${competence.color_light}`;
          }
          if (competence.color_dark) {
            option.colorDark = competence.color_dark.startsWith('#') ? competence.color_dark : `#${competence.color_dark}`;
          }
          return option;
        })
        .filter(option => {
          if (seenIds.has(option.value)) {
            console.warn(`🔍 [CoursesPageClient] Duplicate competence ID found: ${option.value}`);
            return false;
          }
          seenIds.add(option.value);
          return true;
        });
      
      const main8Competences = allOptions.slice(0, 8);
      const uniqueCompetences = main8Competences.filter((competence, index, array) => 
        array.findIndex(c => c.value === competence.value) === index
      );
      
      console.log('📊 [CoursesPageClient] Setting main competences from Directus:', uniqueCompetences);
      setCompetenceOptions(uniqueCompetences);
      lastLoadedLocale.current = locale;
    } catch (error) {
      console.error('🔍 [CoursesPageClient] Error loading competences:', error);
      setCompetenceOptions(getMain8CompetencesFallback(locale));
      lastLoadedLocale.current = locale;
    } finally {
      isLoadingCompetences.current = false;
    }
  }, [locale, competenceOptions.length]);

  // Load competences only on locale change or initial load
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, loadCompetences]);

  // Memoized fetch courses function with stable dependencies  
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
      
      if (result.success) {
        setCourses(result.data);
        setHasInitialLoad(true);
        setApiError(false);
        setError(null);
      } else if (result.error === 'api_failure') {
        setApiError(true);
        setError(null);
      } else {
        setCourses([]);
        setHasInitialLoad(true);
        setApiError(false);
        setError(null);
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
      
      setError(errorMessage);
      if (hasInitialLoad) {
        setCourses([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, getDirectusFilters, isLoading, hasInitialLoad]);

  // Initialize courses from initialCourses if needed
  useEffect(() => {
    if (courses.length === 0 && initialCourses.length > 0) {
      setCourses(initialCourses);
    }
  }, [initialCourses, courses.length]);

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
      if (hasActiveFilters) {
        fetchCourses(true);
      } else {
        // Reset to initial courses when no filters active
        setCourses(initialCourses);
      }
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [search, filters.competences, filters.showBookmarked, filters.courseType, filters.hideCompleted, hasActiveFilters, fetchCourses, initialCourses]);
  

  // Memoized event handlers to prevent child re-renders
  const handleClearAllFilters = useCallback(() => {
    clearAll();
    setIsFilterSidebarOpen(false);
  }, [clearAll]);

  const handleRetryApiCall = useCallback(() => {
    setApiError(false);
    fetchCourses();
  }, [fetchCourses]);

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

  const toggleFilterSidebar = useCallback(() => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen);
  }, [isFilterSidebarOpen]);


  // Memoized course type counts
  const courseTypeCounts = useMemo(() => {
    const counts = {
      formation: 0,
      parcours: 0,
    };
    
    // Count from all available courses (not filtered) - match capitalized Directus values
    initialCourses.forEach(course => {
      if (course.course_type === 'Formation') {
        counts.formation++;
      } else if (course.course_type === 'Parcours') {
        counts.parcours++;
      }
    });
    
    return counts;
  }, [initialCourses]);

  // Memoized competence counts calculation to prevent re-renders
  const competenceOptionsWithCounts = useMemo(() => {
    if (competenceOptions.length === 0 || initialCourses.length === 0) {
      return competenceOptions;
    }

    // Create a map to count courses by competence ID
    const competenceCounts: Record<string, number> = {};
    
    initialCourses.forEach(course => {
      // Use the new main_competences field for direct access, fallback to legacy competence field
      const competenceRelations = course.main_competences || course.competence;
      
      if (competenceRelations && Array.isArray(competenceRelations)) {
        const processedCompetenceIds = new Set<string>(); // Track competence IDs for this course to avoid double counting
        
        competenceRelations.forEach((comp: unknown) => {
          let competenceId: string | null = null;
          
          // Type guard for comp structure
          if (comp && typeof comp === 'object' && 'competences_id' in comp) {
            const typedComp = comp as { 
              competences_id?: { 
                id?: string | number;
                parent_competence?: string | number | null;
              } 
            };
            
            if (typedComp.competences_id && typeof typedComp.competences_id === 'object') {
              if (course.main_competences) {
                // For main_competences, use the competence ID directly (it's already a main competence)
                competenceId = String(typedComp.competences_id.id);
              } else {
                // For legacy competence field, check if it has a parent (sub-competence) or is main
                if (typedComp.competences_id.parent_competence) {
                  // This is a sub-competence, use the parent ID
                  competenceId = String(typedComp.competences_id.parent_competence);
                } else if (typedComp.competences_id.parent_competence === null && typedComp.competences_id.id) {
                  // This is already a main competence
                  competenceId = String(typedComp.competences_id.id);
                }
              }
            }
          }
          
          // Only count each competence once per course
          if (competenceId && !processedCompetenceIds.has(competenceId)) {
            competenceCounts[competenceId] = (competenceCounts[competenceId] || 0) + 1;
            processedCompetenceIds.add(competenceId);
          }
        });
      }
    });

    // Add counts to competence options and sort by count (descending)
    const optionsWithCounts = competenceOptions
      .map(option => ({
        ...option,
        count: competenceCounts[option.value] || 0
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0)); // Sort by count, highest first

    return optionsWithCounts;
  }, [competenceOptions, initialCourses]);

  // Memoized filtered courses to prevent unnecessary recalculations
  const filteredCourses = useMemo(() => {
    let filtered = courses;
    
    // Apply course type filter (client-side fallback when API filtering fails)
    if (filters.courseType.length > 0) {
      filtered = filtered.filter(course => 
        filters.courseType.includes(course.course_type || '')
      );
    }
    
    // Apply bookmark filter
    if (filters.showBookmarked && typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
      filtered = filtered.filter(course => bookmarks.includes(course.id));
    }

    // Add weekly free course at position 1 if conditions are met
    if (weeklyFreeCourse && 
        !search.trim() && 
        !filtered.find(course => course.id === weeklyFreeCourse.id) &&
        !filters.showBookmarked && 
        (filters.courseType.length === 0 || filters.courseType.includes(weeklyFreeCourse.course_type || ''))) {
      
      filtered = [weeklyFreeCourse, ...filtered];
    }
    
    return filtered;
  }, [courses, filters.showBookmarked, filters.courseType, weeklyFreeCourse, search]);

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
              ) : (() => {
                // Determine which message to show based on selected course type
                const { courseType } = filters;
                
                if (courseType.length === 1) {
                  // Single course type selected
                  if (courseType.includes('Formation')) {
                    return t('resultsCount.foundFormations', { count: filteredCourses.length });
                  } else if (courseType.includes('Parcours')) {
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
          competenceOptions={competenceOptionsWithCounts}
        />

        {/* Main Content Area */}
        <div className="flex gap-8 safari-flex-container">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            competenceOptions={competenceOptionsWithCounts}
            isOpen={isFilterSidebarOpen}
            onToggle={toggleFilterSidebar}
            isPaidUser={isPaidUser}
            courseTypeCounts={courseTypeCounts}
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

            {/* API Error State */}
            {apiError && (
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
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-md transition-colors"
                >
                  {isLoading ? t('common.loading') : t('apiError.retry')}
                </button>
              </div>
            )}

            {/* Course Results */}
            {!isLoading && !error && !apiError && (
              <>
                {filteredCourses.length > 0 ? (
                  <div className="course-grid-safari">
                    {filteredCourses.map((course, index) => (
                      <div key={course.id} className="course-card-container">
                        <CourseCard 
                          course={course} 
                          locale={locale} 
                          priority={index < 8} // First 8 courses get priority loading
                          isWeeklyFreeCourse={weeklyFreeCourse?.id === course.id}
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