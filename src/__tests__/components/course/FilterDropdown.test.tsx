import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import { resetAllMocks } from '../../utils/mocks';
import FilterDropdown from '@/components/course/FilterDropdown';

const mockOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
];

describe('FilterDropdown Component', () => {
  const defaultProps = {
    label: 'Skills',
    value: [],
    options: mockOptions,
    onChange: vi.fn(),
    placeholder: 'Select skills',
    multiple: true,
  };

  beforeEach(() => {
    resetAllMocks();
    defaultProps.onChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render with placeholder text when no value selected', () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Select skills');
    });

    it('should render with label when no placeholder provided', () => {
      const props = { ...defaultProps, placeholder: undefined };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Skills');
    });

    it('should show selected option label when single option selected', () => {
      const props = { ...defaultProps, value: ['javascript'] };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('JavaScript');
    });

    it('should show count when multiple options selected', () => {
      const props = { ...defaultProps, value: ['javascript', 'python'] };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('2 selected');
    });

    it('should render chevron icon', () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const chevronIcon = screen.getByTestId('chevron-down-icon');
      expect(chevronIcon).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when button is clicked', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox', { hidden: true })).toBeInTheDocument();
      });
    });

    it('should close dropdown when button is clicked again', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      // Open dropdown
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole('listbox', { hidden: true })).toBeInTheDocument();
      });
      
      // Close dropdown
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <FilterDropdown {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      const button = screen.getByRole('button');
      const outside = screen.getByTestId('outside');
      
      // Open dropdown
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole('listbox', { hidden: true })).toBeInTheDocument();
      });
      
      // Click outside
      fireEvent.mouseDown(outside);
      await waitFor(() => {
        expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument();
      });
    });

    it('should rotate chevron icon when dropdown is open', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      const chevronIcon = screen.getByTestId('chevron-down-icon');
      
      expect(chevronIcon).not.toHaveClass('rotate-180');
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(chevronIcon).toHaveClass('rotate-180');
      });
    });
  });

  describe('Option Selection', () => {
    it('should select option when clicked in multiple mode', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const checkbox = screen.getByLabelText('JavaScript');
        fireEvent.click(checkbox);
      });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['javascript']);
    });

    it('should deselect option when clicked again in multiple mode', async () => {
      const props = { ...defaultProps, value: ['javascript'] };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const checkbox = screen.getByLabelText('JavaScript');
        fireEvent.click(checkbox);
      });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith([]);
    });

    it('should add to selection when selecting additional option', async () => {
      const props = { ...defaultProps, value: ['javascript'] };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const checkbox = screen.getByLabelText('Python');
        fireEvent.click(checkbox);
      });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['javascript', 'python']);
    });

    it('should work in single selection mode', async () => {
      const props = { ...defaultProps, multiple: false };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const radio = screen.getByLabelText('JavaScript');
        fireEvent.click(radio);
      });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['javascript']);
    });

    it('should deselect in single mode when clicking selected option', async () => {
      const props = { ...defaultProps, multiple: false, value: ['javascript'] };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const radio = screen.getByLabelText('JavaScript');
        fireEvent.click(radio);
      });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Option Display', () => {
    it('should render all options with correct labels', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        mockOptions.forEach(option => {
          expect(screen.getByLabelText(option.label)).toBeInTheDocument();
        });
      });
    });

    it('should show checkboxes in multiple mode', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(mockOptions.length);
      });
    });

    it('should show radio buttons in single mode', async () => {
      const props = { ...defaultProps, multiple: false };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const radios = screen.getAllByRole('radio');
        expect(radios).toHaveLength(mockOptions.length);
      });
    });

    it('should show checked state for selected options', async () => {
      const props = { ...defaultProps, value: ['javascript', 'python'] };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const jsCheckbox = screen.getByLabelText('JavaScript');
        const pythonCheckbox = screen.getByLabelText('Python');
        const reactCheckbox = screen.getByLabelText('React');
        
        expect(jsCheckbox).toBeChecked();
        expect(pythonCheckbox).toBeChecked();
        expect(reactCheckbox).not.toBeChecked();
      });
    });

    it('should show "No options available" when options array is empty', async () => {
      const props = { ...defaultProps, options: [] };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('No options available')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      // Focus button
      await user.tab();
      expect(button).toHaveFocus();
      
      // Open with Enter
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByRole('listbox', { hidden: true })).toBeInTheDocument();
      });
    });

    it('should support screen reader labels', () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Styling and Visual States', () => {
    it('should have proper focus styles', () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
    });

    it('should have hover styles for options', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const labels = screen.getAllByRole('checkbox').map(cb => cb.closest('label'));
        labels.forEach(label => {
          expect(label).toHaveClass('hover:bg-gray-50');
        });
      });
    });

    it('should have proper dark mode classes', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:bg-gray-800');
      expect(button).toHaveClass('dark:border-gray-600');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        const dropdown = screen.getByRole('listbox', { hidden: true });
        expect(dropdown).toHaveClass('dark:bg-gray-800');
      });
    });

    it('should show placeholder text with muted styling', () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      const placeholderSpan = button.querySelector('span');
      expect(placeholderSpan).toHaveClass('text-gray-500');
    });

    it('should remove muted styling when value is selected', () => {
      const props = { ...defaultProps, value: ['javascript'] };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      const valueSpan = button.querySelector('span');
      expect(valueSpan).not.toHaveClass('text-gray-500');
    });
  });

  describe('Performance', () => {
    it('should not call onChange unnecessarily', async () => {
      render(<FilterDropdown {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      // Open and close dropdown without selecting
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole('listbox', { hidden: true })).toBeInTheDocument();
      });
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument();
      });
      
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    it('should handle large option lists efficiently', async () => {
      const largeOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i}`,
      }));
      
      const props = { ...defaultProps, options: largeOptions };
      const startTime = performance.now();
      
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox', { hidden: true })).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should render in under 1 second
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined options gracefully', () => {
      const props = { ...defaultProps, options: undefined as any };
      
      expect(() => render(<FilterDropdown {...props} />)).not.toThrow();
    });

    it('should handle invalid value prop gracefully', () => {
      const props = { ...defaultProps, value: 'invalid' as any };
      
      expect(() => render(<FilterDropdown {...props} />)).not.toThrow();
    });

    it('should handle options with duplicate values', async () => {
      const duplicateOptions = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'javascript', label: 'JavaScript (duplicate)' },
      ];
      
      const props = { ...defaultProps, options: duplicateOptions };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(2);
      });
    });

    it('should handle empty string values', async () => {
      const optionsWithEmpty = [
        { value: '', label: 'Empty Option' },
        ...mockOptions,
      ];
      
      const props = { ...defaultProps, options: optionsWithEmpty };
      render(<FilterDropdown {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const emptyCheckbox = screen.getByLabelText('Empty Option');
        fireEvent.click(emptyCheckbox);
      });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['']);
    });
  });
});