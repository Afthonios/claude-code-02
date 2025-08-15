import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../utils/test-utils';
import { resetAllMocks, mockRouter } from '../../utils/mocks';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

// Mock the navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/fr/courses',
  useParams: () => ({ locale: 'fr' }),
}));

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Rendering', () => {
    it('should render language switcher with FR and EN buttons', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      const enButton = screen.getByText('EN');
      
      expect(frButton).toBeInTheDocument();
      expect(enButton).toBeInTheDocument();
    });

    it('should render globe icon', () => {
      render(<LanguageSwitcher />);
      
      const globeIcon = screen.getByTestId('globe-icon');
      expect(globeIcon).toBeInTheDocument();
    });

    it('should have proper group role for accessibility', () => {
      render(<LanguageSwitcher />);
      
      const languageGroup = screen.getByRole('group', { name: 'Language selector' });
      expect(languageGroup).toBeInTheDocument();
    });

    it('should show current locale as active', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      const enButton = screen.getByText('EN');
      
      expect(frButton).toHaveClass('bg-primary', 'text-primary-foreground');
      expect(enButton).not.toHaveClass('bg-primary', 'text-primary-foreground');
    });
  });

  describe('Language Switching Functionality', () => {
    it('should call router.push with correct path when switching from FR to EN', async () => {
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/en/courses');
      });
    });

    it('should call router.push with correct path when switching from EN to FR', async () => {
      // Mock English locale
      vi.mocked(require('next/navigation').useParams).mockReturnValue({ locale: 'en' });
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/en/courses');
      
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      fireEvent.click(frButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/fr/courses');
      });
    });

    it('should not call router.push when clicking the current locale', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      fireEvent.click(frButton);
      
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should handle complex paths correctly', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/fr/courses/javascript-fundamentals');
      
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/en/courses/javascript-fundamentals');
      });
    });

    it('should handle root path correctly', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/fr');
      
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/en');
      });
    });
  });

  describe('Loading States', () => {
    it('should show disabled state when transition is pending', async () => {
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      // During transition, buttons should be disabled
      await waitFor(() => {
        expect(enButton).toBeDisabled();
        expect(screen.getByText('FR')).toBeDisabled();
      });
    });

    it('should have cursor-not-allowed class when disabled', async () => {
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      await waitFor(() => {
        expect(enButton).toHaveClass('cursor-not-allowed');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for each language button', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByLabelText('Switch to Français');
      const enButton = screen.getByLabelText('Switch to English');
      
      expect(frButton).toBeInTheDocument();
      expect(enButton).toBeInTheDocument();
    });

    it('should have title attributes for tooltips', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByTitle('Switch to Français');
      const enButton = screen.getByTitle('Switch to English');
      
      expect(frButton).toBeInTheDocument();
      expect(enButton).toBeInTheDocument();
    });

    it('should have aria-current for the active language', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      const enButton = screen.getByText('EN');
      
      expect(frButton).toHaveAttribute('aria-current', 'true');
      expect(enButton).not.toHaveAttribute('aria-current');
    });

    it('should support keyboard navigation', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      const enButton = screen.getByText('EN');
      
      // Should be focusable
      frButton.focus();
      expect(frButton).toHaveFocus();
      
      enButton.focus();
      expect(enButton).toHaveFocus();
    });

    it('should have proper focus styling', () => {
      render(<LanguageSwitcher />);
      
      const buttons = [screen.getByText('FR'), screen.getByText('EN')];
      
      buttons.forEach(button => {
        expect(button).toHaveClass('focus-visible:outline-none');
        expect(button).toHaveClass('focus-visible:ring-2');
      });
    });
  });

  describe('Styling and Visual States', () => {
    it('should have correct styling for active button', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      expect(frButton).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should have correct styling for inactive button', () => {
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      expect(enButton).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    it('should have proper border radius classes', () => {
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      const enButton = screen.getByText('EN');
      
      expect(frButton).toHaveClass('first:rounded-l-md');
      expect(enButton).toHaveClass('last:rounded-r-md');
    });

    it('should have consistent button sizes', () => {
      render(<LanguageSwitcher />);
      
      const buttons = [screen.getByText('FR'), screen.getByText('EN')];
      
      buttons.forEach(button => {
        expect(button).toHaveClass('px-3', 'py-1.5');
      });
    });
  });

  describe('Different Locale Contexts', () => {
    it('should show EN as active when locale is en', () => {
      vi.mocked(require('next/navigation').useParams).mockReturnValue({ locale: 'en' });
      
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      const enButton = screen.getByText('EN');
      
      expect(enButton).toHaveClass('bg-primary', 'text-primary-foreground');
      expect(frButton).not.toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should have correct aria-current for different locales', () => {
      vi.mocked(require('next/navigation').useParams).mockReturnValue({ locale: 'en' });
      
      render(<LanguageSwitcher />);
      
      const frButton = screen.getByText('FR');
      const enButton = screen.getByText('EN');
      
      expect(enButton).toHaveAttribute('aria-current', 'true');
      expect(frButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pathname gracefully', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('');
      
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/en');
      });
    });

    it('should handle pathname without locale gracefully', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/courses');
      
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/en/courses');
      });
    });

    it('should handle malformed pathnames', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('///fr//courses//');
      
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/en//courses//');
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderCount = vi.fn();
      
      const TestWrapper = () => {
        renderCount();
        return <LanguageSwitcher />;
      };
      
      const { rerender } = render(<TestWrapper />);
      
      expect(renderCount).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestWrapper />);
      
      expect(renderCount).toHaveBeenCalledTimes(2);
    });
  });
});