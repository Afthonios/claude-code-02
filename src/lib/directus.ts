import { createDirectus, rest, readItems, readItem, readSingleton } from '@directus/sdk';
import type {
  DirectusCourse,
  DirectusCompetence,
  DirectusInstructor,
  DirectusCourseTranslation,
  DirectusCompetenceTranslation,
  DirectusCourseCompetence,
} from '@/types/directus';

// Directus client configured for public access only
// All collections (courses, competences, instructors) are accessed without authentication
const directus = createDirectus(
  process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com'
).with(rest());

export { directus };

export const coursesApi = {
  async getAll(options?: {
    limit?: number;
    page?: number;
    search?: string;
    filter?: Record<string, unknown>;
    sort?: string[];
  }) {
    const { limit = 1000, page = 1, search, filter, sort } = options || {};
    
    const query: Record<string, unknown> = {
      fields: [
        'id',
        'legacy_id',
        'status',
        'sort',
        'date_created',
        'date_updated',
        'duration',
        'course_type',
        'course_image',
        'translations.*',
        'competence.competences_id.id',
        'competence.competences_id.parent_competence.id',
        'competence.competences_id.parent_competence.color_light',
        'competence.competences_id.parent_competence.color_dark',
        'competence.competences_id.parent_competence.translations.*',
      ],
      limit,
      page,
      filter: {
        status: { _eq: 'published' },
        ...filter,
      },
    };

    if (search) {
      query.search = search;
    }

    if (sort) {
      query.sort = sort;
    }


    try {
      // On client side, skip SDK and go directly to API route to avoid CORS issues
      if (typeof window !== 'undefined') {
        // Skip SDK and fall through to the catch block to use API route
        throw new Error('CLIENT_SIDE_FALLBACK');
      }
      
      const response = await directus.request(
        readItems('courses', query)
      );
      return response as DirectusCourse[];
    } catch (error) {
      // Only log non-client-side fallback errors to avoid console noise
      if (error instanceof Error && error.message !== 'CLIENT_SIDE_FALLBACK') {
        console.error('🔍 [coursesApi] Directus SDK failed. Error:', error);
      }
      // Fallback to our Next.js API route to avoid CORS issues
      try {
        const url = new URL('/api/courses', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
        
        // Add parameters that will be forwarded to Directus
        url.searchParams.set('fields', 'id,legacy_id,status,duration,course_type,course_image,translations.*,competence.competences_id.*');
        url.searchParams.set('filter[status][_eq]', 'published');
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('page', page.toString());
        
        // Add filter parameters if they exist
        if (filter) {
          // Flatten nested filter objects for Directus API
          const flattenFilter = (obj: Record<string, unknown>, prefix = 'filter') => {
            Object.entries(obj).forEach(([key, value]) => {
              if (key === 'status') return; // status already added above
              
              const filterKey = `${prefix}[${key}]`;
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Recursively flatten nested objects
                flattenFilter(value, filterKey);
              } else {
                // Set the parameter with proper encoding
                if (Array.isArray(value)) {
                  url.searchParams.set(filterKey, value.join(','));
                } else {
                  url.searchParams.set(filterKey, String(value));
                }
              }
            });
          };
          
          flattenFilter(filter);
        }
        
        if (search) {
          url.searchParams.set('search', search);
        }
        
        if (sort && sort.length > 0) {
          url.searchParams.set('sort', sort.join(','));
        }

        const fetchResponse = await fetch(url.toString());
        if (!fetchResponse.ok) {
          console.error('🔍 [coursesApi] Fallback fetch failed with status:', fetchResponse.status);
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const data = await fetchResponse.json();
        return data.data as DirectusCourse[];
      } catch (fallbackError) {
        console.error('🔍 [coursesApi] All attempts failed:', fallbackError);
        // Return empty array as final fallback to prevent app crash
        return [];
      }
    }
  },

  async getBySlug(slug: string) {
    try {
      // First, try to get the course using legacy_id format (add "f-" prefix)
      const legacyId = `f-${slug}`;
      
      const response = await directus.request(
        readItems('courses', {
          fields: [
            'id',
            'legacy_id',
            'status',
            'date_created',
            'date_updated',
            'duration',
            'course_image',
            'translations.*',
            'competence.competences_id.id',
            'competence.competences_id.parent_competence.id',
            'competence.competences_id.parent_competence.color_light',
            'competence.competences_id.parent_competence.color_dark',
            'competence.competences_id.parent_competence.translations.*',
          ],
          filter: {
            legacy_id: { _eq: legacyId },
            status: { _eq: 'published' },
          },
        })
      );

      // If found by legacy_id, return it
      if (response.length > 0) {
        return response[0] as DirectusCourse;
      }

      // If not found by legacy_id, search through all courses to find matching translation slug
      // This is a fallback for cases where legacy_id doesn't match the expected pattern
      const allCourses = await directus.request(
        readItems('courses', {
          fields: [
            'id',
            'legacy_id',
            'status',
            'date_created',
            'date_updated',
            'duration',
            'course_image',
            'translations.*',
            'competence.competences_id.id',
            'competence.competences_id.parent_competence.id',
            'competence.competences_id.parent_competence.color_light',
            'competence.competences_id.parent_competence.color_dark',
            'competence.competences_id.parent_competence.translations.*',
          ],
          filter: {
            status: { _eq: 'published' },
          },
          limit: 100, // Reasonable limit for searching
        })
      );

      // Find course with matching translation slug
      const matchingCourse = allCourses.find((course: DirectusCourse) => 
        course.translations?.some((translation: DirectusCourseTranslation) => translation.slug === slug)
      );

      return matchingCourse as DirectusCourse | undefined;
    } catch {
      // Fallback to direct fetch
      try {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';
        const legacyId = `f-${slug}`;
        
        // Try legacy_id first
        let url = new URL(`${baseUrl}/items/courses`);
        url.searchParams.set('fields', 'id,legacy_id,status,duration,course_image,translations.*');
        url.searchParams.set('filter[legacy_id][_eq]', legacyId);
        url.searchParams.set('filter[status][_eq]', 'published');

        let fetchResponse = await fetch(url.toString());
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          if (data.data.length > 0) {
            return data.data[0] as DirectusCourse;
          }
        }

        // If not found by legacy_id, try searching all courses
        url = new URL(`${baseUrl}/items/courses`);
        url.searchParams.set('fields', 'id,legacy_id,status,duration,course_image,translations.*');
        url.searchParams.set('filter[status][_eq]', 'published');
        url.searchParams.set('limit', '100');

        fetchResponse = await fetch(url.toString());
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const data = await fetchResponse.json();
        const matchingCourse = data.data.find((course: DirectusCourse) => 
          course.translations?.some((translation: DirectusCourseTranslation) => translation.slug === slug)
        );

        return matchingCourse as DirectusCourse | undefined;
      } catch {
        return undefined;
      }
    }
  },

  async getById(id: string | number) {
    try {
      const response = await directus.request(
        readItem('courses', id, {
          fields: [
            'id',
            'legacy_id',
            'status',
            'date_created',
            'date_updated',
            'duration',
            'course_image',
            'translations.*',
            'competence.competences_id.id',
            'competence.competences_id.parent_competence.id',
            'competence.competences_id.parent_competence.color_light',
            'competence.competences_id.parent_competence.color_dark',
            'competence.competences_id.parent_competence.translations.*',
          ],
        })
      );

      return response as DirectusCourse;
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      throw new Error('Failed to fetch course');
    }
  },

  async getFeatured(limit = 6) {
    try {
      const response = await directus.request(
        readItems('courses', {
          fields: [
            'id',
            'legacy_id',
            'status',
            'duration',
            'course_image',
            'translations.*',
            'competence.competences_id.id',
            'competence.competences_id.parent_competence.id',
            'competence.competences_id.parent_competence.color_light',
            'competence.competences_id.parent_competence.color_dark',
            'competence.competences_id.parent_competence.translations.*',
          ],
          filter: {
            status: { _eq: 'published' },
          },
          limit,
          sort: ['-date_created'],
        })
      );

      return response as DirectusCourse[];
    } catch (error) {
      console.error('Error fetching featured courses:', error);
      throw new Error('Failed to fetch featured courses');
    }
  },
};

