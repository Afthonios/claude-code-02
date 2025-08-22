import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build the Directus API URL
    const directusUrl = new URL(`${DIRECTUS_BASE_URL}/items/competences`);
    
    // Whitelist allowed search parameters for security
    const allowedParams = ['fields', 'filter', 'sort', 'limit', 'offset', 'search', 'meta'];
    searchParams.forEach((value, key) => {
      if (allowedParams.includes(key)) {
        directusUrl.searchParams.set(key, value);
      }
    });


    // Make the request to Directus with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

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
        console.error('🔍 [API Route] Directus competences API error:', response.status, response.statusText);
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
      console.error('🔍 [API Route] Directus competences fetch failed:', fetchError);
      
      // Return mock competences data as fallback
      const mockData = {
        data: [
          {
            id: '1',
            icon: 'communication',
            color_light: '#3B82F6',
            color_dark: '#1D4ED8',
            competence_type: 'main_competence',
            translations: [
              {
                id: '1',
                competences_id: '1',
                languages_code: 'fr',
                title: 'Communication',
                description: 'Compétences en communication'
              }
            ]
          },
          {
            id: '2',
            icon: 'leadership',
            color_light: '#10B981',
            color_dark: '#047857',
            competence_type: 'main_competence',
            translations: [
              {
                id: '2',
                competences_id: '2',
                languages_code: 'fr',
                title: 'Leadership',
                description: 'Compétences en leadership'
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
    console.error('🔍 [API Route] Competences error:', error);
    
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