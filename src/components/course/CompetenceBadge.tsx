'use client';

import { useTheme } from 'next-themes';
import { getCompetenceColor } from '@/lib/theme';
import { useEffect, useState } from 'react';

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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a neutral placeholder to prevent hydration mismatch
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          bg-gray-200 text-gray-800 transition-colors duration-200 ${className}`}
        title={title}
      >
        {title}
      </span>
    );
  }

  // Get the appropriate color based on current theme
  const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  const backgroundColor = getCompetenceColor(colorLight, colorDark, currentTheme);
  
  // Determine text color based on background brightness
  const getTextColor = (bgColor: string) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return dark text for light backgrounds, light text for dark backgrounds
    return luminance > 0.5 ? '#1A1A1A' : '#FFFFFF';
  };

  const textColor = getTextColor(backgroundColor);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        transition-all duration-200 hover:scale-105 ${className}`}
      style={{
        backgroundColor,
        color: textColor,
      }}
      title={title}
    >
      {title}
    </span>
  );
}