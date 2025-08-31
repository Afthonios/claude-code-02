import type { DirectusCourse } from '@/types/directus';

/**
 * Utility for matching courses against competence filters
 */

interface CompetenceRelation {
  competences_id?: { 
    id?: string | number;
    parent_competence?: string | number | null;
  };
}

/**
 * Extract competence ID from a competence relation object
 */
export function extractCompetenceId(
  comp: unknown, 
  useMainCompetences: boolean
): string | null {
  if (!comp || typeof comp !== 'object' || !('competences_id' in comp)) {
    return null;
  }

  const typedComp = comp as CompetenceRelation;
  
  if (!typedComp.competences_id || typeof typedComp.competences_id !== 'object') {
    return null;
  }

  if (useMainCompetences) {
    // For main_competences, use the competence ID directly (it's already a main competence)
    return typedComp.competences_id.id ? String(typedComp.competences_id.id) : null;
  } else {
    // For legacy competence field, check if it has a parent (sub-competence) or is main
    if (typedComp.competences_id.parent_competence) {
      // This is a sub-competence, use the parent ID
      return String(typedComp.competences_id.parent_competence);
    } else if (typedComp.competences_id.parent_competence === null && typedComp.competences_id.id) {
      // This is already a main competence
      return String(typedComp.competences_id.id);
    }
  }

  return null;
}

/**
 * Check if a course matches any of the provided competence filters
 */
export function matchesCompetenceFilter(
  course: DirectusCourse, 
  competenceFilters: string[]
): boolean {
  if (competenceFilters.length === 0) {
    return true; // No filter means all courses match
  }

  const courseCompetences = course.main_competences || course.competence || [];
  const useMainCompetences = !!course.main_competences;

  return courseCompetences.some((comp: unknown) => {
    const competenceId = extractCompetenceId(comp, useMainCompetences);
    return competenceId && competenceFilters.includes(competenceId);
  });
}

/**
 * Get all unique competence IDs from a course
 */
export function getCourseCompetenceIds(course: DirectusCourse): string[] {
  const competenceRelations = course.main_competences || course.competence || [];
  const useMainCompetences = !!course.main_competences;
  const competenceIds: string[] = [];
  const seenIds = new Set<string>();

  competenceRelations.forEach((comp: unknown) => {
    const competenceId = extractCompetenceId(comp, useMainCompetences);
    
    if (competenceId && !seenIds.has(competenceId)) {
      competenceIds.push(competenceId);
      seenIds.add(competenceId);
    }
  });

  return competenceIds;
}

/**
 * Count courses by competence ID from a list of courses
 */
export function countCoursesByCompetence(courses: DirectusCourse[]): Record<string, number> {
  const competenceCounts: Record<string, number> = {};

  courses.forEach(course => {
    const competenceIds = getCourseCompetenceIds(course);
    
    competenceIds.forEach(competenceId => {
      competenceCounts[competenceId] = (competenceCounts[competenceId] || 0) + 1;
    });
  });

  return competenceCounts;
}