import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../utils/test-utils';
import { resetAllMocks } from '../../utils/mocks';
import FilterSidebar from '@/components/course/FilterSidebar';

describe('Course Type Filtering', () => {
  const mockOnFiltersChange = vi.fn();
  
  const defaultProps = {
    filters: {
      competences: [],
      showBookmarked: false,
      courseType: [],
      hideCompleted: false,
    },
    onFiltersChange: mockOnFiltersChange,
    competenceOptions: [],
    isOpen: true,
    onToggle: vi.fn(),
    isPaidUser: false,
    courseTypeCounts: { formation: 3, parcours: 2 },
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnFiltersChange.mockClear();
  });

  describe('Course Type Filter Rendering', () => {
    it('should render Formation and Parcours checkboxes with counts', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'fr' });
      
      // Check that Formation option is rendered with count
      const formationCheckbox = screen.getByLabelText(/formation/i);
      expect(formationCheckbox).toBeInTheDocument();
      expect(formationCheckbox).toHaveAttribute('type', 'checkbox');
      
      // Check that Parcours option is rendered with count
      const parcoursCheckbox = screen.getByLabelText(/parcours/i);
      expect(parcoursCheckbox).toBeInTheDocument();
      expect(parcoursCheckbox).toHaveAttribute('type', 'checkbox');
      
      // Check counts are displayed
      expect(screen.getByText('(3)')).toBeInTheDocument(); // Formation count
      expect(screen.getByText('(2)')).toBeInTheDocument(); // Parcours count
    });

    it('should render course type section header', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'fr' });
      
      expect(screen.getByText('Type de formation')).toBeInTheDocument();
    });

    it('should render in English', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'en' });
      
      expect(screen.getByText('Course Type')).toBeInTheDocument();
      expect(screen.getByLabelText(/Course/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Learning Path/i)).toBeInTheDocument();
    });
  });

  describe('Course Type Filter Interaction', () => {
    it('should call onFiltersChange when Formation is checked', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'fr' });
      
      const formationCheckbox = screen.getByLabelText(/formation/i);
      fireEvent.click(formationCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        competences: [],
        showBookmarked: false,
        courseType: ['formation'],
        hideCompleted: false,
      });
    });

    it('should call onFiltersChange when Parcours is checked', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'fr' });
      
      const parcoursCheckbox = screen.getByLabelText(/parcours/i);
      fireEvent.click(parcoursCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        competences: [],
        showBookmarked: false,
        courseType: ['parcours'],
        hideCompleted: false,
      });
    });

    it('should allow both Formation and Parcours to be selected', () => {
      render(<FilterSidebar {...defaultProps} />, { locale: 'fr' });
      
      const formationCheckbox = screen.getByLabelText(/formation/i);
      const parcoursCheckbox = screen.getByLabelText(/parcours/i);
      
      // Check Formation first
      fireEvent.click(formationCheckbox);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        competences: [],
        showBookmarked: false,
        courseType: ['formation'],
        hideCompleted: false,
      });
      
      // Update props to simulate state change
      const propsWithFormation = {
        ...defaultProps,
        filters: {
          ...defaultProps.filters,
          courseType: ['formation'],
        },
      };
      
      // Re-render with updated props
      const { rerender } = render(<FilterSidebar {...propsWithFormation} />, { locale: 'fr' });
      
      // Now check Parcours (should add to existing selection)
      const updatedParcoursCheckbox = screen.getByLabelText(/parcours/i);
      fireEvent.click(updatedParcoursCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        competences: [],
        showBookmarked: false,
        courseType: ['formation', 'parcours'],
        hideCompleted: false,
      });
    });

    it('should uncheck Formation when clicked again', () => {
      const propsWithFormation = {
        ...defaultProps,
        filters: {
          ...defaultProps.filters,
          courseType: ['formation'],
        },
      };
      
      render(<FilterSidebar {...propsWithFormation} />, { locale: 'fr' });
      
      const formationCheckbox = screen.getByLabelText(/formation/i);
      expect(formationCheckbox).toBeChecked();
      
      // Uncheck Formation
      fireEvent.click(formationCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        competences: [],
        showBookmarked: false,
        courseType: [],
        hideCompleted: false,
      });
    });

    it('should preserve other filters when course type changes', () => {
      const propsWithOtherFilters = {
        ...defaultProps,
        filters: {
          competences: ['javascript'],
          showBookmarked: true,
          courseType: [],
          hideCompleted: false,
        },
      };
      
      render(<FilterSidebar {...propsWithOtherFilters} />, { locale: 'fr' });
      
      const formationCheckbox = screen.getByLabelText(/formation/i);
      fireEvent.click(formationCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        competences: ['javascript'], // Should preserve
        showBookmarked: true, // Should preserve
        courseType: ['formation'], // Should add
        hideCompleted: false,
      });
    });
  });

  describe('Course Type Filter State', () => {
    it('should show Formation as checked when in filters', () => {
      const propsWithFormation = {
        ...defaultProps,
        filters: {
          ...defaultProps.filters,
          courseType: ['formation'],
        },
      };
      
      render(<FilterSidebar {...propsWithFormation} />, { locale: 'fr' });
      
      const formationCheckbox = screen.getByLabelText(/formation/i);
      expect(formationCheckbox).toBeChecked();
      
      const parcoursCheckbox = screen.getByLabelText(/parcours/i);
      expect(parcoursCheckbox).not.toBeChecked();
    });

    it('should show both as checked when both are selected', () => {
      const propsWithBoth = {
        ...defaultProps,
        filters: {
          ...defaultProps.filters,
          courseType: ['formation', 'parcours'],
        },
      };
      
      render(<FilterSidebar {...propsWithBoth} />, { locale: 'fr' });
      
      const formationCheckbox = screen.getByLabelText(/formation/i);
      const parcoursCheckbox = screen.getByLabelText(/parcours/i);
      
      expect(formationCheckbox).toBeChecked();
      expect(parcoursCheckbox).toBeChecked();
    });
  });

  describe('Clear Filters Integration', () => {
    it('should include course type filters in clear all functionality', () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          competences: [],
          showBookmarked: false,
          courseType: ['formation', 'parcours'],
          hideCompleted: false,
        },
      };
      
      render(<FilterSidebar {...propsWithFilters} />, { locale: 'fr' });
      
      const clearButton = screen.getByText('Effacer tous les filtres');
      fireEvent.click(clearButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        competences: [],
        showBookmarked: false,
        courseType: [], // Should be cleared
        hideCompleted: false,
      });
    });
  });
});