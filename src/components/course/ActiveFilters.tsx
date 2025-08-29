'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

interface FilterState {
  competences: string[];
  showBookmarked: boolean;
  courseType: string[];
  hideCompleted: boolean;
}

interface ActiveFiltersProps {
  filters: FilterState;
  searchQuery: string;
  onFilterRemove: (filterType: keyof FilterState, value: string) => void;
  onSearchClear: () => void;
  onClearAll: () => void;
  competenceOptions: Array<{ value: string; label: string; title?: string; colorLight?: string; colorDark?: string }>;
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
  const { resolvedTheme } = useTheme();

  const getFilterLabel = (filterType: keyof FilterState, value: string): string => {
    switch (filterType) {
      case 'competences':
        // Ensure both values are strings for comparison
        const found = competenceOptions.find(opt => String(opt.value) === String(value));
        // Use title for active filter display, fallback to label if title not available
        return found?.title || found?.label || `Competence ${value} (${competenceOptions.length} options available)`;
      case 'showBookmarked':
        return t('filters.showBookmarked');
      case 'courseType':
        if (value === 'Formation') return t('filters.courseType.formation');
        if (value === 'Parcours') return t('filters.courseType.parcours');
        return value;
      case 'hideCompleted':
        return t('filters.hideCompleted');
      default:
        return value;
    }
  };

  const getFilterColor = (filterType: keyof FilterState, value: string): { light?: string; dark?: string } => {
    switch (filterType) {
      case 'competences':
        // Ensure both values are strings for comparison
        const competence = competenceOptions.find(opt => String(opt.value) === String(value));
        const result: { light?: string; dark?: string } = {};
        if (competence?.colorLight) result.light = competence.colorLight;
        if (competence?.colorDark) result.dark = competence.colorDark;
        return result;
      default:
        return {};
    }
  };

  const getFilterTypeLabel = (filterType: keyof FilterState): string => {
    switch (filterType) {
      case 'competences':
        return t('filters.competences');
      case 'showBookmarked':
        return t('filters.showBookmarked');
      case 'courseType':
        return t('filters.course_type');
      case 'hideCompleted':
        return t('filters.hideCompleted');
      default:
        return filterType;
    }
  };

  const activeFilterItems = Object.entries(filters).flatMap(([filterType, values]) => {
    // Handle boolean filters (like showBookmarked)
    if (typeof values === 'boolean') {
      if (!values) return []; // Don't show inactive boolean filters
      return [{
        type: filterType as keyof FilterState,
        value: 'true',
        label: getFilterLabel(filterType as keyof FilterState, 'true'),
        typeLabel: getFilterTypeLabel(filterType as keyof FilterState),
        color: getFilterColor(filterType as keyof FilterState, 'true'),
      }];
    }
    
    // Handle array filters (like competences)
    if (Array.isArray(values)) {
      return values.map(value => ({
        type: filterType as keyof FilterState,
        value,
        label: getFilterLabel(filterType as keyof FilterState, value),
        typeLabel: getFilterTypeLabel(filterType as keyof FilterState),
        color: getFilterColor(filterType as keyof FilterState, value),
      }));
    }
    
    return [];
  });

  const hasActiveItems = activeFilterItems.length > 0 || searchQuery;

  if (!hasActiveItems) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('filters.activeFilters')}
        </h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {t('filters.clearAllFilters')}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Search query tag */}
        {searchQuery && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border-2 transition-all duration-200 ${
            resolvedTheme === 'dark' 
              ? 'bg-blue-800 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-500'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200 hover:border-blue-300'
          }`}>
            <span className="mr-1">Search:</span>
            <span className="font-medium">&quot;{searchQuery}&quot;</span>
            <button
              onClick={onSearchClear}
              className={`ml-2 transition-colors ${
                resolvedTheme === 'dark'
                  ? 'text-white hover:text-blue-100'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
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
          
          // Helper function to determine if a color is light or dark for text contrast
          const getTextColor = (hexColor: string) => {
            // In dark mode, prioritize white text for better visibility
            if (isDarkMode) {
              return '#ffffff'; // Always use white text in dark mode for colored badges
            }
            
            // In light mode, calculate brightness for contrast
            const hex = hexColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            // Simple brightness calculation
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            
            return brightness > 128 ? '#1f2937' : '#ffffff';
          };
          
          const lightColor = hasColor && item.color.light ? item.color.light : null;
          const darkColor = hasColor && item.color.dark ? item.color.dark : null;
          
          // Determine which color to use based on current theme
          const isDarkMode = resolvedTheme === 'dark';
          const currentColor = hasColor ? (isDarkMode && darkColor ? darkColor : lightColor) : null;
          
          // Get conditional classes for non-colored badges
          const getConditionalClasses = () => {
            if (currentColor) {
              return ''; // No default classes when we have colors
            }
            
            if (isDarkMode) {
              return 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500';
            } else {
              return 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 hover:border-gray-400';
            }
          };
          
          const colorStyle = currentColor ? {
            borderColor: currentColor,
            backgroundColor: `${currentColor}${isDarkMode ? '30' : '15'}`, // Much higher opacity in dark mode for better visibility
            color: getTextColor(currentColor),
            textShadow: isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none', // Add text shadow in dark mode for better readability
          } : {};
          
          return (
            <div
              key={`${item.type}-${item.value}-${index}`}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm border-2 transition-all duration-200 ${getConditionalClasses()}`}
              style={currentColor ? {
                borderColor: colorStyle.borderColor,
                backgroundColor: colorStyle.backgroundColor,
                textShadow: colorStyle.textShadow,
              } : {}}
            >
              {currentColor && (
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                  style={{ backgroundColor: currentColor }}
                />
              )}
              <span 
                className="font-medium"
                style={currentColor ? { color: getTextColor(currentColor) } : {}}
              >
                {item.label}
              </span>
              <button
                onClick={() => {
                  // For boolean filters, we pass a special value to indicate toggling off
                  if (item.type === 'showBookmarked' || item.type === 'hideCompleted') {
                    onFilterRemove(item.type, 'false');
                  } else {
                    onFilterRemove(item.type, item.value);
                  }
                }}
                className="ml-2 opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-110"
                aria-label={`Remove ${item.typeLabel} filter`}
                style={{ color: currentColor ? getTextColor(currentColor) : undefined }}
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