import { createDirectus, rest, readItems, readItem, readSingleton } from '@directus/sdk';
import type {
  DirectusCourse,
  DirectusCompetence,
  DirectusInstructor,
  DirectusCourseTranslation,
  DirectusCompetenceTranslation,
  ApiResult,
  // DirectusCourseCompetence, // Legacy type - kept in types for backwards compatibility
  // DirectusCourseMainCompetence, // Used via DirectusCourse.main_competences type
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
  }): Promise<ApiResult<DirectusCourse>> {
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
        'gradient_from_light',
        'gradient_to_light',
        'gradient_from_dark',
        'gradient_to_dark',
        'on_light',
        'on_dark',
        'translations.*',
        // Try both new and legacy competence fields with parent relationship
        'main_competences.competences_id.*',
        'competence.competences_id.id',
        'competence.competences_id.parent_competence',
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
      const courses = response as DirectusCourse[];
      return {
        data: courses,
        success: true,
        error: courses.length === 0 ? 'no_results' : undefined
      };
    } catch (error) {
      // Only log non-client-side fallback errors to avoid console noise
      if (error instanceof Error && error.message !== 'CLIENT_SIDE_FALLBACK') {
        console.error('🔍 [coursesApi] Directus SDK failed. Error:', error);
      }
      // Fallback to our Next.js API route to avoid CORS issues
      try {
        const url = new URL('/api/courses', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        
        // Add parameters that will be forwarded to Directus
        url.searchParams.set('fields', 'id,legacy_id,status,duration,course_type,course_image,gradient_from_light,gradient_to_light,gradient_from_dark,gradient_to_dark,on_light,on_dark,translations.*,main_competences.competences_id.*,competence.competences_id.id,competence.competences_id.parent_competence');
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
              
              // Handle special case for competence filters with deep nesting
              if (key === 'main_competences' && value && typeof value === 'object') {
                const competenceFilter = value as Record<string, unknown>;
                if (competenceFilter.competences_id && typeof competenceFilter.competences_id === 'object') {
                  const competenceIdFilter = competenceFilter.competences_id as Record<string, unknown>;
                  if (competenceIdFilter.id && typeof competenceIdFilter.id === 'object') {
                    const idFilter = competenceIdFilter.id as Record<string, unknown>;
                    if (idFilter._in && Array.isArray(idFilter._in)) {
                      // Set the properly nested filter parameter for competences
                      url.searchParams.set(`${filterKey}[competences_id][id][_in]`, idFilter._in.join(','));
                      console.log('🔍 [directus.ts] Setting competence filter:', `${filterKey}[competences_id][id][_in]`, '=', idFilter._in.join(','));
                      return;
                    }
                  }
                }
                // Fallback to regular recursion if structure doesn't match expected
                flattenFilter(competenceFilter, filterKey);
              } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Recursively flatten nested objects
                flattenFilter(value as Record<string, unknown>, filterKey);
              } else {
                // Set the parameter with proper encoding
                if (Array.isArray(value)) {
                  url.searchParams.set(filterKey, value.join(','));
                } else {
                  url.searchParams.set(filterKey, String(value));
                }
                console.log('🔍 [directus.ts] Setting filter parameter:', filterKey, '=', Array.isArray(value) ? value.join(',') : String(value));
              }
            });
          };
          
          console.log('🔍 [directus.ts] Flattening filter object:', JSON.stringify(filter, null, 2));
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
        const courses = data.data as DirectusCourse[];
        return {
          data: courses,
          success: true,
          error: courses.length === 0 ? 'no_results' : undefined
        };
      } catch (fallbackError) {
        console.error('🔍 [coursesApi] All attempts failed:', fallbackError);
        // Return API failure result to indicate service unavailability
        return {
          data: [],
          success: false,
          error: 'api_failure'
        };
      }
    }
  },

  async getBySlug(slug: string) {
    try {
      // Search through all courses to find matching translation slug
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
            'gradient_from_light',
            'gradient_to_light',
            'gradient_from_dark',
            'gradient_to_dark',
            'on_light',
            'on_dark',
            'translations.*',
            'main_competences.competences_id.id',
            'main_competences.competences_id.color_light',
            'main_competences.competences_id.color_dark',
            'main_competences.competences_id.translations.*',
          ],
          filter: {
            status: { _eq: 'published' },
            translations: {
              slug: { _eq: slug }
            }
          },
        })
      );

      // Return the first matching course
      if (response.length > 0) {
        return response[0] as DirectusCourse;
      }

      return undefined;
    } catch {
      // Fallback to direct fetch
      try {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';
        
        // Search by translation slug
        const url = new URL(`${baseUrl}/items/courses`);
        url.searchParams.set('fields', 'id,legacy_id,status,duration,course_image,gradient_from_light,gradient_to_light,gradient_from_dark,gradient_to_dark,on_light,on_dark,translations.*,main_competences.competences_id.id,main_competences.competences_id.color_light,main_competences.competences_id.color_dark,main_competences.competences_id.translations.*');
        url.searchParams.set('filter[status][_eq]', 'published');
        url.searchParams.set('filter[translations][slug][_eq]', slug);

        const fetchResponse = await fetch(url.toString());
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const data = await fetchResponse.json();
        return data.data.length > 0 ? data.data[0] as DirectusCourse : undefined;
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
            'gradient_from_light',
            'gradient_to_light',
            'gradient_from_dark',
            'gradient_to_dark',
            'on_light',
            'on_dark',
            'translations.*',
            'main_competences.competences_id.id',
            'main_competences.competences_id.color_light',
            'main_competences.competences_id.color_dark',
            'main_competences.competences_id.translations.*',
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
            'gradient_from_light',
            'gradient_to_light',
            'gradient_from_dark',
            'gradient_to_dark',
            'on_light',
            'on_dark',
            'translations.*',
            'main_competences.competences_id.id',
            'main_competences.competences_id.color_light',
            'main_competences.competences_id.color_dark',
            'main_competences.competences_id.translations.*',
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
        const url = new URL('/api/competences', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
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

export const freeWeeklyApi = {
  async getCurrentWeekCourse(): Promise<DirectusCourse | null> {
    try {
      const now = new Date();
      
      // On client side, use fetch to avoid CORS issues
      if (typeof window !== 'undefined') {
        throw new Error('CLIENT_SIDE_FALLBACK');
      }
      
      const response = await directus.request(
        readItems('free_weekly', {
          fields: [
            'id',
            'week_start',
            'week_end',
            'course_id.id',
            'course_id.legacy_id',
            'course_id.status',
            'course_id.duration',
            'course_id.course_image',
            'course_id.gradient_from_light',
            'course_id.gradient_to_light',
            'course_id.gradient_from_dark',
            'course_id.gradient_to_dark',
            'course_id.on_light',
            'course_id.on_dark',
            'course_id.translations.*',
            'course_id.main_competences.competences_id.id',
            'course_id.main_competences.competences_id.color_light',
            'course_id.main_competences.competences_id.color_dark',
            'course_id.main_competences.competences_id.translations.*',
          ],
          filter: {
            status: { _eq: 'published' },
            week_start: { _lte: now.toISOString() },
            week_end: { _gte: now.toISOString() },
          },
          limit: 1,
        })
      );

      if (response.length > 0) {
        return response[0].course_id as DirectusCourse;
      }

      return null;
    } catch (error) {
      // Only log non-client-side fallback errors
      if (error instanceof Error && error.message !== 'CLIENT_SIDE_FALLBACK') {
        console.error('🔍 [freeWeeklyApi] Directus SDK failed. Error:', error);
      }
      
      // Fallback to our Next.js API route
      try {
        const url = new URL('/api/free-weekly', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        
        const fetchResponse = await fetch(url.toString());
        if (!fetchResponse.ok) {
          console.error('🔍 [freeWeeklyApi] API route failed with status:', fetchResponse.status);
          return null;
        }
        
        const data = await fetchResponse.json();
        if (data.data) {
          return data.data as DirectusCourse;
        }

        return null;
      } catch (fallbackError) {
        console.error('🔍 [freeWeeklyApi] All attempts failed:', fallbackError);
        return null;
      }
    }
  },

  async getWeekPeriod(): Promise<{ week_start: string; week_end: string } | null> {
    try {
      const now = new Date();
      const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';
      
      const url = new URL(`${baseUrl}/items/free_weekly`);
      url.searchParams.set('fields', 'week_start,week_end');
      url.searchParams.set('filter[status][_eq]', 'published');
      url.searchParams.set('filter[week_start][_lte]', now.toISOString());
      url.searchParams.set('filter[week_end][_gte]', now.toISOString());
      url.searchParams.set('limit', '1');

      const fetchResponse = await fetch(url.toString());
      if (!fetchResponse.ok) {
        return null;
      }
      
      const data = await fetchResponse.json();
      if (data.data && data.data.length > 0) {
        return {
          week_start: data.data[0].week_start,
          week_end: data.data[0].week_end,
        };
      }

      return null;
    } catch (error) {
      console.error('🔍 [freeWeeklyApi] Failed to get week period:', error);
      return null;
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
  // Use the new main_competences field for direct access, fallback to legacy competence field
  const competenceRelations = course.main_competences || course.competence;
  
  if (!competenceRelations || competenceRelations.length === 0) {
    return [];
  }

  const parentCompetences: Array<{
    id: string;
    title: string;
    colorLight?: string;
    colorDark?: string;
  }> = [];

  competenceRelations.forEach((competenceRelation) => {
    const competence = competenceRelation.competences_id;
    if (typeof competence === 'object' && competence.translations) {
      const translation = filterTranslations(competence.translations, locale);
      
      if (translation && !parentCompetences.find(p => p.id === competence.id)) {
        const parent: { id: string; title: string; colorLight?: string; colorDark?: string } = {
          id: competence.id,
          title: translation.title,
        };
        if (competence.color_light) parent.colorLight = competence.color_light;
        if (competence.color_dark) parent.colorDark = competence.color_dark;
        parentCompetences.push(parent);
      }
    }
  });

  // Limit to 3 competences as specified
  return parentCompetences.slice(0, 3);
}

export function getCourseSlug(course: DirectusCourse, locale: string): string {
  const translation = filterTranslations(course.translations, locale);
  return translation?.slug || course.legacy_id || course.id;
}

export function getCourseUrl(course: DirectusCourse, locale: string): string {
  const slug = getCourseSlug(course, locale);
  const coursePath = locale === 'fr' ? 'cours' : 'courses';
  return `/${locale}/${coursePath}/${slug}`;
}

export function getCoursesListUrl(locale: string): string {
  const coursePath = locale === 'fr' ? 'cours' : 'courses';
  return `/${locale}/${coursePath}`;
}

export function generateMetadata(
  courseTranslation: DirectusCourseTranslation | Record<string, unknown>,
  locale: string,
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afthonios.com'
) {
  const title = (courseTranslation?.seo_title || courseTranslation?.title) as string;
  const description = (courseTranslation?.seo_description || courseTranslation?.summary) as string;
  const ogImage = (courseTranslation as Record<string, unknown>)?.og_image 
    ? getAssetUrl((courseTranslation as Record<string, unknown>).og_image as string)
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