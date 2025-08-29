import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

import { coursesApi, freeWeeklyApi } from '@/lib/directus';
import CoursesPageClient from '@/components/course/CoursesPageClient';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'courses' });

  return {
    title: t('title'),
    description: t('searchPlaceholder'),
  };
}

async function CoursesContent({ locale }: { locale: string }) {
  
  try {
    // Load both initial courses and weekly course for SSR
    const [coursesResult, weeklyFreeCourse] = await Promise.all([
      coursesApi.getAll({ limit: 1000 }),
      freeWeeklyApi.getCurrentWeekCourse()
    ]);
    
    console.log('🎯 [SSR] Weekly course fetched:', weeklyFreeCourse ? {
      id: weeklyFreeCourse.id,
      title: weeklyFreeCourse.translations?.[0]?.title,
      course_type: weeklyFreeCourse.course_type
    } : null);
    
    return (
      <CoursesPageClient 
        locale={locale} 
        initialCourses={coursesResult.data} 
        initialWeeklyFreeCourse={weeklyFreeCourse}
        hasApiError={!coursesResult.success && coursesResult.error === 'api_failure'}
      />
    );
  } catch (error) {
    console.error('❌ [CoursesPage] Error loading initial data:', error);
    return <CoursesPageClient locale={locale} initialCourses={[]} hasApiError={true} />;
  }
}

function CoursesLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-gray-900">
      <div className="container py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
        </div>
        
        {/* Search bar loading */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="w-full lg:w-auto max-w-md">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        
        {/* Courses grid loading */}
        <div className="flex gap-8">
          {/* Filter sidebar loading (desktop) */}
          <div className="hidden lg:block w-64">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content loading */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;

  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesContent locale={locale} />
    </Suspense>
  );
}