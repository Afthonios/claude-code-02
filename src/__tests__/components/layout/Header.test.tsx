import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../utils/test-utils';
import { resetAllMocks } from '../../utils/mocks';
import Header from '@/components/layout/Header';

// Mock the hooks before imports
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'fr' }),
  usePathname: () => '/fr/courses',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('Header Component', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Logo and Branding', () => {
    it('should render the logo and site name', () => {
      render(<Header />);
      
      const logo = screen.getByAltText('Afthonios Logo');
      const siteName = screen.getByText('Afthonios');
      
      expect(logo).toBeInTheDocument();
      expect(siteName).toBeInTheDocument();
    });

    it('should have proper accessibility attributes for logo link', () => {
      render(<Header />);
      
      const logoLink = screen.getByLabelText('Afthonios - Return to homepage');
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/fr');
    });

    it('should render logo with correct dimensions', () => {
      render(<Header />);
      
      const logo = screen.getByAltText('Afthonios Logo');
      expect(logo).toHaveAttribute('width', '24');
      expect(logo).toHaveAttribute('height', '24');
    });
  });

  describe('Navigation Links', () => {
    it('should render all main navigation links with French labels', () => {
      render(<Header />, { locale: 'fr' });
      
      expect(screen.getByText('Cours')).toBeInTheDocument();
      expect(screen.getByText('Cours de la semaine')).toBeInTheDocument();
      expect(screen.getByText('Gestion de projet')).toBeInTheDocument();
      expect(screen.getByText('Nouvelle offre')).toBeInTheDocument();
    });

    it('should render navigation links with English labels when locale is en', () => {
      render(<Header />, { locale: 'en' });
      
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Course of the Week')).toBeInTheDocument();
      expect(screen.getByText('Project Management')).toBeInTheDocument();
      expect(screen.getByText('New Offer')).toBeInTheDocument();
    });

    it('should have correct href attributes for all navigation links', () => {
      render(<Header />);
      
      const coursesLink = screen.getByText('Cours').closest('a');
      const weeklyLink = screen.getByText('Cours de la semaine').closest('a');
      const projectLink = screen.getByText('Gestion de projet').closest('a');
      const newOfferLink = screen.getByText('Nouvelle offre').closest('a');
      
      expect(coursesLink).toHaveAttribute('href', '/fr/courses');
      expect(weeklyLink).toHaveAttribute('href', '/fr/cours-de-la-semaine');
      expect(projectLink).toHaveAttribute('href', '/fr/gestion-de-projet');
      expect(newOfferLink).toHaveAttribute('href', '/fr/nouvelle-offre');
    });

    it('should have proper focus and hover states', () => {
      render(<Header />);
      
      const coursesLink = screen.getByText('Cours').closest('a');
      expect(coursesLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-accent');
      expect(coursesLink).toHaveClass('hover:underline');
    });
  });

  describe('Authentication Links', () => {
    it('should render login and signup links with French labels', () => {
      render(<Header />, { locale: 'fr' });
      
      expect(screen.getByText('Connexion')).toBeInTheDocument();
      expect(screen.getByText('S\'inscrire')).toBeInTheDocument();
    });

    it('should render login and signup links with English labels when locale is en', () => {
      render(<Header />, { locale: 'en' });
      
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should have correct href attributes for auth links', () => {
      render(<Header />);
      
      const loginLink = screen.getByText('Connexion').closest('a');
      const signupLink = screen.getByText('S\'inscrire').closest('a');
      
      expect(loginLink).toHaveAttribute('href', '/fr/auth/login');
      expect(signupLink).toHaveAttribute('href', '/fr/auth/signup');
    });

    it('should have different styling for login vs signup buttons', () => {
      render(<Header />);
      
      const loginLink = screen.getByText('Connexion').closest('a');
      const signupLink = screen.getByText('S\'inscrire').closest('a');
      
      // Login should have border styling
      expect(loginLink).toHaveClass('border');
      // Signup should have primary background
      expect(signupLink).toHaveClass('bg-primary');
    });
  });

  describe('Language Switcher and Theme Toggle', () => {
    it('should render language switcher component', () => {
      render(<Header />);
      
      // Look for the language switcher container or buttons
      const frButton = screen.getByText('FR');
      const enButton = screen.getByText('EN');
      
      expect(frButton).toBeInTheDocument();
      expect(enButton).toBeInTheDocument();
    });

    it('should render theme toggle component', () => {
      render(<Header />);
      
      // Theme toggle should be present (we'll test its functionality in its own test file)
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should hide main navigation on mobile screens', () => {
      render(<Header />);
      
      const nav = screen.getByRole('navigation', { hidden: true });
      expect(nav).toHaveClass('hidden', 'md:flex');
    });

    it('should hide site name on small screens', () => {
      render(<Header />);
      
      const siteName = screen.getByText('Afthonios');
      expect(siteName).toHaveClass('hidden', 'sm:inline-block');
    });

    it('should hide auth buttons on mobile screens', () => {
      render(<Header />);
      
      const authNav = screen.getByText('Connexion').closest('nav');
      expect(authNav).toHaveClass('hidden', 'md:flex');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('HEADER');
    });

    it('should support keyboard navigation', () => {
      render(<Header />);
      
      const coursesLink = screen.getByText('Cours');
      
      // Focus should work
      coursesLink.focus();
      expect(coursesLink).toHaveFocus();
      
      // Tab navigation should work
      fireEvent.keyDown(coursesLink, { key: 'Tab' });
    });

    it('should have appropriate aria-labels', () => {
      render(<Header />);
      
      const logoLink = screen.getByLabelText('Afthonios - Return to homepage');
      expect(logoLink).toBeInTheDocument();
    });

    it('should have focus indicators for all interactive elements', () => {
      render(<Header />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('focus:outline-none');
        expect(link).toHaveClass('focus:ring-2');
      });
    });
  });

  describe('Sticky Positioning and Backdrop', () => {
    it('should have sticky positioning classes', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });

    it('should have backdrop blur effect', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('backdrop-blur');
    });

    it('should have border and background styling', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('border-b', 'bg-background/95');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for navigation links', () => {
      render(<Header />);
      
      const coursesLink = screen.getByText('Cours');
      expect(coursesLink).toHaveClass('dark:text-accent', 'dark:hover:underline');
    });

    it('should have dark mode classes for auth buttons', () => {
      render(<Header />);
      
      const loginLink = screen.getByText('Connexion');
      const signupLink = screen.getByText('S\'inscrire');
      
      expect(loginLink).toHaveClass('dark:text-accent', 'dark:border-accent/30');
      expect(signupLink).toHaveClass('hover:bg-primary/90');
    });
  });
});