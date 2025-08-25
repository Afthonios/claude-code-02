import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';
    const now = new Date();
    
    const url = new URL(`${baseUrl}/items/free_weekly`);
    url.searchParams.set('fields', 'id,week_start,week_end,course_id.id,course_id.legacy_id,course_id.status,course_id.duration,course_id.course_image,course_id.gradient_from_light,course_id.gradient_to_light,course_id.gradient_from_dark,course_id.gradient_to_dark,course_id.on_light,course_id.on_dark,course_id.translations.*,course_id.main_competences.competences_id.id,course_id.main_competences.competences_id.color_light,course_id.main_competences.competences_id.color_dark,course_id.main_competences.competences_id.translations.*');
    url.searchParams.set('filter[status][_eq]', 'published');
    url.searchParams.set('filter[week_start][_lte]', now.toISOString());
    url.searchParams.set('filter[week_end][_gte]', now.toISOString());
    url.searchParams.set('limit', '1');

    console.log('🔍 [API Route] Fetching free weekly course from:', url.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('🔍 [API Route] Failed to fetch free weekly course:', response.status, response.statusText);
      return NextResponse.json({ data: null, error: 'Failed to fetch' }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('🔍 [API Route] Free weekly course fetched successfully. Found:', data.data?.length || 0, 'records');
    
    if (data.data && data.data.length > 0) {
      return NextResponse.json({ data: data.data[0].course_id });
    }

    return NextResponse.json({ data: null });
  } catch (error) {
    console.error('🔍 [API Route] Error fetching free weekly course:', error);
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}