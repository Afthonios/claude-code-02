import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import { resetAllMocks } from '../../utils/mocks';
import SearchOverlay from '@/components/layout/SearchOverlay';

// Mock next/navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ locale: 'fr' }),
  usePathname: () => '/fr',
}));

// Mock directus utility
vi.mock('@/lib/directus', () => ({
  getCoursesListUrl: vi.fn((locale: string) => `/${locale}/cours`),
}));

describe('SearchOverlay Component', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    resetAllMocks();
    mockPush.mockClear();
    mockOnClose.mockClear();
  });

  describe('Rendering and Visibility', () => {
    it('should render when isOpen is true', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('aria-modal', 'true');
    });

    it('should not render when isOpen is false', () => {
      render(<SearchOverlay isOpen={false} onClose={mockOnClose} />);
      
      const overlay = screen.queryByRole('dialog');
      expect(overlay).not.toBeInTheDocument();
    });

    it('should have correct backdrop styling when open', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
      expect(overlay).toHaveClass('bg-black/60', 'backdrop-blur-sm');
    });

    it('should have proper centering and layout classes', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('Search Input', () => {
    it('should render search input with correct placeholder', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Rechercher des formations...');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should focus input when overlay opens', async () => {
      const { rerender } = render(<SearchOverlay isOpen={false} onClose={mockOnClose} />);
      
      rerender(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
      });
    });

    it('should accept text input', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'javascript');
      
      expect(input).toHaveValue('javascript');
    });

    it('should have proper input styling', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex-1', 'py-5', 'pr-4', 'text-lg');
      expect(input).toHaveClass('bg-transparent', 'border-0', 'outline-none');
    });
  });

  describe('Search Icon', () => {
    it('should render search icon', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const searchIcon = screen.getByRole('dialog').querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveClass('h-6', 'w-6', 'text-gray-400');
    });
  });

  describe('Close Button', () => {
    it('should render close button with correct accessibility', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: 'Close search' });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Close search');
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: 'Close search' });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have proper close button styling', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: 'Close search' });
      expect(closeButton).toHaveClass('mr-4', 'p-2', 'rounded-lg');
      expect(closeButton).toHaveClass('text-gray-400', 'hover:text-gray-600');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close overlay when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should submit search when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'javascript{enter}');
      
      expect(mockPush).toHaveBeenCalledWith('/fr/cours?search=javascript');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not submit search when Enter is pressed with empty input', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{enter}');
      
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should trim whitespace from search query', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '  javascript  {enter}');
      
      expect(mockPush).toHaveBeenCalledWith('/fr/cours?search=javascript');
    });
  });

  describe('Backdrop Interaction', () => {
    it('should close overlay when clicking outside the search box', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const overlay = screen.getByRole('dialog');
      await user.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside the search box', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('should navigate to courses page with search query', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'react');
      
      const form = screen.getByRole('textbox').closest('form');
      fireEvent.submit(form!);
      
      expect(mockPush).toHaveBeenCalledWith('/fr/cours?search=react');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should encode special characters in search query', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'c++ & java');
      
      const form = screen.getByRole('textbox').closest('form');
      fireEvent.submit(form!);
      
      expect(mockPush).toHaveBeenCalledWith('/fr/cours?search=c%2B%2B%20%26%20java');
    });

    it('should use correct locale-based URL', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />, { locale: 'en' });
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      const form = screen.getByRole('textbox').closest('form');
      fireEvent.submit(form!);
      
      // Should use English courses URL
      expect(mockPush).toHaveBeenCalledWith('/en/cours?search=test');
    });
  });

  describe('State Management', () => {
    it('should clear search value when overlay closes', () => {
      const { rerender } = render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(input).toHaveValue('test');
      
      rerender(<SearchOverlay isOpen={false} onClose={mockOnClose} />);
      rerender(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const newInput = screen.getByRole('textbox');
      expect(newInput).toHaveValue('');
    });

    it('should prevent body scroll when overlay is open', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when overlay closes', () => {
      const { rerender } = render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      rerender(<SearchOverlay isOpen={false} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Animations and Transitions', () => {
    it('should have proper animation classes when open', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('transition-all', 'duration-300', 'ease-out');
      expect(overlay).toHaveClass('opacity-100');
      expect(overlay).not.toHaveClass('pointer-events-none');
    });

    it('should have proper classes when closed', () => {
      render(<SearchOverlay isOpen={false} onClose={mockOnClose} />);
      
      // Component shouldn't render when closed
      const overlay = screen.queryByRole('dialog');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveAttribute('aria-modal', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      // Should be able to tab to close button
      await user.keyboard('{Tab}');
      const closeButton = screen.getByRole('button', { name: 'Close search' });
      expect(closeButton).toHaveFocus();
    });

    it('should handle form submission accessibility', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      const form = input.closest('form');
      
      expect(form).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'search-input');
    });
  });

  describe('Search Box Styling', () => {
    it('should have proper search container styling', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const searchContainer = screen.getByRole('textbox').closest('.bg-white');
      expect(searchContainer).toHaveClass('bg-white', 'dark:bg-gray-800');
      expect(searchContainer).toHaveClass('rounded-xl', 'shadow-xl');
      expect(searchContainer).toHaveClass('border', 'border-gray-200', 'dark:border-gray-700');
    });

    it('should have proper input container layout', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const inputContainer = screen.getByRole('textbox').closest('.flex');
      expect(inputContainer).toHaveClass('flex', 'items-center');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translation gracefully', () => {
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      // Should still have some placeholder even if translation is missing
      expect(input).toHaveAttribute('placeholder');
    });

    it('should handle navigation errors gracefully', async () => {
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      
      const user = userEvent.setup();
      render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test{enter}');
      
      // Should still attempt navigation even if it fails
      expect(mockPush).toHaveBeenCalledWith('/fr/cours?search=test');
    });
  });
});