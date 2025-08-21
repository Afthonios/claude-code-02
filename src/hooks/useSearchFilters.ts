'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
  competences: string[];
  showBookmarked: boolean;
  courseType: string[];  // Formation, Parcours
  hideCompleted: boolean; // Masquer les formations terminées
}

export interface SearchFiltersState extends FilterState {
  search: string;
}

export function useSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const [state, setState] = useState<SearchFiltersState>(() => {
    const search = searchParams.get('search') || '';
    const competences = searchParams.get('competences')?.split(',').filter(Boolean) || [];
    const showBookmarked = searchParams.get('showBookmarked') === 'true';
    const courseType = searchParams.get('courseType')?.split(',').filter(Boolean) || [];
    const hideCompleted = searchParams.get('hideCompleted') === 'true';
    
    
    return {
      search,
      competences,
      showBookmarked,
      courseType,
      hideCompleted,
    };
  });

  // Update URL when state changes
  const updateURL = useCallback((newState: SearchFiltersState) => {
    try {
      const params = new URLSearchParams();
      
      if (newState.search) {
        params.set('search', newState.search);
      }
      
      if (newState.showBookmarked) {
        params.set('showBookmarked', 'true');
      }
      
      if (newState.hideCompleted) {
        params.set('hideCompleted', 'true');
      }
      
      Object.entries(newState).forEach(([key, value]) => {
        if (key !== 'search' && key !== 'showBookmarked' && key !== 'hideCompleted' && Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        }
      });

      const queryString = params.toString();
      
      // Use replace to avoid cluttering browser history
      if (typeof window !== 'undefined') {
        try {
          const currentPath = window.location.pathname;
          const newURL = queryString ? `${currentPath}?${queryString}` : currentPath;
          
          // Use a simple approach that doesn't trigger Next.js navigation
          const url = new URL(newURL, window.location.origin);
          window.history.replaceState(null, '', url.toString());
        } catch (urlError) {
          console.warn('Failed to update URL:', urlError);
          // Fallback: don't update URL if it fails
        }
      }
    } catch (error) {
      console.warn('Error in updateURL:', error);
      // Continue without URL updates if there's an error
    }
  }, []);

  // Update search query
  const setSearch = useCallback((search: string) => {
    const newState = { ...state, search };
    setState(newState);
    updateURL(newState);
  }, [state, updateURL]);

  // Update filters
  const setFilters = useCallback((filters: FilterState) => {
    // Special handling for courseType to ensure either/or behavior
    let newState = { ...state, ...filters };
    
    // If courseType is being updated and has multiple values, keep only the last one
    if (filters.courseType && filters.courseType.length > 1) {
      console.log('⚠️ Multiple courseType values detected, keeping only:', filters.courseType[filters.courseType.length - 1]);
      newState.courseType = [filters.courseType[filters.courseType.length - 1]];
    }
    
    setState(newState);
    updateURL(newState);
  }, [state, updateURL]);

  // Remove specific filter value
  const removeFilter = useCallback((filterType: keyof FilterState, value: string) => {
    const newFilters = { ...state };
    
    // Handle array filters (competences, courseType)
    if ((filterType === 'competences' || filterType === 'courseType') && Array.isArray(state[filterType])) {
      newFilters[filterType] = state[filterType].filter(v => v !== value);
    }
    
    setState(newFilters);
    updateURL(newFilters);
  }, [state, updateURL]);

  // Clear all filters and search
  const clearAll = useCallback(() => {
    const newState: SearchFiltersState = {
      search: '',
      competences: [],
      showBookmarked: false,
      courseType: [],
      hideCompleted: false,
    };
    setState(newState);
    updateURL(newState);
  }, [updateURL]);

  // Clear only search
  const clearSearch = useCallback(() => {
    setSearch('');
  }, [setSearch]);

  // Track if this is the first load
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Sync state with URL params when they change (e.g., browser back/forward)
  useEffect(() => {
    const newState: SearchFiltersState = {
      search: searchParams.get('search') || '',
      competences: searchParams.get('competences')?.split(',').filter(Boolean) || [],
      showBookmarked: searchParams.get('showBookmarked') === 'true',
      courseType: searchParams.get('courseType')?.split(',').filter(Boolean) || [],
      hideCompleted: searchParams.get('hideCompleted') === 'true',
    };


    // Update state if it changed OR if this is the first load (to trigger effects)
    const hasChanged = JSON.stringify(state) !== JSON.stringify(newState);
    if (hasChanged || isFirstLoad) {
      setState(newState);
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Remove state dependency to avoid infinite loop

  // Generate Directus API filter object
  const getDirectusFilters = useCallback(() => {
    
    const filters: Record<string, unknown> = {
      status: { _eq: 'published' },
    };

    // Competences filter (filtering by parent competences)
    if (state.competences.length > 0) {
      // Filter courses that have any of the selected parent competences
      filters.competence = {
        competences_id: {
          parent_competence: {
            id: { _in: state.competences }
          }
        }
      };
    }

    // Course type filter
    if (state.courseType.length > 0) {
      filters.course_type = { _in: state.courseType };
    }

    return filters;
  }, [state.competences, state.courseType]); // Include courseType in dependencies

  // Stable hasActiveFilters computation
  const hasActiveFilters = useMemo(() => {
    return state.search || state.competences.length > 0 || state.showBookmarked || state.courseType.length > 0 || state.hideCompleted;
  }, [state.search, state.competences, state.showBookmarked, state.courseType, state.hideCompleted]);

  return {
    // State
    search: state.search,
    filters: {
      competences: state.competences,
      showBookmarked: state.showBookmarked,
      courseType: state.courseType,
      hideCompleted: state.hideCompleted,
    },
    
    // Actions
    setSearch,
    setFilters,
    removeFilter,
    clearAll,
    clearSearch,
    
    // API helpers
    getDirectusFilters,
    
    // Computed
    hasActiveFilters,
  };
}