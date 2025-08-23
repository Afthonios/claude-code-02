import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearchFilters } from '@/hooks/useSearchFilters';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouter = { push: mockPush, replace: mockReplace };

describe('useSearchFilters Hook', () => {
  const mockSearchParams = new Map();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
    
    (useRouter as any).mockReturnValue(mockRouter);
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key),
      forEach: (callback: (value: string, key: string) => void) => {
        mockSearchParams.forEach(callback);
      },
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty filters', () => {
      const { result } = renderHook(() => useSearchFilters());

      expect(result.current.search).toBe('');
      expect(result.current.filters.competences).toEqual([]);
      expect(result.current.filters.showBookmarked).toBe(false);
      expect(result.current.filters.courseType).toEqual([]);
      expect(result.current.filters.hideCompleted).toBe(false);
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should initialize with URL parameters', () => {
      mockSearchParams.set('search', 'test search');
      mockSearchParams.set('competences', 'javascript,react');
      mockSearchParams.set('courseType', 'formation,parcours');
      mockSearchParams.set('showBookmarked', 'true');
      mockSearchParams.set('hideCompleted', 'true');

      const { result } = renderHook(() => useSearchFilters());

      expect(result.current.search).toBe('test search');
      expect(result.current.filters.competences).toEqual(['javascript', 'react']);
      expect(result.current.filters.courseType).toEqual(['formation', 'parcours']);
      expect(result.current.filters.showBookmarked).toBe(true);
      expect(result.current.filters.hideCompleted).toBe(true);
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('Directus Filter Generation', () => {
    it('should generate basic published status filter', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      const directusFilters = result.current.getDirectusFilters();
      
      expect(directusFilters).toEqual({
        status: { _eq: 'published' },
      });
    });

    it('should add course type filter when courseType is set', () => {
      // Initialize with course type filter
      mockSearchParams.set('courseType', 'formation');
      
      const { result } = renderHook(() => useSearchFilters());
      
      const directusFilters = result.current.getDirectusFilters();
      
      expect(directusFilters).toEqual({
        status: { _eq: 'published' },
        course_type: { _in: ['formation'] },
      });
    });

    it('should add course type filter with multiple values', () => {
      mockSearchParams.set('courseType', 'formation,parcours');
      
      const { result } = renderHook(() => useSearchFilters());
      
      const directusFilters = result.current.getDirectusFilters();
      
      expect(directusFilters).toEqual({
        status: { _eq: 'published' },
        course_type: { _in: ['formation', 'parcours'] },
      });
    });

    it('should add competences filter when competences are set', () => {
      mockSearchParams.set('competences', 'javascript,react');
      
      const { result } = renderHook(() => useSearchFilters());
      
      const directusFilters = result.current.getDirectusFilters();
      
      expect(directusFilters).toEqual({
        status: { _eq: 'published' },
        main_competences: {
          competences_id: {
            id: { _in: ['javascript', 'react'] }
          }
        }
      });
    });

    it('should combine course type and competences filters', () => {
      mockSearchParams.set('courseType', 'formation');
      mockSearchParams.set('competences', 'javascript');
      
      const { result } = renderHook(() => useSearchFilters());
      
      const directusFilters = result.current.getDirectusFilters();
      
      expect(directusFilters).toEqual({
        status: { _eq: 'published' },
        course_type: { _in: ['formation'] },
        main_competences: {
          competences_id: {
            id: { _in: ['javascript'] }
          }
        }
      });
    });
  });

  describe('Setting Filters', () => {
    it('should update course type filters', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setFilters({
          competences: [],
          showBookmarked: false,
          courseType: ['formation'],
          hideCompleted: false,
        });
      });
      
      expect(result.current.filters.courseType).toEqual(['formation']);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update search query', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setSearch('test search');
      });
      
      expect(result.current.search).toBe('test search');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should preserve other filters when updating one type', () => {
      // Start with some filters
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setFilters({
          competences: ['javascript'],
          showBookmarked: true,
          courseType: [],
          hideCompleted: false,
        });
      });
      
      // Update only course type
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          courseType: ['formation'],
        });
      });
      
      expect(result.current.filters).toEqual({
        competences: ['javascript'],
        showBookmarked: true,
        courseType: ['formation'],
        hideCompleted: false,
      });
    });
  });

  describe('Removing Filters', () => {
    it('should remove specific course type filter', () => {
      // Start with multiple course types
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setFilters({
          competences: [],
          showBookmarked: false,
          courseType: ['formation', 'parcours'],
          hideCompleted: false,
        });
      });
      
      // Remove 'formation'
      act(() => {
        result.current.removeFilter('courseType', 'formation');
      });
      
      expect(result.current.filters.courseType).toEqual(['parcours']);
    });

    it('should remove specific competence filter', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setFilters({
          competences: ['javascript', 'react'],
          showBookmarked: false,
          courseType: [],
          hideCompleted: false,
        });
      });
      
      // Remove 'javascript'
      act(() => {
        result.current.removeFilter('competences', 'javascript');
      });
      
      expect(result.current.filters.competences).toEqual(['react']);
    });
  });

  describe('Clearing All Filters', () => {
    it('should clear all filters including course type', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      // Set some filters
      act(() => {
        result.current.setFilters({
          competences: ['javascript'],
          showBookmarked: true,
          courseType: ['formation', 'parcours'],
          hideCompleted: true,
        });
        result.current.setSearch('test');
      });
      
      // Clear all
      act(() => {
        result.current.clearAll();
      });
      
      expect(result.current.search).toBe('');
      expect(result.current.filters).toEqual({
        competences: [],
        showBookmarked: false,
        courseType: [],
        hideCompleted: false,
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('hasActiveFilters', () => {
    it('should be true when search is set', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setSearch('test');
      });
      
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should be true when course type filter is set', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setFilters({
          competences: [],
          showBookmarked: false,
          courseType: ['formation'],
          hideCompleted: false,
        });
      });
      
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should be true when showBookmarked is set', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setFilters({
          competences: [],
          showBookmarked: true,
          courseType: [],
          hideCompleted: false,
        });
      });
      
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should be true when hideCompleted is set', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      act(() => {
        result.current.setFilters({
          competences: [],
          showBookmarked: false,
          courseType: [],
          hideCompleted: true,
        });
      });
      
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should be false when no filters are active', () => {
      const { result } = renderHook(() => useSearchFilters());
      
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });
});