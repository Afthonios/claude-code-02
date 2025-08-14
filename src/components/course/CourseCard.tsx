import Image from 'next/image';
import Link from 'next/link';
import { formatDuration, filterTranslations, getAssetUrlWithTransforms, getParentCompetences } from '@/lib/directus';
import type { DirectusCourse } from '@/types/directus';
import CompetenceBadge from './CompetenceBadge';

interface CourseCardProps {
  course: DirectusCourse;
  locale: string;
}

export default function CourseCard({ course, locale }: CourseCardProps) {
  const translation = filterTranslations(course.translations, locale);
  
  if (!translation) {
    return null;
  }

  // Get course image from Directus or use fallback
  const courseImage = course.course_image;
  const imageUrl = courseImage 
    ? getAssetUrlWithTransforms(
        typeof courseImage === 'string' ? courseImage : courseImage?.id,
        {
          width: 400,
          height: 225,
          fit: 'cover',
          quality: 80,
          format: 'webp'
        }
      )
    : '/images/course-placeholder.svg';
  
  const duration = course.duration ? formatDuration(course.duration, locale) : null;
  const parentCompetences = getParentCompetences(course, locale);

  return (
    <Link 
      href={`/${locale}/courses/${translation.slug}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 group"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={translation.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {translation.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {translation.description}
        </p>
        
        {parentCompetences.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {parentCompetences.map((competence) => (
              <CompetenceBadge
                key={competence.id}
                title={competence.title}
                colorLight={competence.colorLight}
                colorDark={competence.colorDark}
              />
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          {duration && (
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
              {duration}
            </span>
          )}
          <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
            {locale === 'fr' ? 'Voir le cours →' : 'View course →'}
          </span>
        </div>
      </div>
    </Link>
  );
}