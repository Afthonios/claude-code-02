'use client';

import { useTranslations } from 'next-intl';
import FilterDropdown from './FilterDropdown';

interface FilterState {
  competences: string[];
  showBookmarked: boolean;
  courseType: string[];
  hideCompleted: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  competenceOptions: Array<{ value: string; label: string }>;
  isOpen: boolean;
  onToggle: () => void;
  isPaidUser?: boolean; // Add prop to check if user has paid access
  courseTypeCounts?: { formation: number; parcours: number };
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  competenceOptions,
  isOpen,
  onToggle,
  isPaidUser = false,
  courseTypeCounts = { formation: 0, parcours: 0 },
}: FilterSidebarProps) {
  const t = useTranslations('courses');
  const tCommon = useTranslations('common');

  const handleFilterChange = (filterType: keyof FilterState, values: string[] | boolean) => {
    // Create a clean new filter state
    const newFilters = {
      competences: filters.competences,
      showBookmarked: filters.showBookmarked,
      courseType: filters.courseType,
      hideCompleted: filters.hideCompleted,
    };
    
    // Update the specific filter type
    (newFilters as any)[filterType] = values;
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      competences: [],
      showBookmarked: false,
      courseType: [],
      hideCompleted: false,
    });
  };

  const hasActiveFilters = filters.competences.length > 0 || filters.showBookmarked || filters.courseType.length > 0 || filters.hideCompleted;

  // Course type options with counts - use capitalized values to match Directus
  const courseTypeOptions = [
    { value: 'Formation', label: t('filters.courseType.formation'), count: courseTypeCounts.formation },
    { value: 'Parcours', label: t('filters.courseType.parcours'), count: courseTypeCounts.parcours },
  ];

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
                {t('filters.title')}
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
              {/* Course Type Filter - Formation first, then Parcours */}
              <div>
                <h3 className="text-sm font-medium text-card-foreground mb-3">
                  {t('filters.course_type')}
                </h3>
                <div className="space-y-2">
                  {courseTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.courseType.includes(option.value)}
                        onChange={(e) => {
                          // Either/or logic: only one can be selected at a time
                          if (e.target.checked) {
                            // Select this option and deselect any others
                            handleFilterChange('courseType', [option.value]);
                          } else {
                            // Uncheck: clear all selections
                            handleFilterChange('courseType', []);
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                      />
                      <span className="text-sm text-card-foreground">
                        {option.label}
                      </span>
                      {/* Show counts */}
                      <span className="text-xs text-muted-foreground">
                        ({option.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

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

              {/* Hide Completed Filter - Only for paid users */}
              {isPaidUser && (
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hideCompleted}
                      onChange={(e) => handleFilterChange('hideCompleted', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <span className="text-sm text-card-foreground">
                      {t('filters.hideCompleted')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (319)
                    </span>
                  </label>
                </div>
              )}

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