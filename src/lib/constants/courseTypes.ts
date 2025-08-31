/**
 * Course type constants and utilities
 */

export const COURSE_TYPES = {
  FORMATION: 'Formation',
  PARCOURS: 'Parcours'
} as const;

export type CourseType = typeof COURSE_TYPES[keyof typeof COURSE_TYPES];

/**
 * Course type configuration
 */
export const COURSE_TYPE_CONFIG = {
  [COURSE_TYPES.FORMATION]: {
    key: 'formation',
    labelKey: 'Formation',
    translationKey: 'courseType.formation'
  },
  [COURSE_TYPES.PARCOURS]: {
    key: 'parcours',
    labelKey: 'Parcours',
    translationKey: 'courseType.parcours'
  }
} as const;

/**
 * Get all valid course types
 */
export function getValidCourseTypes(): CourseType[] {
  return Object.values(COURSE_TYPES);
}

/**
 * Check if a value is a valid course type
 */
export function isValidCourseType(value: string): value is CourseType {
  return Object.values(COURSE_TYPES).includes(value as CourseType);
}

/**
 * Get course type configuration
 */
export function getCourseTypeConfig(courseType: CourseType) {
  return COURSE_TYPE_CONFIG[courseType];
}