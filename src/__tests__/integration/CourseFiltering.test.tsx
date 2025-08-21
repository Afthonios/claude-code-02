import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../utils/test-utils';
import { resetAllMocks } from '../utils/mocks';
import CoursesPageClient from '@/components/course/CoursesPageClient';
import type { DirectusCourse } from '@/types/directus';

// Mock fetch for API calls
global.fetch = vi.fn();

const mockCourses: DirectusCourse[] = [
  {
    id: '1',
    legacy_id: 'formation-1',
    status: 'published',
    date_created: '2023-01-01',
    date_updated: '2023-01-01',
    duration: 60,
    course_type: 'formation',
    price_cents: 0,
    currency: 'EUR',
    translations: [
      {
        id: '1',
        courses_id: '1',
        languages_code: 'fr',
        title: 'Formation JavaScript',
        subtitle: 'Apprendre JavaScript',
        summary: 'Un cours sur JavaScript',
        description: 'Description complète',
        slug: 'formation-javascript',
      },
    ],
    competence: [],
    instructors: [],
  },
  {
    id: '2',
    legacy_id: 'formation-2',
    status: 'published',
    date_created: '2023-01-02',
    date_updated: '2023-01-02',
    duration: 90,
    course_type: 'formation',
    price_cents: 1999,
    currency: 'EUR',
    translations: [
      {
        id: '2',
        courses_id: '2',
        languages_code: 'fr',
        title: 'Formation React',
        subtitle: 'Apprendre React',
        summary: 'Un cours sur React',
        description: 'Description complète',
        slug: 'formation-react',
      },
    ],
    competence: [],
    instructors: [],
  },
  {
    id: '3',
    legacy_id: 'parcours-1',
    status: 'published',
    date_created: '2023-01-03',
    date_updated: '2023-01-03',
    duration: 120,
    course_type: 'parcours',
    price_cents: 4999,
    currency: 'EUR',
    translations: [
      {
        id: '3',
        courses_id: '3',
        languages_code: 'fr',
        title: 'Parcours Développeur Web',
        subtitle: 'Devenir développeur web',
        summary: 'Un parcours complet',
        description: 'Description complète',
        slug: 'parcours-dev-web',
      },
    ],
    competence: [],
    instructors: [],
  },
  {
    id: '4',
    legacy_id: 'parcours-2',
    status: 'published',
    date_created: '2023-01-04',
    date_updated: '2023-01-04',
    duration: 180,
    course_type: 'parcours',
    price_cents: 7999,
    currency: 'EUR',
    translations: [
      {
        id: '4',
        courses_id: '4',
        languages_code: 'fr',
        title: 'Parcours Data Science',
        subtitle: 'Devenir data scientist',
        summary: 'Un parcours data science',
        description: 'Description complète',
        slug: 'parcours-data-science',
      },
    ],
    competence: [],
    instructors: [],
  },
];

