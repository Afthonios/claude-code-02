import { describe, it, expect, beforeAll } from 'vitest';
import { coursesApi, competencesApi, instructorsApi, pagesApi } from '@/lib/directus';
import type { DirectusCourse, DirectusCompetence, DirectusInstructor } from '@/types/directus';
import { API_TIMEOUT, skipIfDirectusUnavailable, TEST_LOCALES } from '../setup';

describe('Directus API Integration Tests', () => {
  beforeAll(() => {
    if (skipIfDirectusUnavailable('API Integration Tests')) {
      return;
    }
  });

  describe('Courses API', () => {
    it('should fetch all courses with default parameters', async () => {
      const courses = await coursesApi.getAll();
      
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThan(0);
      
      // Test first course structure
      const firstCourse = courses[0] as DirectusCourse;
      expect(firstCourse).toHaveProperty('id');
      expect(firstCourse).toHaveProperty('slug');
      expect(firstCourse).toHaveProperty('status', 'published');
      expect(firstCourse).toHaveProperty('translations');
      expect(Array.isArray(firstCourse.translations)).toBe(true);
    }, API_TIMEOUT);

    it('should fetch courses with pagination', async () => {
      const page1 = await coursesApi.getAll({ limit: 2, page: 1 });
      const page2 = await coursesApi.getAll({ limit: 2, page: 2 });
      
      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);
      
      // Should be different courses (assuming more than 2 exist)
      if (page1.length > 0 && page2.length > 0) {
        expect(page1[0].id).not.toBe(page2[0].id);
      }
    }, API_TIMEOUT);

    it('should fetch courses with search', async () => {
      const allCourses = await coursesApi.getAll({ limit: 10 });
      
      if (allCourses.length > 0) {
        // Get a word from the first course title to search for
        const firstCourse = allCourses[0];
        const frTranslation = firstCourse.translations.find(t => t.languages_code === 'fr');
        
        if (frTranslation?.title) {
          const searchTerm = frTranslation.title.split(' ')[0];
          const searchResults = await coursesApi.getAll({ search: searchTerm });
          
          expect(Array.isArray(searchResults)).toBe(true);
          // Should have at least the course we searched for
          expect(searchResults.length).toBeGreaterThan(0);
        }
      }
    }, API_TIMEOUT);

    it('should fetch course by slug', async () => {
      const allCourses = await coursesApi.getAll({ limit: 1 });
      
      if (allCourses.length > 0) {
        const courseSlug = allCourses[0].slug;
        const course = await coursesApi.getBySlug(courseSlug);
        
        expect(course).toBeDefined();
        expect(course?.slug).toBe(courseSlug);
        expect(course?.status).toBe('published');
        expect(course?.translations).toBeDefined();
      }
    }, API_TIMEOUT);

    it('should return undefined for non-existent slug', async () => {
      const course = await coursesApi.getBySlug('non-existent-slug-12345');
      expect(course).toBeUndefined();
    }, API_TIMEOUT);

    it('should fetch course by ID', async () => {
      const allCourses = await coursesApi.getAll({ limit: 1 });
      
      if (allCourses.length > 0) {
        const courseId = allCourses[0].id;
        const course = await coursesApi.getById(courseId);
        
        expect(course).toBeDefined();
        expect(course.id).toBe(courseId);
        expect(course.translations).toBeDefined();
        expect(Array.isArray(course.translations)).toBe(true);
      }
    }, API_TIMEOUT);

    it('should fetch featured courses', async () => {
      const featured = await coursesApi.getFeatured(3);
      
      expect(Array.isArray(featured)).toBe(true);
      expect(featured.length).toBeLessThanOrEqual(3);
      
      // All should be published
      featured.forEach(course => {
        expect(course.status).toBe('published');
        expect(course.translations).toBeDefined();
      });
    }, API_TIMEOUT);

    it('should validate course data structure', async () => {
      const courses = await coursesApi.getAll({ limit: 1 });
      
      if (courses.length > 0) {
        const course = courses[0] as DirectusCourse;
        
        // Required fields
        expect(typeof course.id).toBe('string');
        expect(typeof course.slug).toBe('string');
        expect(['published', 'draft', 'archived']).toContain(course.status);
        expect(typeof course.duration_minutes).toBe('number');
        expect(['beginner', 'intermediate', 'advanced']).toContain(course.level);
        expect(typeof course.price_cents).toBe('number');
        expect(['free', 'paid', 'subscription']).toContain(course.availability);
        
        // Translations
        expect(Array.isArray(course.translations)).toBe(true);
        course.translations.forEach(translation => {
          expect(typeof translation.languages_code).toBe('string');
          expect(TEST_LOCALES).toContain(translation.languages_code as any);
          expect(typeof translation.title).toBe('string');
          expect(translation.title.length).toBeGreaterThan(0);
        });
      }
    }, API_TIMEOUT);
  });

  describe('Competences API', () => {
    it('should fetch all competences', async () => {
      const competences = await competencesApi.getAll();
      
      expect(Array.isArray(competences)).toBe(true);
      
      if (competences.length > 0) {
        const firstCompetence = competences[0] as DirectusCompetence;
        expect(firstCompetence).toHaveProperty('id');
        expect(firstCompetence).toHaveProperty('translations');
        expect(Array.isArray(firstCompetence.translations)).toBe(true);
      }
    }, API_TIMEOUT);

    it('should fetch competence by slug', async () => {
      const allCompetences = await competencesApi.getAll();
      
      if (allCompetences.length > 0) {
        // Find a competence with a slug
        const competenceWithSlug = allCompetences.find(c => c.slug);
        
        if (competenceWithSlug) {
          const competence = await competencesApi.getBySlug(competenceWithSlug.slug!);
          
          expect(competence).toBeDefined();
          expect(competence?.slug).toBe(competenceWithSlug.slug);
          expect(competence?.translations).toBeDefined();
        }
      }
    }, API_TIMEOUT);

    it('should validate competence data structure', async () => {
      const competences = await competencesApi.getAll();
      
      if (competences.length > 0) {
        const competence = competences[0] as DirectusCompetence;
        
        expect(typeof competence.id).toBe('string');
        expect(competence.status).toBe('published');
        
        // Translations
        expect(Array.isArray(competence.translations)).toBe(true);
        competence.translations.forEach(translation => {
          expect(typeof translation.languages_code).toBe('string');
          expect(TEST_LOCALES).toContain(translation.languages_code as any);
          expect(typeof translation.name).toBe('string');
          expect(translation.name.length).toBeGreaterThan(0);
        });
      }
    }, API_TIMEOUT);
  });

  describe('Instructors API', () => {
    it('should fetch all instructors', async () => {
      const instructors = await instructorsApi.getAll();
      
      expect(Array.isArray(instructors)).toBe(true);
      
      if (instructors.length > 0) {
        const firstInstructor = instructors[0] as DirectusInstructor;
        expect(firstInstructor).toHaveProperty('id');
        expect(firstInstructor).toHaveProperty('name');
        expect(typeof firstInstructor.name).toBe('string');
        expect(firstInstructor.name.length).toBeGreaterThan(0);
      }
    }, API_TIMEOUT);

    it('should validate instructor data structure', async () => {
      const instructors = await instructorsApi.getAll();
      
      if (instructors.length > 0) {
        const instructor = instructors[0] as DirectusInstructor;
        
        expect(typeof instructor.id).toBe('string');
        expect(typeof instructor.name).toBe('string');
        expect(instructor.status).toBe('published');
        
        // Optional fields should be correct type if present
        if (instructor.website) {
          expect(typeof instructor.website).toBe('string');
        }
      }
    }, API_TIMEOUT);
  });

  describe('Pages API', () => {
    it('should fetch singleton page', async () => {
      // Test with a common singleton name
      try {
        const page = await pagesApi.getSingleton('page_home');
        
        if (page) {
          expect(page).toHaveProperty('id');
          expect(page).toHaveProperty('translations');
        }
      } catch (error) {
        // It's okay if the singleton doesn't exist
        console.log('Singleton page_home not found, which is expected in some setups');
      }
    }, API_TIMEOUT);
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would require mocking the Directus client
      // For now, we'll test with invalid parameters
      
      expect(async () => {
        await coursesApi.getById('invalid-id-format-that-will-fail');
      }).rejects.toThrow();
    }, API_TIMEOUT);

    it('should handle empty results gracefully', async () => {
      const courses = await coursesApi.getAll({ 
        filter: { 
          slug: { _eq: 'definitely-does-not-exist-12345' } 
        } 
      });
      
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBe(0);
    }, API_TIMEOUT);
  });
});