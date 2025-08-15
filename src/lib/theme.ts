/**
 * Centralized theme configuration for Afthonios
 * Manages brand colors, theme variants, and competence colors
 */

// Afthonios brand colors
export const brandColors = {
  primary: '#C2410C',      // Afthonios orange
  secondary: '#1E3A8A',    // Afthonios blue
  accent: '#F2B705',       // Afthonios yellow
  darkBg: '#1E4E79',       // Dark theme background
  textLight: '#1A1A1A',    // Light theme text
  textDark: '#FFFFFF',     // Dark theme text
} as const;

// Competence colors - from Directus API structure
export const competenceColors = {
  // Main competence colors with light/dark variants
  assertiveness: {
    light: '#F1D0F8',
    dark: '#B084CC'
  },
  efficiency: {
    light: '#F8E3BF',
    dark: '#D4B896'
  },
  collaboration: {
    light: '#C5D6FB',
    dark: '#8FAEF5'
  },
  agility: {
    light: '#F9F493',
    dark: '#E6D55A'
  },
  communication: {
    light: '#C3F7D0',
    dark: '#84E89E'
  },
  management: {
    light: '#FFC5C3',
    dark: '#FF9B98'
  },
  // Fallback colors
  default: {
    light: '#E5E7EB',
    dark: '#9CA3AF'
  }
} as const;

// Theme configuration for next-themes
export const themeConfig = {
  attribute: 'class',
  defaultTheme: 'system',
  enableSystem: true,
  storageKey: 'theme',
  themes: ['light', 'dark', 'system'],
  disableTransitionOnChange: true,
} as const;

// CSS variable mappings for dynamic theming
export const cssVariables = {
  light: {
    // Background colors
    '--background': '0 0% 100%',
    '--foreground': '0 0% 10%',
    '--card': '0 0% 100%',
    '--card-foreground': '0 0% 10%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '0 0% 10%',
    
    // Brand colors
    '--primary': '14 86% 41%',          // #C2410C
    '--primary-foreground': '0 0% 100%',
    '--secondary': '221 83% 53%',       // #1E3A8A  
    '--secondary-foreground': '0 0% 100%',
    '--accent': '47 95% 48%',           // #F2B705
    '--accent-foreground': '0 0% 10%',
    
    // UI colors
    '--muted': '24 33% 95%',
    '--muted-foreground': '0 0% 30%',
    '--border': '0 0% 90%',
    '--input': '0 0% 90%',
    '--ring': '14 86% 41%',
    
    // Destructive
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '0 0% 98%',
  },
  dark: {
    // Background colors  
    '--background': '221 83% 20%',      // Darker version of secondary
    '--foreground': '0 0% 100%',
    '--card': '221 83% 25%',
    '--card-foreground': '0 0% 100%',
    '--popover': '221 83% 25%',
    '--popover-foreground': '0 0% 100%',
    
    // Brand colors (keep same hues)
    '--primary': '14 86% 41%',          // #C2410C
    '--primary-foreground': '0 0% 100%',
    '--secondary': '221 83% 53%',       // #1E3A8A
    '--secondary-foreground': '0 0% 100%',
    '--accent': '47 95% 48%',           // #F2B705
    '--accent-foreground': '0 0% 10%',
    
    // UI colors
    '--muted': '221 83% 15%',
    '--muted-foreground': '0 0% 80%',
    '--border': '221 83% 30%',
    '--input': '221 83% 30%',
    '--ring': '14 86% 41%',
    
    // Destructive
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '0 0% 98%',
  }
} as const;

// Helper function to get competence color by ID or fallback
export function getCompetenceColor(colorLight?: string, colorDark?: string, theme: 'light' | 'dark' = 'light') {
  // If we have custom colors from Directus, use them
  if (colorLight && colorDark) {
    const color = theme === 'light' ? colorLight : colorDark;
    return color.startsWith('#') ? color : `#${color}`;
  }
  
  // Fallback to default competence colors
  return theme === 'light' 
    ? competenceColors.default.light 
    : competenceColors.default.dark;
}

// Helper function to convert hex to HSL for CSS variables
export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Type definitions
export type ThemeMode = 'light' | 'dark' | 'system';
export type CompetenceColorKey = keyof typeof competenceColors;
export type BrandColorKey = keyof typeof brandColors;

const themeModule = {
  brandColors,
  competenceColors,
  themeConfig,
  cssVariables,
  getCompetenceColor,
  hexToHsl,
};

export default themeModule;