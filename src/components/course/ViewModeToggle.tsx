'use client';

import { useTranslations } from 'next-intl';

interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200 ${
          viewMode === 'grid'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
        aria-label={t('viewMode.grid')}
        title={t('viewMode.grid')}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
        </svg>
        <span className="ml-1 text-sm hidden sm:inline">
          {t('viewMode.grid')}
        </span>
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
        aria-label={t('viewMode.list')}
        title={t('viewMode.list')}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
        <span className="ml-1 text-sm hidden sm:inline">
          {t('viewMode.list')}
        </span>
      </button>
    </div>
  );
}