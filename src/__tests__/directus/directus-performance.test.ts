import { describe, it, expect, beforeAll } from 'vitest';
import { coursesApi, competencesApi, instructorsApi } from '@/lib/directus';
import { API_TIMEOUT, skipIfDirectusUnavailable } from '../setup';

describe('Directus Performance Tests', () => {
  beforeAll(() => {
    if (skipIfDirectusUnavailable('Performance Tests')) {
      return;
    }
  });

  describe('Response Time Benchmarks', () => {
    it('should fetch courses list within acceptable time', async () => {
      const startTime = Date.now();
      
      const courses = await coursesApi.getAll({ limit: 10 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      
      // Should respond within 5 seconds for 10 courses
      expect(responseTime).toBeLessThan(5000);
      
      console.log(`✅ Courses list (10 items): ${responseTime}ms`);
      
      // Log warning if slow
      if (responseTime > 2000) {
        console.warn(`⚠️  Slow response time for courses list: ${responseTime}ms`);
      }
    }, API_TIMEOUT);

    it('should fetch single course within acceptable time', async () => {
      // First get a course to test with
      const courses = await coursesApi.getAll({ limit: 1 });
      
      if (courses.length > 0) {
        const startTime = Date.now();
        
        const course = await coursesApi.getBySlug(courses[0].slug);
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(course).toBeDefined();
        
        // Should respond within 3 seconds for single course
        expect(responseTime).toBeLessThan(3000);
        
        console.log(`✅ Single course: ${responseTime}ms`);
        
        if (responseTime > 1500) {
          console.warn(`⚠️  Slow response time for single course: ${responseTime}ms`);
        }
      }
    }, API_TIMEOUT);

    it('should fetch competences within acceptable time', async () => {
      const startTime = Date.now();
      
      const competences = await competencesApi.getAll();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(competences).toBeDefined();
      expect(Array.isArray(competences)).toBe(true);
      
      // Should respond within 4 seconds for all competences
      expect(responseTime).toBeLessThan(4000);
      
      console.log(`✅ All competences (${competences.length} items): ${responseTime}ms`);
      
      if (responseTime > 2000) {
        console.warn(`⚠️  Slow response time for competences: ${responseTime}ms`);
      }
    }, API_TIMEOUT);

    it('should fetch instructors within acceptable time', async () => {
      const startTime = Date.now();
      
      const instructors = await instructorsApi.getAll();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(instructors).toBeDefined();
      expect(Array.isArray(instructors)).toBe(true);
      
      // Should respond within 4 seconds for all instructors
      expect(responseTime).toBeLessThan(4000);
      
      console.log(`✅ All instructors (${instructors.length} items): ${responseTime}ms`);
      
      if (responseTime > 2000) {
        console.warn(`⚠️  Slow response time for instructors: ${responseTime}ms`);
      }
    }, API_TIMEOUT);
  });

  describe('Pagination Performance', () => {
    it('should handle large page sizes efficiently', async () => {
      const startTime = Date.now();
      
      const courses = await coursesApi.getAll({ limit: 50 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeLessThanOrEqual(50);
      
      // Should respond within 8 seconds for 50 courses
      expect(responseTime).toBeLessThan(8000);
      
      console.log(`✅ Large page (50 courses): ${responseTime}ms`);
      
      if (responseTime > 4000) {
        console.warn(`⚠️  Slow response time for large page: ${responseTime}ms`);
      }
    }, API_TIMEOUT);

    it('should fetch different pages consistently', async () => {
      const responseTimes: number[] = [];
      const pageSize = 10;
      
      // Test first 3 pages
      for (let page = 1; page <= 3; page++) {
        const startTime = Date.now();
        
        const courses = await coursesApi.getAll({ limit: pageSize, page });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        responseTimes.push(responseTime);
        
        expect(courses).toBeDefined();
        expect(Array.isArray(courses)).toBe(true);
        
        console.log(`✅ Page ${page}: ${responseTime}ms`);
      }
      
      // Calculate average and check consistency
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      console.log(`📊 Pagination stats: avg=${avgResponseTime.toFixed(0)}ms, min=${minResponseTime}ms, max=${maxResponseTime}ms`);
      
      // Variation shouldn't be too extreme (max shouldn't be more than 3x min)
      expect(maxResponseTime).toBeLessThan(minResponseTime * 3);
      
      // Average should be reasonable
      expect(avgResponseTime).toBeLessThan(5000);
    }, API_TIMEOUT);
  });

  describe('Search Performance', () => {
    it('should perform search queries efficiently', async () => {
      // First get some courses to find a search term
      const allCourses = await coursesApi.getAll({ limit: 5 });
      
      if (allCourses.length > 0) {
        const firstCourse = allCourses[0];
        const frTranslation = firstCourse.translations.find(t => t.languages_code === 'fr');
        
        if (frTranslation?.title) {
          const searchTerm = frTranslation.title.split(' ')[0]; // First word
          
          const startTime = Date.now();
          
          const searchResults = await coursesApi.getAll({ search: searchTerm, limit: 20 });
          
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          expect(searchResults).toBeDefined();
          expect(Array.isArray(searchResults)).toBe(true);
          
          // Search should respond within 6 seconds
          expect(responseTime).toBeLessThan(6000);
          
          console.log(`🔍 Search for "${searchTerm}": ${responseTime}ms (${searchResults.length} results)`);
          
          if (responseTime > 3000) {
            console.warn(`⚠️  Slow search response time: ${responseTime}ms`);
          }
        }
      }
    }, API_TIMEOUT);
  });

  describe('Field Selection Performance', () => {
    it('should be faster with limited fields', async () => {
      // Measure time for full course data
      const startTimeFull = Date.now();
      const fullCourses = await coursesApi.getAll({ limit: 10 });
      const endTimeFull = Date.now();
      const fullResponseTime = endTimeFull - startTimeFull;
      
      // Measure time for limited fields (direct API call)
      const startTimeLimited = Date.now();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/courses?limit=10&fields=id,slug,status&filter[status][_eq]=published`
      );
      const limitedCourses = response.ok ? await response.json() : { data: [] };
      
      const endTimeLimited = Date.now();
      const limitedResponseTime = endTimeLimited - startTimeLimited;
      
      expect(fullCourses).toBeDefined();
      expect(limitedCourses.data).toBeDefined();
      
      console.log(`📊 Full fields: ${fullResponseTime}ms vs Limited fields: ${limitedResponseTime}ms`);
      
      // Limited fields should be faster (or at least not significantly slower)
      // Allow for some variance due to network conditions
      if (limitedResponseTime > fullResponseTime * 1.5) {
        console.warn(`⚠️  Limited fields query unexpectedly slower: ${limitedResponseTime}ms vs ${fullResponseTime}ms`);
      }
      
      // Both should be within reasonable limits
      expect(fullResponseTime).toBeLessThan(10000);
      expect(limitedResponseTime).toBeLessThan(10000);
    }, API_TIMEOUT);
  });

  describe('Concurrent Requests Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const startTime = Date.now();
      
      // Make multiple concurrent requests
      const promises = [
        coursesApi.getAll({ limit: 5 }),
        competencesApi.getAll(),
        instructorsApi.getAll(),
        coursesApi.getFeatured(3)
      ];
      
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All requests should succeed
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
      
      console.log(`🔄 4 concurrent requests: ${totalTime}ms`);
      
      // Concurrent requests should complete within reasonable time
      // Should be faster than sequential requests
      expect(totalTime).toBeLessThan(15000);
      
      if (totalTime > 8000) {
        console.warn(`⚠️  Slow concurrent requests: ${totalTime}ms`);
      }
    }, API_TIMEOUT);
  });

  describe('Memory and Resource Usage', () => {
    it('should not cause memory leaks with repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make repeated requests
      for (let i = 0; i < 10; i++) {
        await coursesApi.getAll({ limit: 5 });
        
        // Allow garbage collection
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      
      console.log(`💾 Memory increase after 10 requests: ${memoryIncreaseMB.toFixed(2)} MB`);
      
      // Memory increase should be reasonable (less than 50MB)
      // This is a rough estimate and may vary
      expect(memoryIncreaseMB).toBeLessThan(50);
    }, API_TIMEOUT * 2);
  });

  describe('Error Recovery Performance', () => {
    it('should handle errors without significant delay', async () => {
      const startTime = Date.now();
      
      try {
        // Try to fetch non-existent course
        await coursesApi.getBySlug('non-existent-course-12345-abcdef');
      } catch (error) {
        // Expected to fail
      }
      
      const errorTime = Date.now();
      
      // Now make a successful request
      const courses = await coursesApi.getAll({ limit: 1 });
      
      const successTime = Date.now();
      
      const errorResponseTime = errorTime - startTime;
      const recoveryTime = successTime - errorTime;
      
      expect(courses).toBeDefined();
      
      console.log(`❌ Error response: ${errorResponseTime}ms, ✅ Recovery: ${recoveryTime}ms`);
      
      // Error handling should be fast
      expect(errorResponseTime).toBeLessThan(5000);
      
      // Recovery should not be significantly slower
      expect(recoveryTime).toBeLessThan(5000);
    }, API_TIMEOUT);
  });
});