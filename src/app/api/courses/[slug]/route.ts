import { NextRequest, NextResponse } from 'next/server';
import { coursesApi } from '@/lib/directus';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const course = await coursesApi.getBySlug(slug);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Return only the data needed for language switching
    const courseData = {
      id: course.id,
      legacy_id: course.legacy_id,
      translations: course.translations?.map(t => ({
        languages_code: t.languages_code,
        slug: t.slug,
        title: t.title
      })) || []
    };

    return NextResponse.json(courseData);
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}