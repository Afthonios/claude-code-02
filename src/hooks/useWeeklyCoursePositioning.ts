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
    if (!weeklyFreeCourse || filters.showBookmarked) {
      return courses;
    }

    // Check if weekly course is already in the results
    const existingWeeklyCourseIndex = courses.findIndex(course => course.id === weeklyFreeCourse.id);
    const shouldShowWeeklyCourse = shouldShowWeeklyFreeCourse(weeklyFreeCourse, filters);

    console.log('🎯 [Weekly Course Debug] Evaluating weekly course display conditions');
    console.log('🎯 Weekly course:', {
      id: weeklyFreeCourse.id,
      title: weeklyFreeCourse.translations?.[0]?.title,
      course_type: weeklyFreeCourse.course_type,
      hasMainCompetences: !!weeklyFreeCourse.main_competences?.length,
      hasLegacyCompetences: !!weeklyFreeCourse.competence?.length
    });
    console.log('🎯 Current filters:', {
      courseType: filters.courseType,
      competences: filters.competences,
      hideCompleted: filters.hideCompleted
    });
    console.log('🎯 Filtered courses before weekly positioning:', courses.length);
    console.log('🎯 Weekly course position in results:', existingWeeklyCourseIndex);
    console.log('🎯 Should show weekly course:', shouldShowWeeklyCourse);

    if (shouldShowWeeklyCourse) {
      return positionWeeklyCourseFirst(courses, weeklyFreeCourse, existingWeeklyCourseIndex);
    }

    console.log('🎯 Weekly course NOT shown due to current filter combination');
    return courses;
  }, [courses, weeklyFreeCourse, filters]);
}

/**
 * Determine if the weekly free course should be shown based on current filters
 */
function shouldShowWeeklyFreeCourse(weeklyFreeCourse: DirectusCourse, filters: FilterState): boolean {
  const hasNoFilters = filters.courseType.length === 0 && filters.competences.length === 0;

  // Show if no filters are applied
  if (hasNoFilters) {
    console.log('🎯 Weekly course shown: No filters applied');
    return true;
  }

  // Check course type filter match
  const courseTypeMatches = filters.courseType.length === 0 || 
    (weeklyFreeCourse.course_type && 
     isValidCourseType(weeklyFreeCourse.course_type) &&
     filters.courseType.includes(weeklyFreeCourse.course_type));

  // If only course type filter is applied
  if (filters.competences.length === 0) {
    if (courseTypeMatches) {
      console.log('🎯 Weekly course shown: Course type filter matches');
      return true;
    }
    console.log('🎯 Weekly course hidden: Course type filter does not match');
    return false;
  }

  // If competence filters are applied
  const competenceMatches = matchesCompetenceFilter(weeklyFreeCourse, filters.competences);
  const shouldShow = Boolean(competenceMatches && courseTypeMatches);

  console.log('🎯 Weekly course competence check:', { 
    competenceMatches, 
    courseTypeMatches, 
    shouldShow 
  });

  if (shouldShow) {
    console.log('🎯 Weekly course shown: Competence and course type filters match');
  } else {
    console.log('🎯 Weekly course hidden: Filters do not match');
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
    console.log('🎯 Weekly course added at position 1');
    return [weeklyFreeCourse, ...courses];
  } else if (existingWeeklyCourseIndex !== 0) {
    // Weekly course is in results but not at position 0, move it there
    const coursesToReorder = [...courses];
    const [weeklyCourse] = coursesToReorder.splice(existingWeeklyCourseIndex, 1);
    if (weeklyCourse) {
      console.log('🎯 Weekly course moved from position', existingWeeklyCourseIndex + 1, 'to position 1');
      return [weeklyCourse, ...coursesToReorder];
    }
  } else {
    console.log('🎯 Weekly course already at position 1');
  }

  return courses;
}