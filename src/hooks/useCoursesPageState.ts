'use client';

import { useReducer, useCallback } from 'react';
import type { DirectusCourse } from '@/types/directus';

/**
 * State management for the courses page using useReducer
 */

export interface CoursesPageState {
  courses: DirectusCourse[];
  weeklyFreeCourse: DirectusCourse | null;
  isLoading: boolean;
  isFilterSidebarOpen: boolean;
  error: string | null;
  hasInitialLoad: boolean;
  apiError: boolean;
}

export type CoursesPageAction =
  | { type: 'SET_COURSES'; payload: DirectusCourse[] }
  | { type: 'SET_WEEKLY_COURSE'; payload: DirectusCourse | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_FILTER_SIDEBAR' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIAL_LOAD'; payload: boolean }
  | { type: 'SET_API_ERROR'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE'; payload: Partial<CoursesPageState> };

function coursesPageReducer(state: CoursesPageState, action: CoursesPageAction): CoursesPageState {
  switch (action.type) {
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    
    case 'SET_WEEKLY_COURSE':
      return { ...state, weeklyFreeCourse: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_FILTER_SIDEBAR_OPEN':
      return { ...state, isFilterSidebarOpen: action.payload };
    
    case 'TOGGLE_FILTER_SIDEBAR':
      return { ...state, isFilterSidebarOpen: !state.isFilterSidebarOpen };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload,
        // Clear API error when setting a regular error
        apiError: action.payload ? false : state.apiError
      };
    
    case 'SET_INITIAL_LOAD':
      return { ...state, hasInitialLoad: action.payload };
    
    case 'SET_API_ERROR':
      return { 
        ...state, 
        apiError: action.payload,
        // Clear regular error when setting API error
        error: action.payload ? null : state.error
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null, apiError: false };
    
    case 'RESET_STATE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

export function useCoursesPageState(initialState: Partial<CoursesPageState> = {}) {
  const defaultState: CoursesPageState = {
    courses: [],
    weeklyFreeCourse: null,
    isLoading: false,
    isFilterSidebarOpen: false,
    error: null,
    hasInitialLoad: false,
    apiError: false,
    ...initialState,
  };

  const [state, dispatch] = useReducer(coursesPageReducer, defaultState);

  // Action creators
  const setCourses = useCallback((courses: DirectusCourse[]) => {
    dispatch({ type: 'SET_COURSES', payload: courses });
  }, []);

  const setWeeklyFreeCourse = useCallback((course: DirectusCourse | null) => {
    dispatch({ type: 'SET_WEEKLY_COURSE', payload: course });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setFilterSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_FILTER_SIDEBAR_OPEN', payload: open });
  }, []);

  const toggleFilterSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_FILTER_SIDEBAR' });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setInitialLoad = useCallback((hasLoaded: boolean) => {
    dispatch({ type: 'SET_INITIAL_LOAD', payload: hasLoaded });
  }, []);

  const setApiError = useCallback((hasError: boolean) => {
    dispatch({ type: 'SET_API_ERROR', payload: hasError });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const resetState = useCallback((newState: Partial<CoursesPageState>) => {
    dispatch({ type: 'RESET_STATE', payload: newState });
  }, []);

  return {
    state,
    actions: {
      setCourses,
      setWeeklyFreeCourse,
      setLoading,
      setFilterSidebarOpen,
      toggleFilterSidebar,
      setError,
      setInitialLoad,
      setApiError,
      clearError,
      resetState,
    },
  };
}