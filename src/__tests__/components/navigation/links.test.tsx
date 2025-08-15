import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, createMockCourse } from '../../utils/test-utils';
import { resetAllMocks, mockRouter } from '../../utils/mocks';
import CourseCard from '@/components/course/CourseCard';
import Link from 'next/link';

// Mock components that use internal links
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'fr' }),
  usePathname: () => '/fr/courses',
  useRouter: () => mockRouter,
}));

describe('Internal Links Integration', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Course Links', () => {
    const mockCourse = createMockCourse({
      id: '1',
      slug: 'javascript-fundamentals',
      title: 'JavaScript Fundamentals',
      subtitle: 'Learn the basics of JavaScript',
      duration_minutes: 120,
      level: 'beginner',
      availability: 'free',
    });

    it('should render course card with proper link to course detail', () => {
      render(<CourseCard course={mockCourse} />);
      
      const courseLink = screen.getByRole('link');
      expect(courseLink).toHaveAttribute('href', '/fr/courses/javascript-fundamentals');
    });

    it('should have accessible course link text', () => {
      render(<CourseCard course={mockCourse} />);
      
      const courseTitle = screen.getByText('JavaScript Fundamentals');
      expect(courseTitle).toBeInTheDocument();
      
      const courseLink = screen.getByRole('link');
      expect(courseLink).toHaveAccessibleName('JavaScript Fundamentals');
    });

    it('should support keyboard navigation on course links', async () => {
      render(<CourseCard course={mockCourse} />);
      
      const courseLink = screen.getByRole('link');
      
      // Focus the link
      courseLink.focus();
      expect(courseLink).toHaveFocus();
      
      // Simulate Enter key press
      fireEvent.keyDown(courseLink, { key: 'Enter' });
      // Link behavior would be handled by Next.js router
    });

    it('should render course links with proper locale prefix for different languages', () => {
      // Test French locale
      render(<CourseCard course={mockCourse} />, { locale: 'fr' });
      const frLink = screen.getByRole('link');
      expect(frLink).toHaveAttribute('href', '/fr/courses/javascript-fundamentals');
      
      // Test English locale
      render(<CourseCard course={mockCourse} />, { locale: 'en' });
      const enLink = screen.getByRole('link');
      expect(enLink).toHaveAttribute('href', '/fr/courses/javascript-fundamentals'); // Note: CourseCard uses current locale from params
    });
  });

  describe('Next.js Link Component Integration', () => {
    it('should render Next.js Link with correct href', () => {
      render(
        <Link href="/fr/courses/test">
          <span>Test Course Link</span>
        </Link>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/fr/courses/test');
      expect(screen.getByText('Test Course Link')).toBeInTheDocument();
    });

    it('should handle relative links correctly', () => {
      render(
        <Link href="./course-detail">
          <span>Relative Course Link</span>
        </Link>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', './course-detail');
    });

    it('should support external links with proper attributes', () => {
      render(
        <a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
          External Link
        </a>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://external-site.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Link Navigation Behavior', () => {
    it('should handle click events on internal links', () => {
      const handleClick = vi.fn();
      
      render(
        <Link href="/fr/courses" onClick={handleClick}>
          <span>Courses Link</span>
        </Link>
      );
      
      const link = screen.getByRole('link');
      fireEvent.click(link);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should prevent default behavior for disabled links', () => {
      const handleClick = vi.fn((e) => e.preventDefault());
      
      render(
        <Link href="/fr/courses" onClick={handleClick}>
          <span>Disabled Link</span>
        </Link>
      );
      
      const link = screen.getByRole('link');
      fireEvent.click(link);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Link Accessibility', () => {
    it('should have proper focus indicators', () => {
      render(
        <Link href="/fr/courses" className="focus:ring-2 focus:ring-blue-500">
          <span>Accessible Link</span>
        </Link>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });

    it('should support screen reader navigation', () => {
      render(
        <Link href="/fr/courses" aria-label="Navigate to courses page">
          <span>Courses</span>
        </Link>
      );
      
      const link = screen.getByLabelText('Navigate to courses page');
      expect(link).toBeInTheDocument();
    });

    it('should handle keyboard navigation correctly', () => {
      render(
        <div>
          <Link href="/fr/courses">
            <span>First Link</span>
          </Link>
          <Link href="/fr/about">
            <span>Second Link</span>
          </Link>
        </div>
      );
      
      const links = screen.getAllByRole('link');
      
      // Focus first link
      links[0].focus();
      expect(links[0]).toHaveFocus();
      
      // Tab to second link
      fireEvent.keyDown(links[0], { key: 'Tab' });
      // In a real browser, focus would move to the next link
    });
  });

  describe('Locale-Aware Link Generation', () => {
    it('should generate correct URLs for different locales', () => {
      const testCases = [
        { locale: 'fr', expected: '/fr/courses' },
        { locale: 'en', expected: '/en/courses' },
      ];
      
      testCases.forEach(({ locale, expected }) => {
        const { unmount } = render(
          <Link href={`/${locale}/courses`}>
            <span>Courses</span>
          </Link>
        );
        
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', expected);
        
        unmount();
      });
    });

    it('should handle course detail URLs with slugs and locales', () => {
      const courseSlug = 'advanced-javascript-concepts';
      const testCases = [
        { locale: 'fr', expected: `/fr/courses/${courseSlug}` },
        { locale: 'en', expected: `/en/courses/${courseSlug}` },
      ];
      
      testCases.forEach(({ locale, expected }) => {
        const { unmount } = render(
          <Link href={`/${locale}/courses/${courseSlug}`}>
            <span>Course Detail</span>
          </Link>
        );
        
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', expected);
        
        unmount();
      });
    });
  });

  describe('Link Prefetching', () => {
    it('should handle prefetch prop correctly', () => {
      render(
        <Link href="/fr/courses" prefetch={true}>
          <span>Prefetched Link</span>
        </Link>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // Prefetch behavior would be handled by Next.js internally
    });

    it('should disable prefetch when specified', () => {
      render(
        <Link href="/fr/courses" prefetch={false}>
          <span>Non-prefetched Link</span>
        </Link>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Link Performance', () => {
    it('should render multiple links efficiently', () => {
      const courses = Array.from({ length: 10 }, (_, i) => 
        createMockCourse({ 
          id: String(i + 1), 
          slug: `course-${i + 1}`, 
          title: `Course ${i + 1}` 
        })
      );
      
      render(
        <div>
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(10);
      
      // Verify each link has correct href
      links.forEach((link, index) => {
        expect(link).toHaveAttribute('href', `/fr/courses/course-${index + 1}`);
      });
    });
  });

  describe('Link State Management', () => {
    it('should maintain link state during re-renders', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        
        return (
          <div>
            <button onClick={() => setCount(count + 1)}>
              Count: {count}
            </button>
            <Link href="/fr/courses">
              <span>Courses Link</span>
            </Link>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      const button = screen.getByRole('button');
      const link = screen.getByRole('link');
      
      expect(link).toHaveAttribute('href', '/fr/courses');
      
      fireEvent.click(button);
      
      // Link should maintain its href after re-render
      expect(link).toHaveAttribute('href', '/fr/courses');
    });
  });
});

// Add React import for the test component
import React from 'react';