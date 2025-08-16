// Directus API specific types for Afthonios e-learning platform

import type { DirectusFile } from './index';

// Base Directus item structure
export interface DirectusItem {
  id: string;
  status: 'published' | 'draft' | 'archived';
  sort?: number;
  user_created?: string;
  date_created: string;
  user_updated?: string;
  date_updated: string;
}

// Directus Courses collection
export interface DirectusCourse extends DirectusItem {
  legacy_id: string;
  course_image?: string | DirectusFile;
  gallery?: string[] | DirectusFile[];
  duration?: number;
  course_type?: string;
  tags?: string;
  price_cents: number;
  currency: string;
  // Gradient background fields
  gradient_from_light?: string;
  gradient_to_light?: string;
  gradient_from_dark?: string;
  gradient_to_dark?: string;
  on_light?: string;
  on_dark?: string;
  // SEO fields
  seo_title?: string;
  seo_description?: string;
  og_image?: string | DirectusFile;
  published_at?: string;
  // Translations are handled separately
  translations: DirectusCourseTranslation[];
  // Relations
  competence?: DirectusCourseCompetence[];
  instructors?: DirectusCourseInstructor[];
}

// Directus Course Translations
export interface DirectusCourseTranslation {
  id: string;
  courses_id: string;
  languages_code: 'fr' | 'en';
  title: string;
  subtitle?: string;
  summary: string;
  description: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
}

// Directus Competences collection
export interface DirectusCompetence extends DirectusItem {
  icon?: string;
  color?: string;
  color_light?: string;
  color_dark?: string;
  category?: string;
  parent_competence?: string | DirectusCompetence;
  translations: DirectusCompetenceTranslation[];
}

// Directus Competence Translations
export interface DirectusCompetenceTranslation {
  id: string;
  competences_id: string;
  languages_code: 'fr' | 'en';
  title: string;
  description?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  card_title?: string;
  meta_keywords?: string;
}

// Directus Course-Competence junction table
export interface DirectusCourseCompetence {
  id: string;
  courses_id: string | DirectusCourse;
  competences_id: DirectusCompetence;
}

// Directus Instructors collection
export interface DirectusInstructor extends DirectusItem {
  name: string;
  avatar?: string | DirectusFile;
  expertise?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  translations: DirectusInstructorTranslation[];
}

// Directus Instructor Translations
export interface DirectusInstructorTranslation {
  id: string;
  instructors_id: string;
  languages_code: 'fr' | 'en';
  bio?: string;
}

// Directus Course-Instructor junction table
export interface DirectusCourseInstructor {
  id: string;
  courses_id: string | DirectusCourse;
  instructors_id: string | DirectusInstructor;
}

// Directus singleton pages
export interface DirectusPage extends DirectusItem {
  slug: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string | DirectusFile;
  translations: DirectusPageTranslation[];
}

// Directus Page Translations
export interface DirectusPageTranslation {
  id: string;
  pages_id: string;
  languages_code: 'fr' | 'en';
  title: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
}

// Directus API query parameters
export interface DirectusQueryParams {
  fields?: string[];
  filter?: Record<string, unknown>;
  search?: string;
  sort?: string[];
  limit?: number;
  offset?: number;
  page?: number;
  deep?: Record<string, DirectusQueryParams>;
  alias?: Record<string, string>;
}

// Directus API response structure
export interface DirectusResponse<T = unknown> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

// Directus API error structure
export interface DirectusError {
  errors: Array<{
    message: string;
    extensions: {
      code: string;
      field?: string;
    };
  }>;
}

// Directus collection endpoints
export type DirectusCollection = 
  | 'courses'
  | 'courses_translations'
  | 'competences'
  | 'competences_translations'
  | 'instructors'
  | 'instructors_translations'
  | 'courses_competences'
  | 'courses_instructors'
  | 'pages'
  | 'pages_translations';

// Directus SDK configuration
export interface DirectusConfig {
  url: string;
  token?: string;
}

// Helper types for API operations
export type DirectusReadOptions = Pick<DirectusQueryParams, 'fields' | 'filter' | 'search' | 'sort' | 'limit' | 'offset' | 'deep'>;

export type DirectusCreateData<T> = Omit<T, 'id' | 'date_created' | 'date_updated' | 'user_created' | 'user_updated'>;

export type DirectusUpdateData<T> = Partial<Omit<T, 'id' | 'date_created' | 'user_created'>>;

// Utility type to extract nested collection data
export type ExtractDirectusData<T> = T extends DirectusResponse<infer U> ? U : never;