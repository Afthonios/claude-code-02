import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build the Directus API URL
    const directusUrl = new URL(`${DIRECTUS_BASE_URL}/items/courses`);
    
    // Whitelist allowed search parameters for security
    const allowedParams = ['fields', 'filter', 'sort', 'limit', 'offset', 'search', 'meta'];
    searchParams.forEach((value, key) => {
      if (allowedParams.includes(key)) {
        directusUrl.searchParams.set(key, value);
      }
    });


    // Make the request to Directus with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(directusUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication if needed
          ...(process.env.DIRECTUS_STATIC_TOKEN && {
            'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`
          })
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('🔍 [API Route] Directus API error:', response.status, response.statusText);
        throw new Error(`Directus API error: ${response.status}`);
      }

      const data = await response.json();

      // Return the data with CORS headers
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://afthonios.com' : '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('🔍 [API Route] Directus fetch failed:', fetchError);
      
      // Return mock data as fallback
      const mockData = {
        data: [
          {
            id: '1',
            legacy_id: 'f-sample-course-1',
            status: 'published',
            duration: 45,
            level: 'beginner',
            availability: 'free',
            price_cents: 0,
            currency: 'EUR',
            course_type: 'Formation',
            course_image: null,
            translations: [
              {
                id: '1',
                courses_id: '1',
                languages_code: 'fr',
                title: 'Formation d\'exemple 1',
                subtitle: 'Une formation pour tester les filtres',
                summary: 'Cette formation sert à tester le système de filtres',
                description: 'Description détaillée de la formation d\'exemple',
                slug: 'formation-exemple-1'
              }
            ]
          },
          {
            id: '2',
            legacy_id: 'p-sample-course-2',
            status: 'published',
            duration: 90,
            level: 'intermediate',
            availability: 'paid',
            price_cents: 2999,
            currency: 'EUR',
            course_type: 'Parcours',
            course_image: null,
            translations: [
              {
                id: '2',
                courses_id: '2',
                languages_code: 'fr',
                title: 'Parcours d\'exemple 2',
                subtitle: 'Un parcours intermédiaire',
                summary: 'Ce parcours intermédiaire teste les filtres',
                description: 'Description détaillée du parcours intermédiaire',
                slug: 'parcours-exemple-2'
              }
            ]
          },
          {
            id: '3',
            legacy_id: 'f-sample-course-3',
            status: 'published',
            duration: 60,
            level: 'advanced',
            availability: 'paid',
            price_cents: 4999,
            currency: 'EUR',
            course_type: 'Formation',
            course_image: null,
            translations: [
              {
                id: '3',
                courses_id: '3',
                languages_code: 'fr',
                title: 'Formation avancée 3',
                subtitle: 'Une formation avancée',
                summary: 'Cette formation avancée teste les filtres',
                description: 'Description détaillée de la formation avancée',
                slug: 'formation-avancee-3'
              }
            ]
          },
          {
            id: '4',
            legacy_id: 'p-sample-course-4',
            status: 'published',
            duration: 120,
            level: 'beginner',
            availability: 'free',
            price_cents: 0,
            currency: 'EUR',
            course_type: 'Parcours',
            course_image: null,
            translations: [
              {
                id: '4',
                courses_id: '4',
                languages_code: 'fr',
                title: 'Parcours débutant 4',
                subtitle: 'Un parcours pour débutants',
                summary: 'Ce parcours débutant teste les filtres',
                description: 'Description détaillée du parcours débutant',
                slug: 'parcours-debutant-4'
              }
            ]
          }
        ]
      };

      
      return NextResponse.json(mockData, {
        headers: {
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://afthonios.com' : '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
  } catch (error) {
    console.error('🔍 [API Route] Error:', error);
    
    // Return empty data as absolute fallback
    return NextResponse.json({ data: [] }, {
      headers: {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://afthonios.com' : '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://afthonios.com' : '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}