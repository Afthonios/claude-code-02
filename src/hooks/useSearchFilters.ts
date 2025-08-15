'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
  competences: string[];
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
    
    console.log('🔍 [useSearchFilters] Initializing from URL:', {
      search,
      competences,
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    return {
      search,
      competences,
    };
  });

  // Update URL when state changes
  const updateURL = useCallback((newState: SearchFiltersState) => {
    const params = new URLSearchParams();
    
    if (newState.search) {
      params.set('search', newState.search);
    }
    
    Object.entries(newState).forEach(([key, value]) => {
      if (key !== 'search' && Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      }
    });

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;
    
    // Use replace to avoid cluttering browser history
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Update search query
  const setSearch = useCallback((search: string) => {
    console.log('🔍 [useSearchFilters] setSearch called with:', search);
    const newState = { ...state, search };
    console.log('🔍 [useSearchFilters] New state after search update:', newState);
    setState(newState);
    updateURL(newState);
  }, [state, updateURL]);

  // Update filters
  const setFilters = useCallback((filters: FilterState) => {
    console.log('🔍 [useSearchFilters] setFilters called with:', filters);
    const newState = { ...state, ...filters };
    console.log('🔍 [useSearchFilters] New state after filters update:', newState);
    setState(newState);
    updateURL(newState);
  }, [state, updateURL]);

  // Remove specific filter value
  const removeFilter = useCallback((filterType: keyof FilterState, value: string) => {
    const newFilters = {
      ...state,
      [filterType]: state[filterType].filter(v => v !== value),
    };
    setState(newFilters);
    updateURL(newFilters);
  }, [state, updateURL]);

  // Clear all filters and search
  const clearAll = useCallback(() => {
    const newState: SearchFiltersState = {
      search: '',
      competences: [],
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
    };

    console.log('🔍 [useSearchFilters] URL sync effect - newState:', newState);
    console.log('🔍 [useSearchFilters] URL sync effect - currentState:', state);
    console.log('🔍 [useSearchFilters] URL sync effect - isFirstLoad:', isFirstLoad);

    // Update state if it changed OR if this is the first load (to trigger effects)
    const hasChanged = JSON.stringify(state) !== JSON.stringify(newState);
    if (hasChanged || isFirstLoad) {
      console.log('🔍 [useSearchFilters] Updating state, hasChanged:', hasChanged, 'isFirstLoad:', isFirstLoad);
      setState(newState);
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Remove state dependency to avoid infinite loop

  // Generate Directus API filter object
  const getDirectusFilters = useCallback(() => {
    console.log('🔍 [useSearchFilters] getDirectusFilters called with competences:', state.competences);
    
    const filters: Record<string, unknown> = {
      status: { _eq: 'published' },
    };

    // Competences filter (filtering by parent competences)
    if (state.competences.length > 0) {
      console.log('🔍 [useSearchFilters] Adding competences filter:', state.competences);
      // Filter courses that have any of the selected parent competences
      filters.competence = {
        competences_id: {
          parent_competence: {
            id: { _in: state.competences }
          }
        }
      };
    }

    console.log('🔍 [useSearchFilters] Final generated filters:', JSON.stringify(filters, null, 2));
    return filters;
  }, [state.competences]); // Only depend on competences array, not entire state

  // Stable hasActiveFilters computation
  const hasActiveFilters = useMemo(() => {
    return state.search || state.competences.length > 0;
  }, [state.search, state.competences]);

  return {
    // State
    search: state.search,
    filters: {
      competences: state.competences,
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