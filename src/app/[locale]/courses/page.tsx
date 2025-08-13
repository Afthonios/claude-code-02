import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

import { coursesApi } from '@/lib/directus';
import CourseCard from '@/components/course/CourseCard';
import type { DirectusCourse } from '@/types/directus';

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
    const courses = await coursesApi.getAll();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <CoursesHeader />
        <CoursesList courses={courses} locale={locale} />
      </div>
    );
  } catch (error) {
    console.error('Error loading courses:', error);
    return <CoursesError />;
  }
}

function CoursesHeader() {
  const t = useTranslations('courses');
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {t('title')}
      </h1>
    </div>
  );
}

function CoursesList({ courses, locale }: { courses: DirectusCourse[]; locale: string }) {
  if (!courses || courses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} locale={locale} />
      ))}
    </div>
  );
}


function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📚</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No courses available
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Check back later for new courses.
      </p>
    </div>
  );
}

function CoursesError() {
  const t = useTranslations('common');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <div className="text-red-400 dark:text-red-600 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t('error')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Unable to load courses. Please try again later.
        </p>
      </div>
    </div>
  );
}

function CoursesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
      </div>
      
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