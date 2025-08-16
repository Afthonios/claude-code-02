import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { coursesApi, filterTranslations, generateMetadata as generateCourseMetadata, getCourseSlug } from '@/lib/directus';
import CourseDetail from '@/components/course/CourseDetail';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams(): Promise<{ locale: string; slug: string }[]> {
  try {
    const courses = await coursesApi.getAll({ limit: 100 });
    const locales = ['fr', 'en'];
    
    const params: { locale: string; slug: string }[] = [];
    
    for (const course of courses) {
      for (const locale of locales) {
        const slug = getCourseSlug(course, locale);
        params.push({ locale, slug });
      }
    }
    
    return params;
  } catch (error) {
    console.error('Error generating static params for courses:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  
  try {
    const course = await coursesApi.getBySlug(slug);
    
    if (!course) {
      return {
        title: 'Course not found',
        description: 'The requested course could not be found.',
      };
    }
    
    const translation = filterTranslations(course.translations, locale);
    
    if (!translation) {
      return {
        title: 'Course not found',
        description: 'The requested course is not available in this language.',
      };
    }
    
    return generateCourseMetadata(translation, locale);
  } catch (error) {
    console.error('Error generating metadata for course:', error);
    return {
      title: 'Course',
      description: 'Learn with our comprehensive course content.',
    };
  }
}

async function CourseContent({ slug, locale }: { slug: string; locale: string }) {
  try {
    const course = await coursesApi.getBySlug(slug);
    
    if (!course) {
      notFound();
    }
    
    return <CourseDetail course={course} locale={locale} />;
  } catch (error) {
    console.error('Error loading course:', error);
    return <CourseError locale={locale} />;
  }
}

function CourseError({ locale }: { locale: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <div className="text-red-400 dark:text-red-600 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {locale === 'fr' ? 'Erreur de chargement' : 'Loading Error'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {locale === 'fr' 
            ? 'Impossible de charger le cours. Veuillez réessayer plus tard.'
            : 'Unable to load course. Please try again later.'}
        </p>
      </div>
    </div>
  );
}

function CourseLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb skeleton */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>

        {/* Hero skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="aspect-[2/1] w-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="p-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
          </div>
        </div>

        {/* Objectives skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CoursePage({ params }: Props) {
  const { locale, slug } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<CourseLoading />}>
        <CourseContent slug={slug} locale={locale} />
      </Suspense>
    </div>
  );
}