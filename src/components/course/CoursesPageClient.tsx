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
}

export default function CoursesPageClient({ locale, initialCourses }: CoursesPageClientProps) {
  const t = useTranslations('courses');
  
  // TODO: Replace with actual user authentication check
  const isPaidUser = false; // This should be determined from user session/auth
  const [courses, setCourses] = useState<DirectusCourse[]>(initialCourses);
  const [competenceOptions, setCompetenceOptions] = useState<Array<{ value: string; label: string; colorLight?: string; colorDark?: string }>>([]);
  
  // Remove unused memoized competence options
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
          // Provide fallback with 8 main competences
          console.log('📊 [CoursesPageClient] Using fallback 8 main competences');
          setCompetenceOptions(getMain8CompetencesFallback(locale));
          lastLoadedLocale.current = locale;
          isLoadingCompetences.current = false;
          return;
        }
        
        // Map and filter to get exactly 8 main competences, ensuring unique IDs
        const seenIds = new Set<string>();
        const allOptions = competences
          .filter(competence => competence.translations && competence.translations.length > 0)
          .map((competence: DirectusCompetence) => {
            const translation = filterTranslations(competence.translations, locale);
            const option: { value: string; label: string; colorLight?: string; colorDark?: string } = {
              value: String(competence.id), // Ensure ID is always a string
              // Use card_title if available, otherwise fallback to title
              label: translation?.card_title || translation?.title || `Competence ${competence.id}`,
            };
            if (competence.color_light) option.colorLight = competence.color_light;
            if (competence.color_dark) option.colorDark = competence.color_dark;
            return option;
          })
          .filter(option => {
            // Remove duplicates by ID
            if (seenIds.has(option.value)) {
              console.warn(`🔍 [CoursesPageClient] Duplicate competence ID found: ${option.value} (${option.label})`);
              return false;
            }
            seenIds.add(option.value);
            return true;
          });
        
        // Use the competences from Directus directly (they're already main competences)
        // Limit to 8 and ensure they're ordered consistently
        const main8Competences = allOptions.slice(0, 8);
        
        // Final check for duplicates before setting options
        const uniqueCompetences = main8Competences.filter((competence, index, array) => 
          array.findIndex(c => c.value === competence.value) === index
        );
        
        if (uniqueCompetences.length !== main8Competences.length) {
          console.warn(`🔍 [CoursesPageClient] Removed ${main8Competences.length - uniqueCompetences.length} duplicate competences`);
        }
        
        console.log('📊 [CoursesPageClient] Setting main competences from Directus:', uniqueCompetences);
        setCompetenceOptions(uniqueCompetences);
        lastLoadedLocale.current = locale;
        isLoadingCompetences.current = false;
      } catch (error) {
        console.error('🔍 [CoursesPageClient] Error loading competences:', error);
        // Set fallback options on error to prevent blocking UI
        setCompetenceOptions(getMain8CompetencesFallback(locale));
        lastLoadedLocale.current = locale;
        isLoadingCompetences.current = false;
      }
    };


    // Add a small delay to avoid immediate execution that might cause issues
    const timeout = setTimeout(() => {
      loadCompetences();
    }, 100);
    return () => clearTimeout(timeout);
  }, [locale, competenceOptions.length]); // Include competenceOptions.length dependency

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
    const currentFilters = JSON.stringify({ competences: filters.competences, courseType: filters.courseType });
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
  }, [search, filters.competences, filters.showBookmarked, filters.courseType, filters.hideCompleted, hasActiveFilters, fetchCourses, initialCourses]); // Include fetchCourses and initialCourses
  

  const handleClearAllFilters = () => {
    clearAll();
    setIsFilterSidebarOpen(false);
  };

  const handleFilterRemove = (filterType: keyof typeof filters, value: string) => {
    // Handle boolean filters differently
    if ((filterType === 'showBookmarked' || filterType === 'hideCompleted') && value === 'false') {
      setFilters({
        ...filters,
        [filterType]: false,
      });
    } else {
      removeFilter(filterType, value);
    }
  };

  const toggleFilterSidebar = () => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen);
  };

  // Filter courses based on bookmarks and course type (client-side filtering as fallback)
  const filteredCourses = useMemo(() => {
    let filtered = courses;
    
    // Apply course type filter (client-side fallback when API filtering fails)
    if (filters.courseType.length > 0) {
      filtered = filtered.filter(course => 
        filters.courseType.includes(course.course_type || '')
      );
    }
    
    // Apply bookmark filter
    if (filters.showBookmarked) {
      const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
      filtered = filtered.filter(course => bookmarks.includes(course.id));
    }
    
    return filtered;
  }, [courses, filters.showBookmarked, filters.courseType]);

  // Calculate course type counts
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

  // Calculate competence counts from courses
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