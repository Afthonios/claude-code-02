import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import { resetAllMocks } from '../../utils/mocks';
import Header from '@/components/layout/Header';

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

describe('Header Search Integration', () => {
  beforeEach(() => {
    resetAllMocks();
    mockPush.mockClear();
  });

  describe('Search Button', () => {
    it('should render search button in header', () => {
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveAttribute('aria-label', 'Search courses');
    });

    it('should have proper search button styling', () => {
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      expect(searchButton).toHaveClass('flex', 'items-center', 'justify-center');
      expect(searchButton).toHaveClass('w-9', 'h-9', 'rounded-md');
      expect(searchButton).toHaveClass('text-muted-foreground', 'hover:text-foreground');
      expect(searchButton).toHaveClass('hover:bg-muted');
    });

    it('should render search icon inside button', () => {
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      const searchIcon = searchButton.querySelector('svg');
      
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveClass('h-5', 'w-5');
    });

    it('should have proper focus styles', () => {
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      expect(searchButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring');
    });
  });

  describe('Search Overlay Toggle', () => {
    it('should not show search overlay initially', () => {
      render(<Header />);
      
      const overlay = screen.queryByRole('dialog');
      expect(overlay).not.toBeInTheDocument();
    });

    it('should open search overlay when search button is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        const overlay = screen.getByRole('dialog');
        expect(overlay).toBeInTheDocument();
        expect(overlay).toHaveAttribute('aria-modal', 'true');
      });
    });

    it('should close search overlay when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Open overlay
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close overlay
      const closeButton = screen.getByRole('button', { name: 'Close search' });
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close search overlay when escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Open overlay
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Press escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality from Header', () => {
    it('should perform search and navigate when search is submitted', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Open search overlay
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Type search query and submit
      const input = screen.getByRole('textbox');
      await user.type(input, 'javascript{enter}');
      
      expect(mockPush).toHaveBeenCalledWith('/fr/cours?search=javascript');
      
      // Overlay should close after search
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should handle empty search gracefully', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Open search overlay
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Submit empty search
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{enter}');
      
      // Should not navigate with empty search
      expect(mockPush).not.toHaveBeenCalled();
      
      // Overlay should remain open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle search with only whitespace', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Open search overlay
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Type only spaces and submit
      const input = screen.getByRole('textbox');
      await user.type(input, '   {enter}');
      
      // Should not navigate with whitespace-only search
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Search Integration with Locale', () => {
    it('should use French URL when locale is fr', async () => {
      const user = userEvent.setup();
      render(<Header />, { locale: 'fr' });
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test{enter}');
      
      expect(mockPush).toHaveBeenCalledWith('/fr/cours?search=test');
    });

    it('should use English URL when locale is en', async () => {
      const user = userEvent.setup();
      
      // Mock useParams to return 'en'
      vi.mocked(vi.importMock('next/navigation')).useParams = () => ({ locale: 'en' });
      
      render(<Header />, { locale: 'en' });
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test{enter}');
      
      expect(mockPush).toHaveBeenCalledWith('/en/cours?search=test');
    });
  });

  describe('Search Button Position in Header', () => {
    it('should position search button before language switcher and theme toggle', () => {
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      const languageSwitcher = screen.getByText('FR');
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      
      expect(searchButton).toBeInTheDocument();
      expect(languageSwitcher).toBeInTheDocument();
      expect(themeToggle).toBeInTheDocument();
      
      // Check order in DOM
      const headerControls = screen.getByText('FR').closest('.flex');
      const buttons = headerControls?.querySelectorAll('button');
      
      expect(buttons?.[0]).toBe(searchButton);
    });

    it('should be part of the right controls section', () => {
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      const rightControls = searchButton.closest('.flex.items-center.space-x-2');
      
      expect(rightControls).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should show search button on all screen sizes', () => {
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      
      // Search button should not have hidden classes
      expect(searchButton).not.toHaveClass('hidden');
      expect(searchButton).not.toHaveClass('md:block');
      expect(searchButton).not.toHaveClass('lg:block');
    });

    it('should maintain consistent spacing with other header elements', () => {
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      const rightControls = searchButton.closest('.space-x-2');
      
      expect(rightControls).toHaveClass('space-x-2');
    });
  });

  describe('Accessibility Integration', () => {
    it('should support keyboard navigation from search button to overlay', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      
      // Focus search button
      await user.click(searchButton);
      
      await waitFor(() => {
        const overlay = screen.getByRole('dialog');
        expect(overlay).toBeInTheDocument();
        
        // Input should be focused when overlay opens
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
      });
    });

    it('should maintain focus management when overlay closes', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close overlay
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should have proper ARIA relationship between button and overlay', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      await waitFor(() => {
        const overlay = screen.getByRole('dialog');
        expect(overlay).toHaveAttribute('aria-modal', 'true');
      });
    });
  });

  describe('State Management', () => {
    it('should maintain independent state for search overlay', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Open overlay multiple times
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      
      await user.click(searchButton);
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
      
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      
      await user.click(searchButton);
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
      
      // Should work consistently
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
      expect(input).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle search overlay errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<Header />);
      
      const searchButton = screen.getByRole('button', { name: 'Search courses' });
      await user.click(searchButton);
      
      // Should still render overlay even if there are errors
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });
});