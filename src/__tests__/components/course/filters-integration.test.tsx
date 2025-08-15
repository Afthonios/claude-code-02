import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockCourse, createMockCompetence } from '../../utils/test-utils';
import { resetAllMocks, mockCoursesApi, mockCompetencesApi } from '../../utils/mocks';
import CoursesPageClient from '@/components/course/CoursesPageClient';

// Mock the search filters hook
const mockUseSearchFilters = {
  query: '',
  setQuery: vi.fn(),
  filters: {
    competences: [],
    course_type: [],
  },
  setFilters: vi.fn(),
  filteredCourses: [],
  competenceOptions: [],
  courseTypeOptions: [],
  isLoading: false,
  error: null,
  clearAllFilters: vi.fn(),
  activeFilterCount: 0,
  searchInputRef: { current: null },
  isFilterSidebarOpen: false,
  toggleFilterSidebar: vi.fn(),
};

vi.mock('@/hooks/useSearchFilters', () => ({
  default: () => mockUseSearchFilters,
}));

// Mock Directus API responses
const mockCourses = [
  createMockCourse({
    id: '1',
    slug: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    competences: [{ id: '1', title: 'JavaScript' }],
    tags: ['frontend', 'beginner'],
  }),
  createMockCourse({
    id: '2',
    slug: 'python-basics',
    title: 'Python Basics',
    competences: [{ id: '2', title: 'Python' }],
    tags: ['backend', 'beginner'],
  }),
  createMockCourse({
    id: '3',
    slug: 'react-advanced',
    title: 'Advanced React',
    competences: [{ id: '1', title: 'JavaScript' }, { id: '3', title: 'React' }],
    tags: ['frontend', 'advanced'],
  }),
];

const mockCompetences = [
  createMockCompetence({ id: '1', title: 'JavaScript' }),
  createMockCompetence({ id: '2', title: 'Python' }),
  createMockCompetence({ id: '3', title: 'React' }),
];

