'use client';

import { useTranslations } from 'next-intl';
import FilterDropdown from './FilterDropdown';

interface FilterState {
  competences: string[];
  showBookmarked: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  competenceOptions: Array<{ value: string; label: string }>;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  competenceOptions,
  isOpen,
  onToggle,
}: FilterSidebarProps) {
  const t = useTranslations('courses');
  const tCommon = useTranslations('common');

  const handleFilterChange = (filterType: keyof FilterState, values: string[] | boolean) => {
    onFiltersChange({
      ...filters,
      [filterType]: values,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      competences: [],
      showBookmarked: false,
    });
  };

  const hasActiveFilters = filters.competences.length > 0 || filters.showBookmarked;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:transition-none`}
      >
        <div className="h-full w-80 lg:w-64 bg-card border-r border-border overflow-y-auto">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">
                {t('filters.title', 'Filters')}
              </h2>
              <button
                onClick={onToggle}
                className="lg:hidden p-2 text-muted-foreground hover:text-card-foreground"
                aria-label={tCommon('closeFilters')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Clear all filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full mb-4 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
              >
                {t('filters.clearAllFilters')}
              </button>
            )}

            {/* Filter sections */}
            <div className="space-y-6">
              {/* Bookmarks Filter */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showBookmarked}
                    onChange={(e) => handleFilterChange('showBookmarked', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <span className="text-sm font-medium text-card-foreground">
                    {t('filters.showBookmarked')}
                  </span>
                </label>
              </div>

              {/* Competences Filter */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {t('filters.competences')}
                </label>
                <FilterDropdown
                  label={t('filters.competences')}
                  value={filters.competences}
                  options={competenceOptions}
                  onChange={(values) => handleFilterChange('competences', values)}
                  placeholder={competenceOptions.length === 0 ? t('filters.loadingSkills') : t('filters.selectSkills')}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}