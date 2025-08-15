import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build the Directus API URL
    const directusUrl = new URL(`${DIRECTUS_BASE_URL}/items/courses`);
    
    // Forward all search parameters to Directus
    searchParams.forEach((value, key) => {
      directusUrl.searchParams.set(key, value);
    });

    console.log('🔍 [API Route] Proxying request to:', directusUrl.toString());

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
      console.log('🔍 [API Route] Directus response:', data?.data?.length || 0, 'courses');

      // Return the data with CORS headers
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
            course_image: null,
            translations: [
              {
                id: '1',
                courses_id: '1',
                languages_code: 'fr',
                title: 'Cours d\'exemple 1',
                subtitle: 'Un cours pour tester les filtres',
                summary: 'Ce cours sert à tester le système de filtres',
                description: 'Description détaillée du cours d\'exemple',
                slug: 'cours-exemple-1'
              }
            ]
          },
          {
            id: '2',
            legacy_id: 'f-sample-course-2',
            status: 'published',
            duration: 90,
            level: 'intermediate',
            availability: 'paid',
            price_cents: 2999,
            currency: 'EUR',
            course_image: null,
            translations: [
              {
                id: '2',
                courses_id: '2',
                languages_code: 'fr',
                title: 'Cours d\'exemple 2',
                subtitle: 'Un cours intermédiaire',
                summary: 'Ce cours intermédiaire teste les filtres',
                description: 'Description détaillée du cours intermédiaire',
                slug: 'cours-exemple-2'
              }
            ]
          }
        ]
      };

      console.log('🔍 [API Route] Returning mock data due to Directus failure');
      
      return NextResponse.json(mockData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  } catch (error) {
    console.error('🔍 [API Route] Error:', error);
    
    // Return empty data as absolute fallback
    return NextResponse.json({ data: [] }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}