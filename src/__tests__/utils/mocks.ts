import { vi } from 'vitest';
import React from 'react';

// Mock next/navigation
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const mockPathname = '/fr/courses';
export const mockParams = { locale: 'fr' };
export const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useParams: () => mockParams,
  useSearchParams: () => mockSearchParams,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Globe: ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'globe-icon' },
      React.createElement('circle', { cx: '12', cy: '12', r: '10' })
    ),
  Search: ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'search-icon' },
      React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
      React.createElement('path', { d: 'm21 21-4.35-4.35' })
    ),
  Filter: ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'filter-icon' },
      React.createElement('polygon', { points: '22,3 2,3 10,12.46 10,19 14,21 14,12.46' })
    ),
  ChevronDown: ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'chevron-down-icon' },
      React.createElement('polyline', { points: '6,9 12,15 18,9' })
    ),
  Sun: ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'sun-icon' },
      React.createElement('circle', { cx: '12', cy: '12', r: '5' })
    ),
  Moon: ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'moon-icon' },
      React.createElement('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' })
    ),
}));

// Mock Directus API
export const mockCoursesApi = {
  getAll: vi.fn(),
  getById: vi.fn(),
  getBySlug: vi.fn(),
};

export const mockCompetencesApi = {
  getAll: vi.fn(),
  getById: vi.fn(),
};

vi.mock('@/lib/directus', () => ({
  coursesApi: mockCoursesApi,
  competencesApi: mockCompetencesApi,
}));

// Reset all mocks before each test
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
  mockRouter.prefetch.mockClear();
  mockCoursesApi.getAll.mockClear();
  mockCoursesApi.getById.mockClear();
  mockCoursesApi.getBySlug.mockClear();
  mockCompetencesApi.getAll.mockClear();
  mockCompetencesApi.getById.mockClear();
};