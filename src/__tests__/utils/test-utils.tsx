import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';

// Import test messages
import frMessages from '../../../messages/fr.json';
import enMessages from '../../../messages/en.json';

const messages = {
  fr: frMessages,
  en: enMessages,
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: 'fr' | 'en';
  theme?: 'light' | 'dark' | 'system';
}

// Custom render function that includes providers
function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { locale = 'fr', theme = 'light', ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem>
        <NextIntlClientProvider 
          locale={locale} 
          messages={messages[locale]}
          timeZone="Europe/Paris"
        >
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockCourse = (overrides = {}) => ({
  id: '1',
  slug: 'test-course',
  title: 'Test Course',
  subtitle: 'A test course',
  summary: 'This is a test course summary',
  description: 'This is a test course description',
  cover_image: null,
  gallery: [],
  duration_minutes: 120,
  level: 'beginner',
  tags: ['javascript', 'web'],
  price_cents: 0,
  currency: 'EUR',
  availability: 'free',
  status: 'published',
  date_created: '2024-01-01T00:00:00Z',
  date_updated: '2024-01-01T00:00:00Z',
  user_created: 'test-user',
  user_updated: 'test-user',
  competences: [],
  instructors: [],
  ...overrides,
});

export const createMockCompetence = (overrides = {}) => ({
  id: '1',
  title: 'JavaScript',
  description: 'JavaScript programming language',
  color: '#f7df1e',
  icon: 'js',
  status: 'published',
  date_created: '2024-01-01T00:00:00Z',
  date_updated: '2024-01-01T00:00:00Z',
  ...overrides,
});