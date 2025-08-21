import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../utils/test-utils';
import CoursesPageClient from '@/components/course/CoursesPageClient';
import type { DirectusCourse } from '@/types/directus';

// Mock the API route to return our test data
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
        title: 'Formation Test',
        subtitle: 'Une formation test',
        summary: 'Résumé formation',
        description: 'Description',
        slug: 'formation-test',
      },
    ],
    competence: [],
    instructors: [],
  },
  {
    id: '2',
    legacy_id: 'parcours-1',
    status: 'published',
    date_created: '2023-01-01',
    date_updated: '2023-01-01',
    duration: 60,
    course_type: 'parcours',
    price_cents: 0,
    currency: 'EUR',
    translations: [
      {
        id: '2',
        courses_id: '2',
        languages_code: 'fr',
        title: 'Parcours Test',
        subtitle: 'Un parcours test',
        summary: 'Résumé parcours',
        description: 'Description',
        slug: 'parcours-test',
      },
    ],
    competence: [],
    instructors: [],
  },
];

describe('Filter Debugging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock API to always fail so we use client-side filtering with initialCourses
    (global.fetch as any).mockRejectedValue(new Error('API Error'));
  });

  it('should show both courses initially', async () => {
    const { container } = render(
      <CoursesPageClient locale="fr" initialCourses={mockCourses} />
    );

    await waitFor(() => {
      expect(screen.getByText('Formation Test')).toBeInTheDocument();
      expect(screen.getByText('Parcours Test')).toBeInTheDocument();
    });
  });

  it('should show only formation when formation filter is selected', async () => {
    const { container } = render(
      <CoursesPageClient locale="fr" initialCourses={mockCourses} />
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Formation Test')).toBeInTheDocument();
      expect(screen.getByText('Parcours Test')).toBeInTheDocument();
    });

    // Open filter sidebar on mobile if needed
    const filterButton = screen.queryByText('Filtres');
    if (filterButton && filterButton.closest('button')) {
      fireEvent.click(filterButton);
    }

    // Find Formation checkbox - use a more flexible approach
    const formationElements = screen.getAllByText(/Formation/);
    let formationCheckbox = null;
    
    for (const element of formationElements) {
      const checkbox = element.closest('label')?.querySelector('input[type="checkbox"]');
      if (checkbox) {
        formationCheckbox = checkbox;
        break;
      }
    }

    if (formationCheckbox) {
      fireEvent.click(formationCheckbox);

      // Debug: log what courses are visible after filtering
      await waitFor(() => {
        const formationVisible = screen.queryByText('Formation Test') !== null;
        const parcoursVisible = screen.queryByText('Parcours Test') !== null;
        
        console.log('After Formation filter:');
        console.log('- Formation Test visible:', formationVisible);
        console.log('- Parcours Test visible:', parcoursVisible);
        
        // The key test: Formation should be visible, Parcours should not
        expect(screen.getByText('Formation Test')).toBeInTheDocument();
        expect(screen.queryByText('Parcours Test')).not.toBeInTheDocument();
      });
    } else {
      console.log('Formation checkbox not found');
      console.log('Available elements with "Formation":', formationElements.map(el => el.tagName + ': ' + el.textContent));
      throw new Error('Formation checkbox not found');
    }
  });

  it('should show only parcours when parcours filter is selected', async () => {
    const { container } = render(
      <CoursesPageClient locale="fr" initialCourses={mockCourses} />
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Formation Test')).toBeInTheDocument();
      expect(screen.getByText('Parcours Test')).toBeInTheDocument();
    });

    // Open filter sidebar on mobile if needed
    const filterButton = screen.queryByText('Filtres');
    if (filterButton && filterButton.closest('button')) {
      fireEvent.click(filterButton);
    }

    // Find Parcours checkbox
    const parcoursElements = screen.getAllByText(/Parcours/);
    let parcoursCheckbox = null;
    
    for (const element of parcoursElements) {
      const checkbox = element.closest('label')?.querySelector('input[type="checkbox"]');
      if (checkbox) {
        parcoursCheckbox = checkbox;
        break;
      }
    }

    if (parcoursCheckbox) {
      fireEvent.click(parcoursCheckbox);

      await waitFor(() => {
        const formationVisible = screen.queryByText('Formation Test') !== null;
        const parcoursVisible = screen.queryByText('Parcours Test') !== null;
        
        console.log('After Parcours filter:');
        console.log('- Formation Test visible:', formationVisible);
        console.log('- Parcours Test visible:', parcoursVisible);
        
        // The key test: Parcours should be visible, Formation should not
        expect(screen.queryByText('Formation Test')).not.toBeInTheDocument();
        expect(screen.getByText('Parcours Test')).toBeInTheDocument();
      });
    } else {
      console.log('Parcours checkbox not found');
      console.log('Available elements with "Parcours":', parcoursElements.map(el => el.tagName + ': ' + el.textContent));
      throw new Error('Parcours checkbox not found');
    }
  });

  it('should debug filter sidebar structure', async () => {
    const { container } = render(
      <CoursesPageClient locale="fr" initialCourses={mockCourses} />
    );

    await waitFor(() => {
      expect(screen.getByText('Formation Test')).toBeInTheDocument();
    });

    // Debug what's in the sidebar
    const sidebar = container.querySelector('[role="complementary"]') || container.querySelector('.space-y-6');
    if (sidebar) {
      console.log('Sidebar HTML:', sidebar.innerHTML);
    } else {
      console.log('Sidebar not found, container HTML:', container.innerHTML);
    }

    // Check for checkboxes
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    console.log('Found checkboxes:', checkboxes.length);
    checkboxes.forEach((checkbox, i) => {
      const label = checkbox.closest('label');
      console.log(`Checkbox ${i}:`, label?.textContent || 'No label');
    });
  });
});