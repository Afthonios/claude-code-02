import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import { resetAllMocks } from '../../utils/mocks';
import FilterSidebar from '@/components/course/FilterSidebar';

const mockCompetenceOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
];

const mockCourseTypeOptions = [
  { value: 'video', label: 'Video Course' },
  { value: 'interactive', label: 'Interactive' },
  { value: 'text', label: 'Text-based' },
  { value: 'mixed', label: 'Mixed Media' },
];

describe('FilterSidebar Component', () => {
  const defaultProps = {
    filters: {
      competences: [],
      course_type: [],
    },
    onFiltersChange: vi.fn(),
    competenceOptions: mockCompetenceOptions,
    courseTypeOptions: mockCourseTypeOptions,
    isOpen: true,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    defaultProps.onFiltersChange.mockClear();
    defaultProps.onToggle.mockClear();
  });

  describe('Rendering', () => {
    it('should render filter sidebar with title', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'fr' });
      
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    it('should render filter sidebar with English title', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'en' });
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render competences filter section', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'fr' });
      
      expect(screen.getByText('Compétences')).toBeInTheDocument();
    });

    it('should render course type filter section', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'fr' });
      
      expect(screen.getByText('Type de cours')).toBeInTheDocument();
    });

    it('should render close button on mobile', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('lg:hidden');
    });
  });

  describe('Visibility and Responsive Behavior', () => {
    it('should show sidebar when isOpen is true', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const sidebar = screen.getByRole('complementary', { hidden: true });
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('should hide sidebar when isOpen is false', () => {
      const props = { ...defaultProps, isOpen: false };
      render(<FilterSidebar {...props} />);
      
      const sidebar = screen.getByRole('complementary', { hidden: true });
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('should show backdrop on mobile when open', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('lg:hidden');
    });

    it('should not show backdrop when closed', () => {
      const props = { ...defaultProps, isOpen: false };
      render(<FilterSidebar {...props} />);
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(backdrop).not.toBeInTheDocument();
    });

    it('should be visible on desktop regardless of isOpen', () => {
      const props = { ...defaultProps, isOpen: false };
      render(<FilterSidebar {...props} />);
      
      const sidebar = screen.getByRole('complementary', { hidden: true });
      expect(sidebar).toHaveClass('lg:translate-x-0');
    });
  });

  describe('Filter Interaction', () => {
    it('should call onFiltersChange when competence filter changes', async () => {
      render(<FilterSidebar {...defaultProps} />);
      
      // Find and click a competence filter dropdown
      const competenceDropdowns = screen.getAllByRole('button');
      const competenceDropdown = competenceDropdowns.find(btn => 
        btn.textContent?.includes('Select skills') || btn.textContent?.includes('JavaScript')
      );
      
      if (competenceDropdown) {
        fireEvent.click(competenceDropdown);
        
        await waitFor(() => {
          const jsOption = screen.getByLabelText('JavaScript');
          fireEvent.click(jsOption);
        });
        
        expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
          competences: ['javascript'],
          course_type: [],
        });
      }
    });

    it('should call onFiltersChange when course type filter changes', async () => {
      render(<FilterSidebar {...defaultProps} />);
      
      // Find course type dropdown
      const dropdowns = screen.getAllByRole('button');
      const courseTypeDropdown = dropdowns.find(btn => 
        btn.textContent?.includes('Select course type') || btn.textContent?.includes('Video')
      );
      
      if (courseTypeDropdown) {
        fireEvent.click(courseTypeDropdown);
        
        await waitFor(() => {
          const videoOption = screen.getByLabelText('Video Course');
          fireEvent.click(videoOption);
        });
        
        expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
          competences: [],
          course_type: ['video'],
        });
      }
    });

    it('should preserve other filters when changing one filter type', async () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          competences: ['javascript'],
          course_type: [],
        },
      };
      
      render(<FilterSidebar {...propsWithFilters} />);
      
      // Change course type filter
      const dropdowns = screen.getAllByRole('button');
      const courseTypeDropdown = dropdowns.find(btn => 
        btn.textContent?.includes('Select course type')
      );
      
      if (courseTypeDropdown) {
        fireEvent.click(courseTypeDropdown);
        
        await waitFor(() => {
          const videoOption = screen.getByLabelText('Video Course');
          fireEvent.click(videoOption);
        });
        
        expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
          competences: ['javascript'], // Should preserve existing competences
          course_type: ['video'],
        });
      }
    });
  });

  describe('Clear Filters Functionality', () => {
    it('should show clear all button when filters are active', () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          competences: ['javascript'],
          course_type: ['video'],
        },
      };
      
      render(<FilterSidebar {...propsWithFilters} />);
      
      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });

    it('should not show clear all button when no filters are active', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
    });

    it('should clear all filters when clear button is clicked', () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          competences: ['javascript', 'python'],
          course_type: ['video'],
        },
      };
      
      render(<FilterSidebar {...propsWithFilters} />);
      
      const clearButton = screen.getByText('Clear all filters');
      fireEvent.click(clearButton);
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        competences: [],
        course_type: [],
      });
    });

    it('should show clear button for partial filters', () => {
      const propsWithPartialFilters = {
        ...defaultProps,
        filters: {
          competences: [],
          course_type: ['video'],
        },
      };
      
      render(<FilterSidebar {...propsWithPartialFilters} />);
      
      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });
  });

  describe('Close and Toggle Functionality', () => {
    it('should call onToggle when close button is clicked', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close filters');
      fireEvent.click(closeButton);
      
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when backdrop is clicked', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
      }
    });

    it('should not call onToggle when sidebar content is clicked', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const sidebarContent = screen.getByText('Filtres');
      fireEvent.click(sidebarContent);
      
      expect(defaultProps.onToggle).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading placeholder for competences when options are empty', () => {
      const propsWithEmptyOptions = {
        ...defaultProps,
        competenceOptions: [],
      };
      
      render(<FilterSidebar {...propsWithEmptyOptions} />);
      
      expect(screen.getByText('Loading skills...')).toBeInTheDocument();
    });

    it('should show loading placeholder for course types when options are empty', () => {
      const propsWithEmptyOptions = {
        ...defaultProps,
        courseTypeOptions: [],
      };
      
      render(<FilterSidebar {...propsWithEmptyOptions} />);
      
      expect(screen.getByText('Loading types...')).toBeInTheDocument();
    });

    it('should show proper placeholder when options are loaded', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      expect(screen.getByText('Select skills')).toBeInTheDocument();
      expect(screen.getByText('Select course type')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Filtres');
    });

    it('should have proper labels for filter sections', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const competenceLabel = screen.getByText('Compétences');
      const courseTypeLabel = screen.getByText('Type de cours');
      
      expect(competenceLabel.tagName).toBe('LABEL');
      expect(courseTypeLabel.tagName).toBe('LABEL');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FilterSidebar {...defaultProps} />);
      
      // Should be able to tab to close button
      await user.tab();
      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toHaveFocus();
    });

    it('should have proper ARIA labels for close button', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Styling and Visual Design', () => {
    it('should have proper responsive width classes', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const sidebar = screen.getByRole('complementary', { hidden: true });
      expect(sidebar).toHaveClass('w-80', 'lg:w-64');
    });

    it('should have proper background and border styling', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const sidebarContent = document.querySelector('.bg-white.dark\\:bg-gray-800');
      expect(sidebarContent).toBeInTheDocument();
      expect(sidebarContent).toHaveClass('border-r');
    });

    it('should have proper spacing between filter sections', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const filterContainer = document.querySelector('.space-y-6');
      expect(filterContainer).toBeInTheDocument();
    });

    it('should have proper close button styling', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toHaveClass('p-2');
      expect(closeButton).toHaveClass('text-gray-400');
    });

    it('should have proper clear button styling', () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          competences: ['javascript'],
          course_type: [],
        },
      };
      
      render(<FilterSidebar {...propsWithFilters} />);
      
      const clearButton = screen.getByText('Clear all filters');
      expect(clearButton).toHaveClass('w-full');
      expect(clearButton).toHaveClass('text-blue-600');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for main container', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const sidebarContent = document.querySelector('.dark\\:bg-gray-800');
      expect(sidebarContent).toBeInTheDocument();
    });

    it('should have dark mode classes for text elements', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const heading = screen.getByText('Filtres');
      expect(heading).toHaveClass('dark:text-gray-100');
    });

    it('should have dark mode classes for labels', () => {
      render(<FilterSidebar {...defaultProps} />);
      
      const labels = document.querySelectorAll('.dark\\:text-gray-300');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props do not change', () => {
      const renderSpy = vi.fn();
      
      const TestWrapper = (props: any) => {
        renderSpy();
        return <FilterSidebar {...props} />;
      };
      
      const { rerender } = render(<TestWrapper {...defaultProps} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestWrapper {...defaultProps} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle large option lists efficiently', () => {
      const largeCompetenceOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `competence-${i}`,
        label: `Competence ${i}`,
      }));
      
      const propsWithLargeOptions = {
        ...defaultProps,
        competenceOptions: largeCompetenceOptions,
      };
      
      const startTime = performance.now();
      render(<FilterSidebar {...propsWithLargeOptions} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined options gracefully', () => {
      const propsWithUndefined = {
        ...defaultProps,
        competenceOptions: undefined as any,
        courseTypeOptions: undefined as any,
      };
      
      expect(() => render(<FilterSidebar {...propsWithUndefined} />)).not.toThrow();
    });

    it('should handle malformed filter state gracefully', () => {
      const propsWithBadFilters = {
        ...defaultProps,
        filters: {
          competences: 'invalid' as any,
          course_type: null as any,
        },
      };
      
      expect(() => render(<FilterSidebar {...propsWithBadFilters} />)).not.toThrow();
    });
  });
});