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
            id: '5',
            icon: 'assertiveness',
            color_light: '#3B82F6',
            color_dark: '#1D4ED8',
            competence_type: 'main_competence',
            translations: [
              {
                id: '5',
                competences_id: '5',
                languages_code: 'fr',
                title: 'Assertivité et Courage',
                card_title: 'Assertivité et Courage',
                description: 'Compétences en assertivité et courage'
              }
            ]
          },
          {
            id: '6',
            icon: 'efficiency',
            color_light: '#10B981',
            color_dark: '#047857',
            competence_type: 'main_competence',
            translations: [
              {
                id: '6',
                competences_id: '6',
                languages_code: 'fr',
                title: 'Efficacité Personnelle et Professionnelle',
                card_title: 'Efficacité Personnelle et Professionnelle',
                description: 'Compétences en efficacité personnelle et professionnelle'
              }
            ]
          },
          {
            id: '7',
            icon: 'collaboration',
            color_light: '#EF4444',
            color_dark: '#DC2626',
            competence_type: 'main_competence',
            translations: [
              {
                id: '7',
                competences_id: '7',
                languages_code: 'fr',
                title: 'Collaboration et Travail en Équipe',
                card_title: 'Collaboration et Travail en Équipe',
                description: 'Compétences en collaboration et travail en équipe'
              }
            ]
          },
          {
            id: '8',
            icon: 'agility',
            color_light: '#8B5CF6',
            color_dark: '#7C3AED',
            competence_type: 'main_competence',
            translations: [
              {
                id: '8',
                competences_id: '8',
                languages_code: 'fr',
                title: 'Agilité et Changement',
                card_title: 'Agilité et Changement',
                description: 'Compétences en agilité et changement'
              }
            ]
          },
          {
            id: '9',
            icon: 'communication',
            color_light: '#06B6D4',
            color_dark: '#0891B2',
            competence_type: 'main_competence',
            translations: [
              {
                id: '9',
                competences_id: '9',
                languages_code: 'fr',
                title: 'Communication et Relations',
                card_title: 'Communication et Relations',
                description: 'Compétences en communication et relations'
              }
            ]
          },
          {
            id: '10',
            icon: 'leadership',
            color_light: '#84CC16',
            color_dark: '#65A30D',
            competence_type: 'main_competence',
            translations: [
              {
                id: '10',
                competences_id: '10',
                languages_code: 'fr',
                title: 'Management et Leadership',
                card_title: 'Management et Leadership',
                description: 'Compétences en management et leadership'
              }
            ]
          },
          {
            id: '11',
            icon: 'wellbeing',
            color_light: '#EC4899',
            color_dark: '#DB2777',
            competence_type: 'main_competence',
            translations: [
              {
                id: '11',
                competences_id: '11',
                languages_code: 'fr',
                title: 'Énergie Positive et Bien-être',
                card_title: 'Énergie Positive et Bien-être',
                description: 'Compétences en énergie positive et bien-être'
              }
            ]
          },
          {
            id: '12',
            icon: 'diversity',
            color_light: '#F59E0B',
            color_dark: '#D97706',
            competence_type: 'main_competence',
            translations: [
              {
                id: '12',
                competences_id: '12',
                languages_code: 'fr',
                title: 'Diversité et Inclusion',
                card_title: 'Diversité et Inclusion',
                description: 'Compétences en diversité et inclusion'
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