import { describe, it, expect, beforeAll } from 'vitest';
import { coursesApi, competencesApi } from '@/lib/directus';
import { 
  filterTranslations, 
  formatCurrency, 
  formatDuration, 
  getAssetUrl, 
  getAssetUrlWithTransforms,
  generateMetadata
} from '@/lib/directus';
import { API_TIMEOUT, skipIfDirectusUnavailable, TEST_LOCALES } from '../setup';

describe('Directus Data Validation Tests', () => {
  beforeAll(() => {
    if (skipIfDirectusUnavailable('Data Validation Tests')) {
      return;
    }
  });

  describe('Translation Filtering', () => {
    it('should filter translations by locale', async () => {
      const courses = await coursesApi.getAll({ limit: 1 });
      
      if (courses.length > 0) {
        const course = courses[0];
        const frTranslation = filterTranslations(course.translations, 'fr');
        const enTranslation = filterTranslations(course.translations, 'en');
        
        if (frTranslation) {
          expect(frTranslation.languages_code).toBe('fr');
          expect(typeof frTranslation.title).toBe('string');
        }
        
        if (enTranslation) {
          expect(enTranslation.languages_code).toBe('en');
          expect(typeof enTranslation.title).toBe('string');
        }
      }
    }, API_TIMEOUT);

    it('should fallback to French when translation not found', () => {
      const mockTranslations = [
        { 
          id: '1', 
          courses_id: '1', 
          languages_code: 'fr' as const, 
          title: 'Titre français', 
          summary: 'Résumé', 
          description: 'Description' 
        }
      ];
      
      const result = filterTranslations(mockTranslations, 'de'); // German not available
      expect(result).toBeDefined();
      expect(result?.languages_code).toBe('fr');
    });

    it('should return first translation as last fallback', () => {
      const mockTranslations = [
        { 
          id: '1', 
          courses_id: '1', 
          languages_code: 'en' as const, 
          title: 'English title', 
          summary: 'Summary', 
          description: 'Description' 
        }
      ];
      
      const result = filterTranslations(mockTranslations, 'de');
      expect(result).toBeDefined();
      expect(result?.languages_code).toBe('en');
    });

    it('should handle empty translations array', () => {
      const result = filterTranslations([], 'fr');
      expect(result).toBeUndefined();
    });

    it('should handle undefined translations', () => {
      const result = filterTranslations(undefined, 'fr');
      expect(result).toBeUndefined();
    });
  });

  describe('Currency Formatting', () => {
    it('should format EUR currency correctly', () => {
      expect(formatCurrency(2500)).toBe('25,00 €');
      expect(formatCurrency(0)).toBe('0,00 €');
      expect(formatCurrency(999)).toBe('9,99 €');
    });

    it('should format USD currency correctly', () => {
      expect(formatCurrency(2500, 'USD', 'en-US')).toBe('$25.00');
      expect(formatCurrency(999, 'USD', 'en-US')).toBe('$9.99');
    });

    it('should handle different locales', () => {
      expect(formatCurrency(2500, 'EUR', 'fr-FR')).toBe('25,00 €');
      expect(formatCurrency(2500, 'EUR', 'en-GB')).toBe('€25.00');
    });
  });

  describe('Duration Formatting', () => {
    it('should format minutes correctly in French', () => {
      expect(formatDuration(30, 'fr')).toBe('30 min');
      expect(formatDuration(60, 'fr')).toBe('1h');
      expect(formatDuration(90, 'fr')).toBe('1h 30min');
      expect(formatDuration(120, 'fr')).toBe('2h');
      expect(formatDuration(135, 'fr')).toBe('2h 15min');
    });

    it('should format minutes correctly in English', () => {
      expect(formatDuration(30, 'en')).toBe('30 min');
      expect(formatDuration(60, 'en')).toBe('1h');
      expect(formatDuration(90, 'en')).toBe('1h 30m');
      expect(formatDuration(120, 'en')).toBe('2h');
      expect(formatDuration(135, 'en')).toBe('2h 15m');
    });

    it('should default to French formatting', () => {
      expect(formatDuration(90)).toBe('1h 30min');
    });
  });

  describe('Asset URL Generation', () => {
    it('should generate asset URLs correctly', () => {
      const assetId = 'test-asset-id-123';
      const url = getAssetUrl(assetId);
      
      expect(url).toBe('https://api.afthonios.com/assets/test-asset-id-123');
    });

    it('should handle empty/null asset IDs', () => {
      expect(getAssetUrl(null)).toBe('');
      expect(getAssetUrl(undefined)).toBe('');
      expect(getAssetUrl('')).toBe('');
    });

    it('should generate transformed asset URLs', () => {
      const assetId = 'test-asset-id-123';
      const url = getAssetUrlWithTransforms(assetId, {
        width: 300,
        height: 200,
        quality: 80,
        fit: 'cover',
        format: 'webp'
      });
      
      expect(url).toContain('https://api.afthonios.com/assets/test-asset-id-123');
      expect(url).toContain('width=300');
      expect(url).toContain('height=200');
      expect(url).toContain('quality=80');
      expect(url).toContain('fit=cover');
      expect(url).toContain('format=webp');
    });

    it('should handle transforms with some parameters', () => {
      const assetId = 'test-asset-id-123';
      const url = getAssetUrlWithTransforms(assetId, {
        width: 300,
        format: 'auto'
      });
      
      expect(url).toContain('width=300');
      expect(url).toContain('format=auto');
      expect(url).not.toContain('height=');
      expect(url).not.toContain('quality=');
    });

    it('should handle no transforms', () => {
      const assetId = 'test-asset-id-123';
      const url = getAssetUrlWithTransforms(assetId);
      
      expect(url).toBe('https://api.afthonios.com/assets/test-asset-id-123');
    });
  });

  describe('Metadata Generation', () => {
    it('should generate metadata from course translation', () => {
      const courseTranslation = {
        title: 'Test Course Title',
        summary: 'Test course summary description',
        seo_title: 'SEO Title',
        seo_description: 'SEO Description',
        og_image: 'test-og-image-id'
      };
      
      const metadata = generateMetadata(courseTranslation, 'fr');
      
      expect(metadata.title).toBe('SEO Title');
      expect(metadata.description).toBe('SEO Description');
      expect(metadata.openGraph.title).toBe('SEO Title');
      expect(metadata.openGraph.description).toBe('SEO Description');
      expect(metadata.openGraph.locale).toBe('fr');
      expect(metadata.openGraph.images).toContain('https://api.afthonios.com/assets/test-og-image-id');
    });

    it('should fallback to title and summary when SEO fields missing', () => {
      const courseTranslation = {
        title: 'Test Course Title',
        summary: 'Test course summary description'
      };
      
      const metadata = generateMetadata(courseTranslation, 'en');
      
      expect(metadata.title).toBe('Test Course Title');
      expect(metadata.description).toBe('Test course summary description');
      expect(metadata.openGraph.title).toBe('Test Course Title');
      expect(metadata.openGraph.description).toBe('Test course summary description');
    });

    it('should use default OG image when none provided', () => {
      const courseTranslation = {
        title: 'Test Course Title',
        summary: 'Test course summary description'
      };
      
      const metadata = generateMetadata(courseTranslation, 'fr');
      
      expect(metadata.openGraph.images).toContain('https://afthonios.com/og-default.png');
    });

    it('should use custom base URL', () => {
      const courseTranslation = {
        title: 'Test Course Title',
        summary: 'Test course summary description'
      };
      
      const metadata = generateMetadata(courseTranslation, 'fr', 'https://custom.domain.com');
      
      expect(metadata.openGraph.images).toContain('https://custom.domain.com/og-default.png');
    });
  });

  describe('Real Data Structure Validation', () => {
    it('should validate real course data matches TypeScript interface', async () => {
      const courses = await coursesApi.getAll({ limit: 3 });
      
      courses.forEach((course, index) => {
        // Test core properties
        expect(course.id, `Course ${index} missing id`).toBeDefined();
        expect(typeof course.id).toBe('string');
        expect(course.slug, `Course ${index} missing slug`).toBeDefined();
        expect(typeof course.slug).toBe('string');
        
        // Test enum values
        expect(['published', 'draft', 'archived']).toContain(course.status);
        expect(['beginner', 'intermediate', 'advanced']).toContain(course.level);
        expect(['free', 'paid', 'subscription']).toContain(course.availability);
        
        // Test numeric fields
        expect(typeof course.duration_minutes).toBe('number');
        expect(course.duration_minutes).toBeGreaterThan(0);
        expect(typeof course.price_cents).toBe('number');
        expect(course.price_cents).toBeGreaterThanOrEqual(0);
        
        // Test translations
        expect(Array.isArray(course.translations)).toBe(true);
        expect(course.translations.length).toBeGreaterThan(0);
        
        course.translations.forEach((translation, tIndex) => {
          expect(typeof translation.id).toBe('string');
          expect(typeof translation.courses_id).toBe('string');
          expect(TEST_LOCALES).toContain(translation.languages_code);
          expect(typeof translation.title).toBe('string');
          expect(translation.title.length).toBeGreaterThan(0);
          expect(typeof translation.summary).toBe('string');
          expect(typeof translation.description).toBe('string');
        });
      });
    }, API_TIMEOUT);

    it('should validate real competence data matches TypeScript interface', async () => {
      const competences = await competencesApi.getAll();
      
      competences.slice(0, 3).forEach((competence, index) => {
        expect(competence.id, `Competence ${index} missing id`).toBeDefined();
        expect(typeof competence.id).toBe('string');
        expect(competence.status).toBe('published');
        
        // Test translations
        expect(Array.isArray(competence.translations)).toBe(true);
        expect(competence.translations.length).toBeGreaterThan(0);
        
        competence.translations.forEach(translation => {
          expect(typeof translation.id).toBe('string');
          expect(typeof translation.competences_id).toBe('string');
          expect(TEST_LOCALES).toContain(translation.languages_code);
          expect(typeof translation.name).toBe('string');
          expect(translation.name.length).toBeGreaterThan(0);
        });
      });
    }, API_TIMEOUT);
  });
});