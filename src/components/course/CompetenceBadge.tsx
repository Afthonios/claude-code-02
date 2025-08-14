'use client';

interface CompetenceBadgeProps {
  title: string;
  colorLight?: string;
  colorDark?: string;
  className?: string;
}

export default function CompetenceBadge({ 
  title, 
  colorLight, 
  colorDark, 
  className = '' 
}: CompetenceBadgeProps) {
  // Ensure colors have # prefix for CSS
  const formatColor = (color?: string) => {
    if (!color) return undefined;
    return color.startsWith('#') ? color : `#${color}`;
  };

  // Create CSS custom properties for dynamic colors
  const style = {
    '--competence-color-light': formatColor(colorLight) || '#3B82F6',
    '--competence-color-dark': formatColor(colorDark) || '#60A5FA',
  } as React.CSSProperties;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        bg-[var(--competence-color-light)] text-white
        dark:bg-[var(--competence-color-dark)] dark:text-gray-900
        transition-colors duration-200
        ${className}`}
      style={style}
      title={title}
    >
      {title}
    </span>
  );
}