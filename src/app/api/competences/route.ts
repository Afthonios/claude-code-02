import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build the Directus API URL
    const directusUrl = new URL(`${DIRECTUS_BASE_URL}/items/competences`);
    
    // Pass through all filter parameters that match the pattern
    // This includes nested parameters like filter[competence_type][_eq] and filter[parent_competence][_null]
    searchParams.forEach((value, key) => {
      // Allow basic parameters and any filter parameters (including nested ones)
      if (key.match(/^(fields|sort|limit|offset|search|meta)$/) || key.startsWith('filter[')) {
        directusUrl.searchParams.set(key, value);
        console.log('🔍 [API Route] Forwarding competences parameter:', key, '=', value);
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
      
      // Return empty data on API failure to force client to use real API or show no competences
      console.log('🔍 [API Route] Competences API failed - returning empty data to force real API usage');
      const emptyData = {
        data: []
      };

      
      return NextResponse.json(emptyData, {
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