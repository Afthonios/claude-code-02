'use client';

import { useTranslations } from 'next-intl';

interface FilterState {
  competences: string[];
}

interface ActiveFiltersProps {
  filters: FilterState;
  searchQuery: string;
  onFilterRemove: (filterType: keyof FilterState, value: string) => void;
  onSearchClear: () => void;
  onClearAll: () => void;
  competenceOptions: Array<{ value: string; label: string; colorLight?: string; colorDark?: string }>;
}

export default function ActiveFilters({
  filters,
  searchQuery,
  onFilterRemove,
  onSearchClear,
  onClearAll,
  competenceOptions,
}: ActiveFiltersProps) {
  const t = useTranslations('courses');

  const getFilterLabel = (filterType: keyof FilterState, value: string): string => {
    switch (filterType) {
      case 'competences':
        console.log('🔍 [ActiveFilters] Looking for competence with value:', value, typeof value);
        console.log('🔍 [ActiveFilters] Available competence options count:', competenceOptions.length);
        console.log('🔍 [ActiveFilters] Available competence options:', competenceOptions.map(opt => ({id: opt.value, label: opt.label})));
        // Ensure both values are strings for comparison
        const found = competenceOptions.find(opt => String(opt.value) === String(value));
        console.log('🔍 [ActiveFilters] Found competence:', found);
        const result = found?.label || `Competence ${value} (${competenceOptions.length} options available)`;
        console.log('🔍 [ActiveFilters] Returning:', result);
        return result;
      default:
        return value;
    }
  };

  const getFilterColor = (filterType: keyof FilterState, value: string): { light?: string; dark?: string } => {
    switch (filterType) {
      case 'competences':
        // Ensure both values are strings for comparison
        const competence = competenceOptions.find(opt => String(opt.value) === String(value));
        return {
          light: competence?.colorLight,
          dark: competence?.colorDark
        };
      default:
        return {};
    }
  };

  const getFilterTypeLabel = (filterType: keyof FilterState): string => {
    switch (filterType) {
      case 'competences':
        return t('filters.competences');
      default:
        return filterType;
    }
  };

  const activeFilterItems = Object.entries(filters).flatMap(([filterType, values]) =>
    values.map(value => ({
      type: filterType as keyof FilterState,
      value,
      label: getFilterLabel(filterType as keyof FilterState, value),
      typeLabel: getFilterTypeLabel(filterType as keyof FilterState),
      color: getFilterColor(filterType as keyof FilterState, value),
    }))
  );

  const hasActiveItems = activeFilterItems.length > 0 || searchQuery;

  if (!hasActiveItems) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Active filters
        </h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Clear all
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Search query tag */}
        {searchQuery && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
            <span className="mr-1">Search:</span>
            <span className="font-medium">&quot;{searchQuery}&quot;</span>
            <button
              onClick={onSearchClear}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Filter tags */}
        {activeFilterItems.map((item, index) => {
          const hasColor = item.color?.light && item.color?.dark;
          const colorStyle = hasColor ? {
            borderColor: `#${item.color.light}`,
            backgroundColor: `#${item.color.light}20`, // 20% opacity
          } : {};
          
          return (
            <div
              key={`${item.type}-${item.value}-${index}`}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm border-2 ${
                hasColor 
                  ? 'border-current text-gray-800 dark:text-gray-200' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
              style={colorStyle}
            >
              {hasColor && (
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                  style={{ backgroundColor: `#${item.color.light}` }}
                />
              )}
              <span className="font-medium">{item.label}</span>
              <button
                onClick={() => onFilterRemove(item.type, item.value)}
                className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label={`Remove ${item.typeLabel} filter`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}