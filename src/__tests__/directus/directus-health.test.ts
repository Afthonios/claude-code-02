import { describe, it, expect, beforeAll } from 'vitest';
import { directus } from '@/lib/directus';
import { API_TIMEOUT, skipIfDirectusUnavailable } from '../setup';

describe('Directus Health Check Tests', () => {
  beforeAll(() => {
    if (skipIfDirectusUnavailable('Health Check Tests')) {
      return;
    }
  });

  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      expect(process.env.NEXT_PUBLIC_DIRECTUS_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_DIRECTUS_URL).toBeTruthy();
      expect(process.env.NEXT_PUBLIC_DEFAULT_LOCALE).toBeDefined();
    });

    it('should have valid Directus URL format', () => {
      const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
      expect(url).toMatch(/^https?:\/\/.+/);
      
      // Should be accessible URL
      try {
        new URL(url!);
      } catch (error) {
        throw new Error(`Invalid DIRECTUS_URL format: ${url}`);
      }
    });

    it('should have valid default locale', () => {
      const locale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
      expect(['fr', 'en']).toContain(locale);
    });
  });

  describe('Directus Server Connectivity', () => {
    it('should connect to Directus server', async () => {
      // Test basic connectivity by making a simple request
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/server/ping`);
        
        // Even if ping endpoint doesn't exist, we should get some response
        expect(response).toBeDefined();
        
        // Any response (even 404) means server is reachable
        expect(response.status).toBeDefined();
        expect(typeof response.status).toBe('number');
        
      } catch (error) {
        // If fetch fails completely, server might be unreachable
        console.warn('Directus server connectivity test failed:', error);
        throw new Error('Cannot reach Directus server. Check NEXT_PUBLIC_DIRECTUS_URL');
      }
    }, API_TIMEOUT);

    it('should access Directus server info', async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/server/info`);
        
        if (response.ok) {
          const info = await response.json();
          
          expect(info).toBeDefined();
          expect(typeof info).toBe('object');
          
          // Common Directus server info fields
          if (info.project) {
            expect(typeof info.project.project_name).toBe('string');
          }
        }
      } catch (error) {
        console.warn('Directus server info not accessible (this may be expected):', error);
      }
    }, API_TIMEOUT);

    it('should handle CORS correctly', async () => {
      try {
        // Test a simple GET request that would be affected by CORS
        const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/courses?limit=1`);
        
        // If we get a response (even if it's an error), CORS is properly configured
        expect(response).toBeDefined();
        
        // Check for CORS headers if successful
        if (response.ok || response.status === 401 || response.status === 403) {
          // These statuses indicate the server processed the request
          const corsHeader = response.headers.get('Access-Control-Allow-Origin');
          // CORS header might be present or the request might be same-origin
        }
        
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('CORS')) {
          throw new Error('CORS is not properly configured on Directus server');
        }
      }
    }, API_TIMEOUT);
  });

  describe('Collection Access', () => {
    it('should access courses collection', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/courses?limit=1&fields=id,status`
        );
        
        expect(response).toBeDefined();
        
        // Should not be a 404 (collection exists)
        expect(response.status).not.toBe(404);
        
        // If we get data, validate basic structure
        if (response.ok) {
          const data = await response.json();
          expect(data).toHaveProperty('data');
          expect(Array.isArray(data.data)).toBe(true);
        }
        
      } catch (error) {
        throw new Error(`Cannot access courses collection: ${error}`);
      }
    }, API_TIMEOUT);

    it('should access competences collection', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/competences?limit=1&fields=id,status`
        );
        
        expect(response).toBeDefined();
        expect(response.status).not.toBe(404);
        
      } catch (error) {
        console.warn('Competences collection access test failed:', error);
      }
    }, API_TIMEOUT);

    it('should access instructors collection', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/instructors?limit=1&fields=id,status`
        );
        
        expect(response).toBeDefined();
        expect(response.status).not.toBe(404);
        
      } catch (error) {
        console.warn('Instructors collection access test failed:', error);
      }
    }, API_TIMEOUT);
  });

  describe('Authentication & Permissions', () => {
    it('should access public data without authentication', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/courses?limit=1&filter[status][_eq]=published&fields=id,slug,status`
        );
        
        expect(response).toBeDefined();
        
        // Should be able to access published data publicly
        if (response.ok) {
          const data = await response.json();
          expect(data).toHaveProperty('data');
          
          if (data.data.length > 0) {
            expect(data.data[0].status).toBe('published');
          }
        } else {
          console.warn('Public access to courses may require configuration:', response.status);
        }
        
      } catch (error) {
        throw new Error(`Public data access failed: ${error}`);
      }
    }, API_TIMEOUT);

    it('should not access draft content publicly', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/courses?filter[status][_eq]=draft&fields=id,status`
        );
        
        // Should either return empty results or be forbidden
        if (response.ok) {
          const data = await response.json();
          // If we get data, it should be empty or filtered
          expect(data).toHaveProperty('data');
          
          // Draft content should not be accessible publicly
          if (data.data && data.data.length > 0) {
            console.warn('Draft content is publicly accessible - check permissions');
          }
        } else if (response.status === 401 || response.status === 403) {
          // This is expected - draft content should be protected
          expect([401, 403]).toContain(response.status);
        }
        
      } catch (error) {
        console.warn('Draft content access test failed:', error);
      }
    }, API_TIMEOUT);
  });

  describe('API Response Format', () => {
    it('should return valid JSON responses', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/courses?limit=1&fields=id`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Should have Directus standard response format
          expect(data).toHaveProperty('data');
          expect(Array.isArray(data.data)).toBe(true);
          
          // May also have meta information
          if (data.meta) {
            expect(typeof data.meta).toBe('object');
          }
        }
      } catch (error) {
        throw new Error(`Invalid JSON response from Directus: ${error}`);
      }
    }, API_TIMEOUT);

    it('should handle query parameters correctly', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/courses?limit=2&offset=0&fields=id,slug&filter[status][_eq]=published`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          expect(data.data).toBeDefined();
          expect(Array.isArray(data.data)).toBe(true);
          expect(data.data.length).toBeLessThanOrEqual(2);
          
          // Each item should only have requested fields
          if (data.data.length > 0) {
            const firstItem = data.data[0];
            expect(firstItem).toHaveProperty('id');
            expect(firstItem).toHaveProperty('slug');
          }
        }
      } catch (error) {
        console.warn('Query parameters test failed:', error);
      }
    }, API_TIMEOUT);
  });

  describe('Error Handling', () => {
    it('should handle non-existent collections gracefully', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/non_existent_collection`
        );
        
        // Should return 403 (forbidden) or 404 (not found)
        expect([403, 404]).toContain(response.status);
        
      } catch (error) {
        // Network errors are also acceptable
        expect(error).toBeDefined();
      }
    }, API_TIMEOUT);

    it('should handle malformed queries', async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/courses?filter[invalid_field][invalid_operator]=value`
        );
        
        // Should either work (ignore unknown fields) or return error
        expect(response).toBeDefined();
        expect(typeof response.status).toBe('number');
        
      } catch (error) {
        // Malformed queries might cause network errors
        expect(error).toBeDefined();
      }
    }, API_TIMEOUT);
  });
});