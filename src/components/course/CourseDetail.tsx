import Image from 'next/image';
import Link from 'next/link';
import { formatDuration, filterTranslations, getAssetUrlWithTransforms } from '@/lib/directus';
import type { DirectusCourse } from '@/types/directus';

interface CourseDetailProps {
  course: DirectusCourse;
  locale: string;
}

export default function CourseDetail({ course, locale }: CourseDetailProps) {
  const translation = filterTranslations(course.translations, locale);
  
  if (!translation) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {locale === 'fr' ? 'Cours non trouvé' : 'Course not found'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {locale === 'fr' 
            ? 'Le cours demandé n\'est pas disponible dans cette langue.' 
            : 'The requested course is not available in this language.'}
        </p>
      </div>
    );
  }

  // Use course image from Directus if available, otherwise use a fallback
  const imageUrl = course.course_image 
    ? getAssetUrlWithTransforms(
        typeof course.course_image === 'string' ? course.course_image : course.course_image.id,
        {
          width: 800,
          height: 400,
          fit: 'cover',
          quality: 80,
          format: 'webp'
        }
      )
    : '/images/course-placeholder.svg'; // Fallback to a local placeholder
  
  const duration = course.duration ? formatDuration(course.duration, locale) : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link 
          href={`/${locale}/courses`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {locale === 'fr' ? '← Retour aux cours' : '← Back to courses'}
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative aspect-[2/1] w-full">
          <Image
            src={imageUrl}
            alt={translation.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {translation.title}
            </h1>
            {translation.subtitle && (
              <p className="text-lg md:text-xl opacity-90">
                {translation.subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {duration && (
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                <span className="mr-1">⏱️</span>
                {duration}
              </span>
            )}
            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="mr-1">📚</span>
              {course.status === 'published' 
                ? (locale === 'fr' ? 'Publié' : 'Published')
                : course.status
              }
            </span>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {locale === 'fr' ? 'Description' : 'Description'}
        </h2>
        <div 
          className="prose prose-gray dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: translation.description }}
        />
      </div>

      {/* Objectives */}
      {translation.objectives && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {translation.objectives_label || (locale === 'fr' ? 'Objectifs pédagogiques' : 'Learning Objectives')}
          </h2>
          <div 
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: translation.objectives }}
          />
        </div>
      )}

      {/* Course Plan */}
      {translation.plan && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {locale === 'fr' ? 'Programme du cours' : 'Course Plan'}
          </h2>
          <div 
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: translation.plan }}
          />
        </div>
      )}

      {/* Target Audience */}
      {translation.public && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {locale === 'fr' ? 'Public cible' : 'Target Audience'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {translation.public}
          </p>
        </div>
      )}

      {/* Quote */}
      {translation.quote && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8 border-l-4 border-blue-500">
          <blockquote className="text-lg italic text-gray-700 dark:text-gray-300">
            &ldquo;{translation.quote}&rdquo;
          </blockquote>
        </div>
      )}

      {/* Long Description */}
      {translation.long_description && translation.long_description !== translation.description && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {locale === 'fr' ? 'Présentation détaillée' : 'Detailed Presentation'}
          </h2>
          <div 
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: translation.long_description }}
          />
        </div>
      )}

      {/* Back to courses */}
      <div className="text-center">
        <Link 
          href={`/${locale}/courses`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          {locale === 'fr' ? '← Voir tous les cours' : '← View all courses'}
        </Link>
      </div>
    </div>
  );
}