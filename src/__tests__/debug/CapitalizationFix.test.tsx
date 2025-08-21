import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchFilters } from '@/hooks/useSearchFilters';

// Mock Next.js hooks
import { vi } from 'vitest';
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

describe('Capitalization Fix Verification', () => {
  it('should generate Directus filters with capitalized course types', () => {
    const { result } = renderHook(() => useSearchFilters());
    
    // Set filters with capitalized values (as they appear in Directus)
    result.current.setFilters({
      competences: [],
      showBookmarked: false,
      courseType: ['Formation', 'Parcours'],
      hideCompleted: false,
    });
    
    const directusFilters = result.current.getDirectusFilters();
    
    expect(directusFilters).toEqual({
      status: { _eq: 'published' },
      course_type: { _in: ['Formation', 'Parcours'] },
    });
  });

  it('should handle single Formation filter', () => {
    const { result } = renderHook(() => useSearchFilters());
    
    result.current.setFilters({
      competences: [],
      showBookmarked: false,
      courseType: ['Formation'],
      hideCompleted: false,
    });
    
    const directusFilters = result.current.getDirectusFilters();
    
    expect(directusFilters).toEqual({
      status: { _eq: 'published' },
      course_type: { _in: ['Formation'] },
    });
  });

  it('should handle single Parcours filter', () => {
    const { result } = renderHook(() => useSearchFilters());
    
    result.current.setFilters({
      competences: [],
      showBookmarked: false,
      courseType: ['Parcours'],
      hideCompleted: false,
    });
    
    const directusFilters = result.current.getDirectusFilters();
    
    expect(directusFilters).toEqual({
      status: { _eq: 'published' },
      course_type: { _in: ['Parcours'] },
    });
  });
});