describe('Course Filtering Integration', () => {
  beforeEach(() => {
    resetAllMocks();
    vi.clearAllMocks();
    
    // Mock successful API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockCourses }),
    });
  });

  describe('Course Type Filtering', () => {
    it('should show all courses initially', async () => {
      render(
        <CoursesPageClient 
          locale="fr" 
          initialCourses={mockCourses}
        />
      );
      
      // Should show all courses
      await waitFor(() => {
        expect(screen.getByText('Formation JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Formation React')).toBeInTheDocument();
        expect(screen.getByText('Parcours Développeur Web')).toBeInTheDocument();
        expect(screen.getByText('Parcours Data Science')).toBeInTheDocument();
      });
      
      // Check course counts
      expect(screen.getByText('4 formation(s) trouvée(s)')).toBeInTheDocument();
    });

    it('should filter by Formation type', async () => {
      render(
        <CoursesPageClient 
          locale="fr" 
          initialCourses={mockCourses}
        />
      );
      
      // Open filter sidebar (if needed on mobile)
      const filterButton = screen.queryByText('Filtres');
      if (filterButton) {
        fireEvent.click(filterButton);
      }
      
      // Find and click Formation checkbox
      const formationCheckbox = screen.getByLabelText(/formation/i);
      fireEvent.click(formationCheckbox);
      
      // Wait for filtering to complete
      await waitFor(() => {
        // Should only show formation courses
        expect(screen.getByText('Formation JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Formation React')).toBeInTheDocument();
        
        // Should not show parcours courses
        expect(screen.queryByText('Parcours Développeur Web')).not.toBeInTheDocument();
        expect(screen.queryByText('Parcours Data Science')).not.toBeInTheDocument();
      });
      
      // Check updated course count
      expect(screen.getByText('2 formation(s) trouvée(s)')).toBeInTheDocument();
    });

    it('should filter by Parcours type', async () => {
      render(
        <CoursesPageClient 
          locale="fr" 
          initialCourses={mockCourses}
        />
      );
      
      // Open filter sidebar
      const filterButton = screen.queryByText('Filtres');
      if (filterButton) {
        fireEvent.click(filterButton);
      }
      
      // Find and click Parcours checkbox
      const parcoursCheckbox = screen.getByLabelText(/parcours/i);
      fireEvent.click(parcoursCheckbox);
      
      // Wait for filtering
      await waitFor(() => {
        // Should only show parcours courses
        expect(screen.getByText('Parcours Développeur Web')).toBeInTheDocument();
        expect(screen.getByText('Parcours Data Science')).toBeInTheDocument();
        
        // Should not show formation courses
        expect(screen.queryByText('Formation JavaScript')).not.toBeInTheDocument();
        expect(screen.queryByText('Formation React')).not.toBeInTheDocument();
      });
      
      // Check updated course count
      expect(screen.getByText('2 formation(s) trouvée(s)')).toBeInTheDocument();
    });

    it('should show both types when both are selected', async () => {
      render(
        <CoursesPageClient 
          locale="fr" 
          initialCourses={mockCourses}
        />
      );
      
      // Open filter sidebar
      const filterButton = screen.queryByText('Filtres');
      if (filterButton) {
        fireEvent.click(filterButton);
      }
      
      // Select both Formation and Parcours
      const formationCheckbox = screen.getByLabelText(/formation/i);
      const parcoursCheckbox = screen.getByLabelText(/parcours/i);
      
      fireEvent.click(formationCheckbox);
      fireEvent.click(parcoursCheckbox);
      
      // Wait for filtering
      await waitFor(() => {
        // Should show all courses again
        expect(screen.getByText('Formation JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Formation React')).toBeInTheDocument();
        expect(screen.getByText('Parcours Développeur Web')).toBeInTheDocument();
        expect(screen.getByText('Parcours Data Science')).toBeInTheDocument();
      });
      
      // Check course count returns to full
      expect(screen.getByText('4 formation(s) trouvée(s)')).toBeInTheDocument();
    });

    it('should clear course type filters when clear all is clicked', async () => {
      render(
        <CoursesPageClient 
          locale="fr" 
          initialCourses={mockCourses}
        />
      );
      
      // Open filter sidebar
      const filterButton = screen.queryByText('Filtres');
      if (filterButton) {
        fireEvent.click(filterButton);
      }
      
      // Select Formation
      const formationCheckbox = screen.getByLabelText(/formation/i);
      fireEvent.click(formationCheckbox);
      
      // Wait for filter to be applied
      await waitFor(() => {
        expect(screen.getByText('2 formation(s) trouvée(s)')).toBeInTheDocument();
      });
      
      // Clear all filters
      const clearAllButton = screen.getByText('Effacer tous les filtres');
      fireEvent.click(clearAllButton);
      
      // Wait for filters to be cleared
      await waitFor(() => {
        expect(screen.getByText('4 formation(s) trouvée(s)')).toBeInTheDocument();
      });
      
      // All courses should be visible again
      expect(screen.getByText('Formation JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Formation React')).toBeInTheDocument();
      expect(screen.getByText('Parcours Développeur Web')).toBeInTheDocument();
      expect(screen.getByText('Parcours Data Science')).toBeInTheDocument();
    });
  });

  describe('Course Type Counts', () => {
    it('should display correct counts in filter sidebar', async () => {
      render(
        <CoursesPageClient 
          locale="fr" 
          initialCourses={mockCourses}
        />
      );
      
      // Open filter sidebar
      const filterButton = screen.queryByText('Filtres');
      if (filterButton) {
        fireEvent.click(filterButton);
      }
      
      // Check Formation count (2 formation courses in mock data)
      expect(screen.getByText('(2)')).toBeInTheDocument();
      
      // Check Parcours count (2 parcours courses in mock data) 
      const countElements = screen.getAllByText('(2)');
      expect(countElements).toHaveLength(2); // One for Formation, one for Parcours
    });
  });

  describe('API Integration', () => {
    it('should send correct Directus filters for course type', async () => {
      render(
        <CoursesPageClient 
          locale="fr" 
          initialCourses={mockCourses}
        />
      );
      
      // Open filter sidebar
      const filterButton = screen.queryByText('Filtres');
      if (filterButton) {
        fireEvent.click(filterButton);
      }
      
      // Select Formation
      const formationCheckbox = screen.getByLabelText(/formation/i);
      fireEvent.click(formationCheckbox);
      
      // Wait for API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      // Check that the API was called with correct parameters
      const fetchCalls = (global.fetch as any).mock.calls;
      const lastCall = fetchCalls[fetchCalls.length - 1];
      const apiUrl = lastCall[0];
      
      // Should contain course_type filter
      expect(apiUrl).toContain('filter[course_type][_in]=formation');
    });

    it('should handle API fallback to mock data', async () => {
      // Mock API failure
      (global.fetch as any).mockRejectedValue(new Error('API Error'));
      
      render(
        <CoursesPageClient 
          locale="fr" 
          initialCourses={mockCourses}
        />
      );
      
      // Should still show courses from initialCourses
      await waitFor(() => {
        expect(screen.getByText('Formation JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Parcours Développeur Web')).toBeInTheDocument();
      });
      
      // Filtering should still work with client-side fallback
      const filterButton = screen.queryByText('Filtres');
      if (filterButton) {
        fireEvent.click(filterButton);
      }
      
      const formationCheckbox = screen.getByLabelText(/formation/i);
      fireEvent.click(formationCheckbox);
      
      await waitFor(() => {
        expect(screen.getByText('Formation JavaScript')).toBeInTheDocument();
        expect(screen.queryByText('Parcours Développeur Web')).not.toBeInTheDocument();
      });
    });
  });
});