'use client';

import { useMemo } from 'react';
import type { DirectusCourse } from '@/types/directus';
import type { FilterState } from '@/hooks/useSearchFilters';
import { matchesCompetenceFilter } from '@/lib/utils/competenceMatching';
import { isValidCourseType } from '@/lib/constants/courseTypes';

/**
 * Hook for handling weekly course positioning logic
 */
export function useWeeklyCoursePositioning(
  courses: DirectusCourse[],
  weeklyFreeCourse: DirectusCourse | null,
  filters: FilterState
) {
  return useMemo(() => {
    if (!weeklyFreeCourse) {
      return courses;
    }

    // Check if weekly course is already in the results
    const existingWeeklyCourseIndex = courses.findIndex(course => course.id === weeklyFreeCourse.id);
    const shouldShowWeeklyCourse = shouldShowWeeklyFreeCourse(weeklyFreeCourse, filters);

    // Debug logging (can be enabled for troubleshooting)
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 [Weekly Course Debug] Evaluating weekly course display conditions');
      console.log('🎯 Weekly course:', {
        id: weeklyFreeCourse.id,
        title: weeklyFreeCourse.translations?.[0]?.title,
        course_type: weeklyFreeCourse.course_type
      });
      console.log('🎯 Current filters:', {
        courseType: filters.courseType,
        competences: filters.competences,
        showBookmarked: filters.showBookmarked
      });
      console.log('🎯 Filtered courses before weekly positioning:', courses.length);
      console.log('🎯 Weekly course position in results:', existingWeeklyCourseIndex);
      console.log('🎯 Should show weekly course:', shouldShowWeeklyCourse);
    }

    if (shouldShowWeeklyCourse) {
      return positionWeeklyCourseFirst(courses, weeklyFreeCourse, existingWeeklyCourseIndex);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Weekly course NOT shown due to current filter combination');
    }
    return courses;
  }, [courses, weeklyFreeCourse, filters]);
}

/**
 * Determine if the weekly free course should be shown based on current filters
 */
function shouldShowWeeklyFreeCourse(weeklyFreeCourse: DirectusCourse, filters: FilterState): boolean {
  const hasNoFilters = filters.courseType.length === 0 && filters.competences.length === 0 && !filters.showBookmarked;

  // Show if no filters are applied
  if (hasNoFilters) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Weekly course shown: No filters applied');
    }
    return true;
  }

  // Special case: if only bookmark filter is active, check if weekly course is in results
  // This means it was already filtered by the bookmark service and should be shown
  if (filters.showBookmarked && filters.courseType.length === 0 && filters.competences.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Weekly course shown: Only bookmark filter active and course is bookmarked');
    }
    return true;
  }

  // Check course type filter match
  const courseTypeMatches = filters.courseType.length === 0 || 
    (weeklyFreeCourse.course_type && 
     isValidCourseType(weeklyFreeCourse.course_type) &&
     filters.courseType.includes(weeklyFreeCourse.course_type));

  // Check competence filter match
  const competenceMatches = filters.competences.length === 0 || 
    matchesCompetenceFilter(weeklyFreeCourse, filters.competences);

  // For bookmark filter combined with other filters, we rely on the fact that 
  // if the weekly course is in the filtered results, it already passed all filters
  const shouldShow = Boolean(courseTypeMatches && competenceMatches);

  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Weekly course filter check:', { 
      courseTypeMatches, 
      competenceMatches, 
      showBookmarked: filters.showBookmarked,
      shouldShow 
    });

    if (shouldShow) {
      console.log('🎯 Weekly course shown: All active filters match');
    } else {
      console.log('🎯 Weekly course hidden: Filters do not match');
    }
  }

  return shouldShow;
}

/**
 * Position the weekly course at the first position in the array
 */
function positionWeeklyCourseFirst(
  courses: DirectusCourse[],
  weeklyFreeCourse: DirectusCourse,
  existingWeeklyCourseIndex: number
): DirectusCourse[] {
  if (existingWeeklyCourseIndex === -1) {
    // Weekly course not in results, add it at position 0
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Weekly course added at position 1');
    }
    return [weeklyFreeCourse, ...courses];
  } else if (existingWeeklyCourseIndex !== 0) {
    // Weekly course is in results but not at position 0, move it there
    const coursesToReorder = [...courses];
    const [weeklyCourse] = coursesToReorder.splice(existingWeeklyCourseIndex, 1);
    if (weeklyCourse) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Weekly course moved from position', existingWeeklyCourseIndex + 1, 'to position 1');
      }
      return [weeklyCourse, ...coursesToReorder];
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Weekly course already at position 1');
    }
  }

  return courses;
}