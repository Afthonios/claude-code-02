/**
 * Fallback competences used when Directus API is not available
 * Note: In production, real competence titles come from Directus competences.translations.card_title
 */

export interface CompetenceOption {
  value: string;
  label: string;
  title?: string;
  colorLight?: string;
  colorDark?: string;
  count?: number;
}

/**
 * Fallback competences with localized labels and colors
 */
export function getFallbackCompetences(locale: string): CompetenceOption[] {
  return [
    { 
      value: 'communication-fallback', 
      label: locale === 'fr' ? 'Communication et Relations' : 'Communication & Relations', 
      colorLight: '#3B82F6', 
      colorDark: '#1D4ED8' 
    },
    { 
      value: 'leadership-fallback', 
      label: locale === 'fr' ? 'Management et Leadership' : 'Management & Leadership', 
      colorLight: '#10B981', 
      colorDark: '#047857' 
    },
    { 
      value: 'strategic-fallback', 
      label: locale === 'fr' ? 'Leadership Stratégique & Vision Inspirante' : 'Strategic Leadership & Vision', 
      colorLight: '#EF4444', 
      colorDark: '#DC2626' 
    },
    { 
      value: 'innovation-fallback', 
      label: locale === 'fr' ? 'Conduite du Changement, Innovation & Inclusion' : 'Change Management & Innovation', 
      colorLight: '#8B5CF6', 
      colorDark: '#7C3AED' 
    },
    { 
      value: 'transformation-fallback', 
      label: locale === 'fr' ? 'Changement et Transformation Organisationnelle' : 'Organizational Transformation', 
      colorLight: '#06B6D4', 
      colorDark: '#0891B2' 
    },
    { 
      value: 'customer-fallback', 
      label: locale === 'fr' ? 'Orientation client' : 'Customer Focus', 
      colorLight: '#84CC16', 
      colorDark: '#65A30D' 
    },
    { 
      value: 'diversity-fallback', 
      label: locale === 'fr' ? 'Diversité et Inclusion' : 'Diversity & Inclusion', 
      colorLight: '#EC4899', 
      colorDark: '#DB2777' 
    },
    { 
      value: 'digital-fallback', 
      label: locale === 'fr' ? 'Transformation Digitale' : 'Digital Transformation', 
      colorLight: '#F59E0B', 
      colorDark: '#D97706' 
    }
  ];
}

/**
 * Maximum number of main competences to display
 */
export const MAX_MAIN_COMPETENCES = 8;