import { createDirectus, rest, readItems, readItem, readSingleton } from '@directus/sdk';
import type {
  DirectusCourse,
  DirectusCompetence,
  DirectusInstructor,
  DirectusCourseTranslation,
  DirectusCompetenceTranslation,
} from '@/types/directus';

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
    const { limit = 50, page = 1, search, filter, sort } = options || {};
    
    const query: Record<string, unknown> = {
      fields: [
        'id',
        'slug',
        'status',
        'sort',
        'created_at',
        'updated_at',
        'cover_image',
        'duration_minutes',
        'level',
        'price_cents',
        'currency',
        'availability',
        'translations.title',
        'translations.subtitle',
        'translations.summary',
        'translations.description',
        'translations.seo_title',
        'translations.seo_description',
        'translations.languages_code',
        'competences.competences_id.id',
        'competences.competences_id.translations.name',
        'competences.competences_id.translations.description',
        'competences.competences_id.translations.languages_code',
        'instructors.instructors_id.id',
        'instructors.instructors_id.name',
        'instructors.instructors_id.email',
        'instructors.instructors_id.avatar',
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
      const response = await directus.request(
        readItems('courses', query)
      );
      return response as DirectusCourse[];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  },

  async getBySlug(slug: string) {
    try {
      const response = await directus.request(
        readItems('courses', {
          fields: [
            'id',
            'slug',
            'status',
            'created_at',
            'updated_at',
            'cover_image',
            'gallery',
            'duration_minutes',
            'level',
            'price_cents',
            'currency',
            'availability',
            'translations.title',
            'translations.subtitle',
            'translations.summary',
            'translations.description',
            'translations.seo_title',
            'translations.seo_description',
            'translations.og_image',
            'translations.languages_code',
            'competences.competences_id.id',
            'competences.competences_id.slug',
            'competences.competences_id.translations.name',
            'competences.competences_id.translations.description',
            'competences.competences_id.translations.languages_code',
            'instructors.instructors_id.id',
            'instructors.instructors_id.name',
            'instructors.instructors_id.email',
            'instructors.instructors_id.avatar',
            'instructors.instructors_id.bio',
          ],
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' },
          },
        })
      );

      return response[0] as DirectusCourse | undefined;
    } catch (error) {
      console.error('Error fetching course by slug:', error);
      throw new Error('Failed to fetch course');
    }
  },

  async getById(id: string) {
    try {
      const response = await directus.request(
        readItem('courses', id, {
          fields: [
            'id',
            'slug',
            'status',
            'created_at',
            'updated_at',
            'cover_image',
            'gallery',
            'duration_minutes',
            'level',
            'price_cents',
            'currency',
            'availability',
            'translations.title',
            'translations.subtitle',
            'translations.summary',
            'translations.description',
            'translations.seo_title',
            'translations.seo_description',
            'translations.og_image',
            'translations.languages_code',
            'competences.competences_id.id',
            'competences.competences_id.slug',
            'competences.competences_id.translations.name',
            'competences.competences_id.translations.description',
            'competences.competences_id.translations.languages_code',
            'instructors.instructors_id.id',
            'instructors.instructors_id.name',
            'instructors.instructors_id.email',
            'instructors.instructors_id.avatar',
            'instructors.instructors_id.bio',
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
            'slug',
            'cover_image',
            'duration_minutes',
            'level',
            'price_cents',
            'currency',
            'availability',
            'translations.title',
            'translations.subtitle',
            'translations.summary',
            'translations.languages_code',
          ],
          filter: {
            status: { _eq: 'published' },
            featured: { _eq: true },
          },
          limit,
          sort: ['-created_at'],
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
            status: { _eq: 'published' },
          },
          sort: ['sort'],
        })
      );

      return response as DirectusCompetence[];
    } catch (error) {
      console.error('Error fetching competences:', error);
      throw new Error('Failed to fetch competences');
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

export function formatDuration(minutes: number, locale = 'fr'): string {
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