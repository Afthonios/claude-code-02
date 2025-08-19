'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
  competences: string[];
  showBookmarked: boolean;
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
    
    
    return {
      search,
      competences,
      showBookmarked,
    };
  });

  // Update URL when state changes
  const updateURL = useCallback((newState: SearchFiltersState) => {
    const params = new URLSearchParams();
    
    if (newState.search) {
      params.set('search', newState.search);
    }
    
    if (newState.showBookmarked) {
      params.set('showBookmarked', 'true');
    }
    
    Object.entries(newState).forEach(([key, value]) => {
      if (key !== 'search' && key !== 'showBookmarked' && Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      }
    });

    const queryString = params.toString();
    
    // Use replace to avoid cluttering browser history
    // Only pass the query string, let Next.js handle the pathname
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const newURL = queryString ? `${currentPath}?${queryString}` : currentPath;
      router.replace(newURL, { scroll: false });
    }
  }, [router]);

  // Update search query
  const setSearch = useCallback((search: string) => {
    const newState = { ...state, search };
    setState(newState);
    updateURL(newState);
  }, [state, updateURL]);

  // Update filters
  const setFilters = useCallback((filters: FilterState) => {
    const newState = { ...state, ...filters };
    setState(newState);
    updateURL(newState);
  }, [state, updateURL]);

  // Remove specific filter value
  const removeFilter = useCallback((filterType: keyof FilterState, value: string) => {
    const newFilters = { ...state };
    
    // Only handle competences array - showBookmarked is a boolean
    if (filterType === 'competences' && Array.isArray(state[filterType])) {
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

    return filters;
  }, [state.competences]); // Only depend on competences array, not entire state

  // Stable hasActiveFilters computation
  const hasActiveFilters = useMemo(() => {
    return state.search || state.competences.length > 0 || state.showBookmarked;
  }, [state.search, state.competences, state.showBookmarked]);

  return {
    // State
    search: state.search,
    filters: {
      competences: state.competences,
      showBookmarked: state.showBookmarked,
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