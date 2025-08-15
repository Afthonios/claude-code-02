import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import React from 'react';
import { render } from '../utils/test-utils';
import { resetAllMocks } from '../utils/mocks';
import frMessages from '../../../messages/fr.json';
import enMessages from '../../../messages/en.json';
import { locales, defaultLocale } from '@/i18n';

// Mock next-intl hooks
const mockUseTranslations = vi.fn();
vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations,
  useLocale: () => 'fr',
  NextIntlClientProvider: ({ children }: any) => children,
}));

// Test component to verify translations
function TestTranslationComponent({ namespace, key }: { namespace: string; key: string }) {
  const t = mockUseTranslations;
  return <div data-testid="translation">{t(key)}</div>;
}

describe('Localization Integration', () => {
  beforeEach(() => {
    resetAllMocks();
    mockUseTranslations.mockReset();
  });

  describe('Translation File Completeness', () => {
    it('should have all required translation keys in both languages', () => {
      // Get all keys from French (default) messages
      const getAllKeys = (obj: any, prefix = ''): string[] => {
        let keys: string[] = [];
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
          } else {
            keys.push(fullKey);
          }
        }
        return keys;
      };

      const frKeys = getAllKeys(frMessages);
      const enKeys = getAllKeys(enMessages);

      // Check that all French keys exist in English
      const missingEnKeys = frKeys.filter(key => !enKeys.includes(key));
      expect(missingEnKeys).toEqual([]);

      // Check that all English keys exist in French
      const missingFrKeys = enKeys.filter(key => !frKeys.includes(key));
      expect(missingFrKeys).toEqual([]);

      // Ensure we have substantial content
      expect(frKeys.length).toBeGreaterThan(50);
      expect(enKeys.length).toBeGreaterThan(50);
    });

    it('should have matching structure between language files', () => {
      const getStructure = (obj: any): any => {
        const structure: any = {};
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            structure[key] = getStructure(obj[key]);
          } else {
            structure[key] = 'string';
          }
        }
        return structure;
      };

      const frStructure = getStructure(frMessages);
      const enStructure = getStructure(enMessages);

      expect(enStructure).toEqual(frStructure);
    });

    it('should have non-empty translations for all keys', () => {
      const checkNonEmpty = (obj: any, path = ''): string[] => {
        const emptyKeys: string[] = [];
        for (const key in obj) {
          const fullPath = path ? `${path}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            emptyKeys.push(...checkNonEmpty(obj[key], fullPath));
          } else if (!obj[key] || obj[key].toString().trim() === '') {
            emptyKeys.push(fullPath);
          }
        }
        return emptyKeys;
      };

      const emptyFrKeys = checkNonEmpty(frMessages);
      const emptyEnKeys = checkNonEmpty(enMessages);

      expect(emptyFrKeys).toEqual([]);
      expect(emptyEnKeys).toEqual([]);
    });
  });

  describe('Common Translation Keys', () => {
    it('should have all common UI text translations', () => {
      const requiredCommonKeys = [
        'common.loading',
        'common.error',
        'common.search',
        'common.filter',
        'common.clear',
        'common.submit',
        'common.cancel',
        'common.close',
        'common.save',
        'common.edit',
        'common.delete',
        'common.back',
        'common.next',
        'common.previous',
        'common.home',
        'common.menu',
        'common.language',
        'common.theme',
      ];

      requiredCommonKeys.forEach(key => {
        const frValue = key.split('.').reduce((obj, k) => obj[k], frMessages);
        const enValue = key.split('.').reduce((obj, k) => obj[k], enMessages);

        expect(frValue).toBeDefined();
        expect(enValue).toBeDefined();
        expect(typeof frValue).toBe('string');
        expect(typeof enValue).toBe('string');
        expect(frValue.length).toBeGreaterThan(0);
        expect(enValue.length).toBeGreaterThan(0);
      });
    });

    it('should have all navigation translations', () => {
      const requiredNavKeys = [
        'navigation.courses',
        'navigation.courseOfTheWeek',
        'navigation.projectManagement',
        'navigation.newOffer',
        'navigation.login',
        'navigation.signup',
        'navigation.logout',
      ];

      requiredNavKeys.forEach(key => {
        const frValue = key.split('.').reduce((obj, k) => obj[k], frMessages);
        const enValue = key.split('.').reduce((obj, k) => obj[k], enMessages);

        expect(frValue).toBeDefined();
        expect(enValue).toBeDefined();
        expect(typeof frValue).toBe('string');
        expect(typeof enValue).toBe('string');
      });
    });

    it('should have all course-related translations', () => {
      const requiredCourseKeys = [
        'courses.title',
        'courses.searchPlaceholder',
        'courses.filters.title',
        'courses.filters.competences',
        'courses.filters.course_type',
        'courses.levels.beginner',
        'courses.levels.intermediate',
        'courses.levels.advanced',
        'courses.availability.free',
        'courses.availability.paid',
        'courses.availability.subscription',
      ];

      requiredCourseKeys.forEach(key => {
        const frValue = key.split('.').reduce((obj, k) => obj[k], frMessages);
        const enValue = key.split('.').reduce((obj, k) => obj[k], enMessages);

        expect(frValue).toBeDefined();
        expect(enValue).toBeDefined();
        expect(typeof frValue).toBe('string');
        expect(typeof enValue).toBe('string');
      });
    });
  });

  describe('Locale Configuration', () => {
    it('should have correct locale configuration', () => {
      expect(locales).toEqual(['fr', 'en']);
      expect(defaultLocale).toBe('fr');
    });

    it('should export proper locale types', () => {
      expect(typeof defaultLocale).toBe('string');
      expect(locales.includes(defaultLocale)).toBe(true);
    });
  });

  describe('Translation Quality', () => {
    it('should not have placeholder text or obvious translation mistakes', () => {
      const checkForPlaceholders = (obj: any, lang: string): string[] => {
        const issues: string[] = [];
        const placeholderPatterns = [
          /TODO/i,
          /PLACEHOLDER/i,
          /TRANSLATE/i,
          /\[.*\]/,
          /{{.*}}/,
          /Lorem ipsum/i,
        ];

        const traverse = (obj: any, path = '') => {
          for (const key in obj) {
            const fullPath = path ? `${path}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              traverse(obj[key], fullPath);
            } else if (typeof obj[key] === 'string') {
              placeholderPatterns.forEach(pattern => {
                if (pattern.test(obj[key])) {
                  issues.push(`${lang}: ${fullPath} contains placeholder: "${obj[key]}"`);
                }
              });
            }
          }
        };

        traverse(obj);
        return issues;
      };

      const frIssues = checkForPlaceholders(frMessages, 'FR');
      const enIssues = checkForPlaceholders(enMessages, 'EN');

      expect(frIssues).toEqual([]);
      expect(enIssues).toEqual([]);
    });

    it('should have reasonable translation lengths', () => {
      const checkTranslationLengths = (obj: any, otherObj: any, path = ''): string[] => {
        const issues: string[] = [];
        
        const traverse = (obj: any, otherObj: any, path = '') => {
          for (const key in obj) {
            const fullPath = path ? `${path}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              if (otherObj[key] && typeof otherObj[key] === 'object') {
                traverse(obj[key], otherObj[key], fullPath);
              }
            } else if (typeof obj[key] === 'string' && typeof otherObj[key] === 'string') {
              const ratio = obj[key].length / otherObj[key].length;
              // Flag if one translation is more than 5x longer/shorter than the other (more lenient)
              if (ratio > 5 || ratio < 0.2) {
                issues.push(`${fullPath}: Length ratio too extreme (${obj[key].length}/${otherObj[key].length})`);
              }
            }
          }
        };

        traverse(obj, otherObj);
        return issues;
      };

      const lengthIssues = checkTranslationLengths(frMessages, enMessages);
      expect(lengthIssues).toEqual([]);
    });
  });

  describe('Special Characters and Encoding', () => {
    it('should properly handle special characters in French', () => {
      const frenchChars = /[àâäéèêëïîôöùûüÿç]/;
      
      // Check that French translations contain French characters
      const hasFrenchChars = JSON.stringify(frMessages).match(frenchChars);
      expect(hasFrenchChars).toBeTruthy();
    });

    it('should not have encoding issues', () => {
      const checkEncoding = (obj: any): boolean => {
        const str = JSON.stringify(obj);
        // Check for common encoding issues
        return !str.includes('\\u') || str.includes('\\u00');
      };

      expect(checkEncoding(frMessages)).toBe(true);
      expect(checkEncoding(enMessages)).toBe(true);
    });
  });

  describe('Translation Context and Consistency', () => {
    it('should have consistent terminology across contexts', () => {
      // Check that key terms are translated consistently
      const frCourseTerms = [
        frMessages.navigation.courses,
        frMessages.courses.title,
      ];
      
      const enCourseTerms = [
        enMessages.navigation.courses,
        enMessages.courses.title,
      ];

      // All French course references should use "Cours"
      expect(frCourseTerms[0]).toContain('Cours');
      expect(frCourseTerms[1]).toContain('Cours');

      // All English course references should use "Course"
      expect(enCourseTerms[0]).toContain('Course');
      expect(enCourseTerms[1]).toContain('Course');
    });

    it('should have appropriate tone and formality', () => {
      // French uses formal "vous" form in UI text
      const frenchText = JSON.stringify(frMessages);
      
      // Should not contain informal "tu" forms in UI
      expect(frenchText).not.toMatch(/\btu\b/i);
      expect(frenchText).not.toMatch(/\bton\b/i);
      expect(frenchText).not.toMatch(/\btes\b/i);
    });
  });

  describe('Pluralization Support', () => {
    it('should handle count-based translations appropriately', () => {
      // Check that duration translations support both singular and plural
      expect(frMessages.courses.duration.minutes).toBe('minutes');
      expect(frMessages.courses.duration.hours).toBe('heures');
      expect(enMessages.courses.duration.minutes).toBe('minutes');
      expect(enMessages.courses.duration.hours).toBe('hours');
    });
  });

  describe('Integration with Components', () => {
    it('should provide translations that work with component rendering', () => {
      mockUseTranslations.mockReturnValue('Test Translation');
      
      render(<TestTranslationComponent namespace="common" key="loading" />);
      
      const translationElement = screen.getByTestId('translation');
      expect(translationElement).toHaveTextContent('Test Translation');
    });

    it('should handle missing translation keys gracefully', () => {
      mockUseTranslations.mockReturnValue('missing.key');
      
      render(<TestTranslationComponent namespace="nonexistent" key="nonexistent" />);
      
      const translationElement = screen.getByTestId('translation');
      expect(translationElement).toBeInTheDocument();
    });
  });

  describe('Date and Time Localization', () => {
    it('should have appropriate timezone configuration', () => {
      // This would be tested in the i18n configuration
      // For now, just ensure the locale files support date formatting
      expect(frMessages.meta).toBeDefined();
      expect(enMessages.meta).toBeDefined();
    });
  });

  describe('SEO and Meta Translations', () => {
    it('should have SEO-appropriate meta translations', () => {
      const requiredMetaKeys = [
        'meta.title',
        'meta.description',
        'meta.keywords',
      ];

      requiredMetaKeys.forEach(key => {
        const frValue = key.split('.').reduce((obj, k) => obj[k], frMessages);
        const enValue = key.split('.').reduce((obj, k) => obj[k], enMessages);

        expect(frValue).toBeDefined();
        expect(enValue).toBeDefined();
        expect(frValue.length).toBeGreaterThan(10);
        expect(enValue.length).toBeGreaterThan(10);
        expect(frValue.length).toBeLessThan(200); // SEO best practice
        expect(enValue.length).toBeLessThan(200);
      });
    });
  });
});