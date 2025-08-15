// Test setup file for Vitest
import { beforeAll } from 'vitest';

// Set up environment variables for testing
beforeAll(() => {
  process.env.NEXT_PUBLIC_DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'fr';
  process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://afthonios.com';
});

// Global test timeout (30 seconds for API calls)
export const API_TIMEOUT = 30000;

// Test data constants
export const TEST_LOCALES = ['fr', 'en'] as const;
export const TEST_COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const TEST_AVAILABILITY_OPTIONS = ['free', 'paid', 'subscription'] as const;
export const TEST_STATUS_OPTIONS = ['published', 'draft', 'archived'] as const;

// Helper function to check if we should run integration tests
export const shouldRunIntegrationTests = () => {
  return process.env.RUN_INTEGRATION_TESTS === 'true' || process.env.CI === 'true';
};

// Helper to skip tests when Directus is not accessible
export const skipIfDirectusUnavailable = (testName: string) => {
  if (!shouldRunIntegrationTests()) {
    console.log(`⏭️  Skipping ${testName} - set RUN_INTEGRATION_TESTS=true to enable`);
    return true;
  }
  return false;
};