export const competencesApi = {
  async getAll() {
    try {
      // On client side, skip SDK and go directly to API route to avoid CORS issues
      if (typeof window !== 'undefined') {
        // Skip SDK and fall through to the catch block to use API route
        throw new Error('CLIENT_SIDE_FALLBACK');
      }
      
      const response = await directus.request(
        readItems('competences', {
          fields: [
            'id',
            'icon',
            'color_light',
            'color_dark',
            'competence_type',
            'translations.*',
          ],
          filter: {
            competence_type: { _eq: 'main_competence' },
            parent_competence: { _null: true },
          },
        })
      );

      return response as DirectusCompetence[];
    } catch (error) {
      // Only log non-client-side fallback errors to avoid console noise
      if (error instanceof Error && error.message !== 'CLIENT_SIDE_FALLBACK') {
        console.error('🔍 [competencesApi] Directus SDK failed. Error:', error);
      }
      // Try API route fallback to avoid CORS issues
      try {
        const url = new URL('/api/competences', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
        url.searchParams.set('fields', 'id,icon,color_light,color_dark,competence_type,translations.*');
        url.searchParams.set('filter[competence_type][_eq]', 'main_competence');
        url.searchParams.set('filter[parent_competence][_null]', 'true');

        const fetchResponse = await fetch(url.toString());
        if (!fetchResponse.ok) {
          console.error('🔍 [competencesApi] Fallback fetch failed with status:', fetchResponse.status);
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const data = await fetchResponse.json();
        return data.data as DirectusCompetence[];
      } catch (fallbackError) {
        console.error('🔍 [competencesApi] All attempts failed:', fallbackError);
        // Return empty array as final fallback
        return [];
      }
    }
  },

  async getBySlug(slug: string) {
    try {
      const response = await directus.request(
        readItems('competences', {
          fields: [
            'id',
            'slug',
            'color',
            'icon',
            'translations.name',
            'translations.description',
            'translations.languages_code',
          ],
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' },
          },
        })
      );

      return response[0] as DirectusCompetence | undefined;
    } catch (error) {
      console.error('Error fetching competence by slug:', error);
      throw new Error('Failed to fetch competence');
    }
  },
};

export const instructorsApi = {
  async getAll() {
    try {
      const response = await directus.request(
        readItems('instructors', {
          fields: [
            'id',
            'name',
            'email',
            'avatar',
            'bio',
            'website',
            'social_links',
          ],
          filter: {
            status: { _eq: 'published' },
          },
          sort: ['sort'],
        })
      );

      return response as DirectusInstructor[];
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new Error('Failed to fetch instructors');
    }
  },
};

export const pagesApi = {
  async getSingleton(collection: string) {
    try {
      const response = await directus.request(
        readSingleton(collection, {
          fields: [
            'id',
            'status',
            'translations.title',
            'translations.content',
            'translations.seo_title',
            'translations.seo_description',
            'translations.og_image',
            'translations.languages_code',
          ],
        })
      );

      return response;
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      throw new Error(`Failed to fetch ${collection}`);
    }
  },
};

export function getAssetUrl(id: string | undefined | null): string {
  if (!id) return '';
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';
  return `${baseUrl}/assets/${id}`;
}

export function getAssetUrlWithTransforms(
  id: string | undefined | null,
  transforms?: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'contain' | 'inside' | 'outside';
    format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  }
): string {
  if (!id) return '';
  
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';
  let url = `${baseUrl}/assets/${id}`;
  
  if (transforms) {
    const params = new URLSearchParams();
    
    if (transforms.width) params.append('width', transforms.width.toString());
    if (transforms.height) params.append('height', transforms.height.toString());
    if (transforms.quality) params.append('quality', transforms.quality.toString());
    if (transforms.fit) params.append('fit', transforms.fit);
    if (transforms.format) params.append('format', transforms.format);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
}

export function filterTranslations<T extends DirectusCourseTranslation | DirectusCompetenceTranslation>(
  translations: T[] | undefined,
  locale: string
): T | undefined {
  if (!translations || translations.length === 0) return undefined;
  
  const localeTranslation = translations.find(t => t.languages_code === locale);
  if (localeTranslation) return localeTranslation;
  
  const defaultTranslation = translations.find(t => t.languages_code === 'fr');
  return defaultTranslation || translations[0];
}

export function formatCurrency(cents: number, currency = 'EUR', locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function formatDuration(duration: number | string, locale = 'fr'): string {
  // Handle both number (minutes) and string (from API) formats
  const minutes = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  
  if (isNaN(minutes) || minutes < 0) {
    return locale === 'fr' ? 'Durée non disponible' : 'Duration not available';
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (locale === 'fr') {
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  } else {
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }
}

export function getParentCompetences(course: DirectusCourse, locale: string) {
  if (!course.competence || course.competence.length === 0) {
    return [];
  }

  const parentCompetences: Array<{
    id: string;
    title: string;
    colorLight?: string;
    colorDark?: string;
  }> = [];

  course.competence.forEach((competenceRelation: DirectusCourseCompetence) => {
    const competence = competenceRelation.competences_id;
    if (typeof competence === 'object' && competence?.parent_competence) {
      const parentCompetence = competence.parent_competence;
      if (typeof parentCompetence === 'object' && parentCompetence.translations) {
        const translation = filterTranslations(parentCompetence.translations, locale);
        
        if (translation && !parentCompetences.find(p => p.id === parentCompetence.id)) {
          parentCompetences.push({
            id: parentCompetence.id,
            title: translation.title,
            colorLight: parentCompetence.color_light,
            colorDark: parentCompetence.color_dark,
          });
        }
      }
    }
  });

  // Limit to 3 competences as specified
  return parentCompetences.slice(0, 3);
}

export function generateMetadata(
  courseTranslation: Record<string, unknown>,
  locale: string,
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afthonios.com'
) {
  const title = courseTranslation?.seo_title || courseTranslation?.title;
  const description = courseTranslation?.seo_description || courseTranslation?.summary;
  const ogImage = courseTranslation?.og_image 
    ? getAssetUrl(courseTranslation.og_image as string)
    : `${baseUrl}/og-default.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}