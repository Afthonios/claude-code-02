import type { DirectusCourse } from '@/types/directus';
import type { FilterState } from '@/hooks/useSearchFilters';
import { matchesCompetenceFilter } from '@/lib/utils/competenceMatching';
import { isValidCourseType } from '@/lib/constants/courseTypes';

/**
 * Centralized course filtering service
 */

export interface CourseFilterOptions {
  courses: DirectusCourse[];
  filters: FilterState;
  search?: string;
  bookmarks?: string[];
}

/**
 * Apply client-side filters to a list of courses
 */
export function filterCourses({
  courses,
  filters,
  search,
  bookmarks = []
}: CourseFilterOptions): DirectusCourse[] {
  let filtered = [...courses];

  // Apply search filter
  if (search && search.trim()) {
    const searchTerm = search.trim().toLowerCase();
    filtered = filtered.filter(course => {
      return course.translations?.some(translation => 
        translation.title?.toLowerCase().includes(searchTerm) ||
        translation.description?.toLowerCase().includes(searchTerm) ||
        translation.subtitle?.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Apply course type filter
  if (filters.courseType.length > 0) {
    filtered = filtered.filter(course => 
      course.course_type && 
      isValidCourseType(course.course_type) &&
      filters.courseType.includes(course.course_type)
    );
  }

  // Apply competence filter
  if (filters.competences.length > 0) {
    filtered = filtered.filter(course => 
      matchesCompetenceFilter(course, filters.competences)
    );
  }

  // Apply bookmark filter
  if (filters.showBookmarked) {
    filtered = filtered.filter(course => 
      bookmarks.includes(course.id)
    );
  }

  // Apply hide completed filter (placeholder for future implementation)
  if (filters.hideCompleted) {
    // TODO: Implement when user progress tracking is available
    // filtered = filtered.filter(course => !isCompletedByCourse(course.id));
  }

  return filtered;
}

/**
 * Generate Directus API filters from filter state
 */
export function generateDirectusFilters(filters: FilterState): Record<string, unknown> {
  const directusFilters: Record<string, unknown> = {
    status: { _eq: 'published' },
  };

  // Course type filter
  if (filters.courseType.length > 0) {
    const validTypes = filters.courseType.filter(isValidCourseType);
    if (validTypes.length > 0) {
      directusFilters.course_type = { _in: validTypes };
    }
  }

  // Competences filter (filtering by parent competence through legacy competence field)
  if (filters.competences.length > 0) {
    // Use both main_competences and legacy competence fields
    directusFilters._or = [
      {
        main_competences: {
          competences_id: {
            id: { _in: filters.competences }
          }
        }
      },
      {
        competence: {
          competences_id: {
            parent_competence: { _in: filters.competences }
          }
        }
      }
    ];
  }

  return directusFilters;
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: FilterState, search?: string): boolean {
  return !!(
    search?.trim() ||
    filters.competences.length > 0 ||
    filters.showBookmarked ||
    filters.courseType.length > 0 ||
    filters.hideCompleted
  );
}

/**
 * Get bookmarks from localStorage safely
 */
export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
  } catch (error) {
    console.warn('Failed to parse bookmarks from localStorage:', error);
    return [];
  }
}