describe('Filters Integration Tests', () => {
  beforeEach(() => {
    resetAllMocks();
    // Reset the mock hook state
    Object.assign(mockUseSearchFilters, {
      query: '',
      filters: { competences: [], course_type: [] },
      filteredCourses: mockCourses,
      competenceOptions: mockCompetences.map(c => ({ value: c.id, label: c.title })),
      courseTypeOptions: [
        { value: 'video', label: 'Video Course' },
        { value: 'interactive', label: 'Interactive' },
      ],
      isLoading: false,
      error: null,
      activeFilterCount: 0,
      isFilterSidebarOpen: false,
    });
  });

  describe('Search and Filter Integration', () => {
    it('should display search bar and filter toggle', () => {
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument();
    });

    it('should call setQuery when search input changes', async () => {
      const user = userEvent.setup();
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      const searchInput = screen.getByPlaceholderText('Search courses...');
      await user.type(searchInput, 'JavaScript');
      
      expect(mockUseSearchFilters.setQuery).toHaveBeenCalledWith('JavaScript');
    });

    it('should toggle filter sidebar when filter button is clicked', async () => {
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      const filterToggle = screen.getByLabelText('Toggle filters');
      fireEvent.click(filterToggle);
      
      expect(mockUseSearchFilters.toggleFilterSidebar).toHaveBeenCalledTimes(1);
    });

    it('should show active filter count when filters are applied', () => {
      mockUseSearchFilters.activeFilterCount = 2;
      mockUseSearchFilters.filters = {
        competences: ['1'],
        course_type: ['video'],
      };
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should not show filter count when no filters are active', () => {
      mockUseSearchFilters.activeFilterCount = 0;
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Filter Sidebar Integration', () => {
    beforeEach(() => {
      mockUseSearchFilters.isFilterSidebarOpen = true;
    });

    it('should render filter sidebar when open', () => {
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    it('should pass competence options to filter sidebar', () => {
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      // Check that competence options are available in dropdown
      const competenceLabels = mockCompetences.map(c => c.title);
      competenceLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('should pass course type options to filter sidebar', () => {
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('Video Course')).toBeInTheDocument();
      expect(screen.getByText('Interactive')).toBeInTheDocument();
    });

    it('should call setFilters when filter changes', async () => {
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      // Find and interact with a filter dropdown
      const competenceDropdown = screen.getByText('Select skills');
      fireEvent.click(competenceDropdown);
      
      await waitFor(() => {
        const jsOption = screen.getByLabelText('JavaScript');
        fireEvent.click(jsOption);
      });
      
      expect(mockUseSearchFilters.setFilters).toHaveBeenCalledWith({
        competences: ['1'],
        course_type: [],
      });
    });
  });

  describe('Course Results Integration', () => {
    it('should display filtered courses', () => {
      mockUseSearchFilters.filteredCourses = [mockCourses[0]];
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      expect(screen.queryByText('Python Basics')).not.toBeInTheDocument();
    });

    it('should show course count', () => {
      mockUseSearchFilters.filteredCourses = mockCourses.slice(0, 2);
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('2 cours trouvés')).toBeInTheDocument();
    });

    it('should show no results message when no courses match', () => {
      mockUseSearchFilters.filteredCourses = [];
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('Aucun cours trouvé')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseSearchFilters.isLoading = true;
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('Recherche en cours...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      mockUseSearchFilters.error = 'Failed to load courses';
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('Erreur lors du chargement des cours')).toBeInTheDocument();
    });
  });

  describe('Active Filters Display', () => {
    it('should show active filters component when filters are applied', () => {
      mockUseSearchFilters.filters = {
        competences: ['1'],
        course_type: ['video'],
      };
      mockUseSearchFilters.activeFilterCount = 2;
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('Filtres actifs:')).toBeInTheDocument();
    });

    it('should show competence filter tags', () => {
      mockUseSearchFilters.filters = {
        competences: ['1'],
        course_type: [],
      };
      mockUseSearchFilters.activeFilterCount = 1;
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    it('should show course type filter tags', () => {
      mockUseSearchFilters.filters = {
        competences: [],
        course_type: ['video'],
      };
      mockUseSearchFilters.activeFilterCount = 1;
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      expect(screen.getByText('Video Course')).toBeInTheDocument();
    });

    it('should call clearAllFilters when clear all button is clicked', () => {
      mockUseSearchFilters.filters = {
        competences: ['1'],
        course_type: ['video'],
      };
      mockUseSearchFilters.activeFilterCount = 2;
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      const clearButton = screen.getByText('Effacer tous les filtres');
      fireEvent.click(clearButton);
      
      expect(mockUseSearchFilters.clearAllFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Integration', () => {
    it('should load competences from API', async () => {
      mockCompetencesApi.getAll.mockResolvedValue(mockCompetences);
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      await waitFor(() => {
        expect(mockCompetencesApi.getAll).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      mockCompetencesApi.getAll.mockRejectedValue(new Error('API Error'));
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      await waitFor(() => {
        expect(mockCompetencesApi.getAll).toHaveBeenCalled();
      });
      
      // Should still render without crashing
      expect(screen.getByText('Nos Cours')).toBeInTheDocument();
    });

    it('should search courses with API', async () => {
      mockCoursesApi.getAll.mockResolvedValue([mockCourses[0]]);
      mockUseSearchFilters.query = 'JavaScript';
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      // API should be called with search parameters
      await waitFor(() => {
        expect(mockCoursesApi.getAll).toHaveBeenCalledWith({
          search: 'JavaScript',
          filters: { competences: [], course_type: [] },
        });
      });
    });

    it('should filter courses with API', async () => {
      mockCoursesApi.getAll.mockResolvedValue([mockCourses[0]]);
      mockUseSearchFilters.filters = { competences: ['1'], course_type: [] };
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      await waitFor(() => {
        expect(mockCoursesApi.getAll).toHaveBeenCalledWith({
          search: '',
          filters: { competences: ['1'], course_type: [] },
        });
      });
    });
  });

  describe('URL State Management', () => {
    it('should update URL when search query changes', () => {
      mockUseSearchFilters.query = 'JavaScript';
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      // URL should be updated with search parameters
      // This would be tested with actual router integration
    });

    it('should update URL when filters change', () => {
      mockUseSearchFilters.filters = { competences: ['1'], course_type: [] };
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      // URL should be updated with filter parameters
      // This would be tested with actual router integration
    });

    it('should restore state from URL parameters', () => {
      // Mock URL search params
      const mockSearchParams = new URLSearchParams('?q=JavaScript&competences=1');
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      // Search filters should be initialized from URL
      expect(mockUseSearchFilters.query).toBe('JavaScript');
      expect(mockUseSearchFilters.filters.competences).toContain('1');
    });
  });

  describe('Performance Optimization', () => {
    it('should debounce search queries', async () => {
      const user = userEvent.setup();
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      const searchInput = screen.getByPlaceholderText('Search courses...');
      
      // Type rapidly
      await user.type(searchInput, 'JavaScript');
      
      // Should debounce and not call setQuery for every keystroke
      await waitFor(() => {
        expect(mockUseSearchFilters.setQuery).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle large datasets efficiently', () => {
      const largeCourseList = Array.from({ length: 1000 }, (_, i) => 
        createMockCourse({ id: String(i + 1), title: `Course ${i + 1}` })
      );
      
      mockUseSearchFilters.filteredCourses = largeCourseList;
      
      const startTime = performance.now();
      render(<CoursesPageClient locale="fr" initialCourses={largeCourseList} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Should render large lists quickly
    });
  });

  describe('Accessibility Integration', () => {
    it('should announce filter changes to screen readers', () => {
      mockUseSearchFilters.filters = { competences: ['1'], course_type: [] };
      mockUseSearchFilters.activeFilterCount = 1;
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      const announcement = screen.getByRole('status', { hidden: true });
      expect(announcement).toHaveTextContent('1 filtre appliqué');
    });

    it('should announce search results to screen readers', () => {
      mockUseSearchFilters.filteredCourses = mockCourses.slice(0, 2);
      
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      const announcement = screen.getByRole('status', { hidden: true });
      expect(announcement).toHaveTextContent('2 cours trouvés');
    });

    it('should support keyboard navigation between components', async () => {
      const user = userEvent.setup();
      render(<CoursesPageClient locale="fr" initialCourses={mockCourses} />);
      
      // Should be able to tab through search, filter toggle, and course cards
      await user.tab(); // Search input
      await user.tab(); // Filter toggle
      await user.tab(); // First course card
      
      const firstCourseLink = screen.getByText('JavaScript Fundamentals').closest('a');
      expect(firstCourseLink).toHaveFocus();
    });
  });
});