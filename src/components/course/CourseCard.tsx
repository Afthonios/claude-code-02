import Image from 'next/image';
import Link from 'next/link';
import { formatDuration, filterTranslations, getAssetUrlWithTransforms, getCourseUrl } from '@/lib/directus';
import { getCourseGradientStyles, cn, type CourseGradientData } from '@/lib/utils';
import BookmarkButton from './BookmarkButton';
import type { DirectusCourse } from '@/types/directus';

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

  // Get gradient styles for the course card
  const gradientData: CourseGradientData = {};
  if (course.gradient_from_light) gradientData.gradient_from_light = course.gradient_from_light;
  if (course.gradient_to_light) gradientData.gradient_to_light = course.gradient_to_light;
  if (course.gradient_from_dark) gradientData.gradient_from_dark = course.gradient_from_dark;
  if (course.gradient_to_dark) gradientData.gradient_to_dark = course.gradient_to_dark;
  if (course.on_light) gradientData.on_light = course.on_light;
  if (course.on_dark) gradientData.on_dark = course.on_dark;
  const gradientStyles = getCourseGradientStyles(gradientData);

  return (
    <>
      {/* Inject CSS for this specific card */}
      {gradientStyles.hasGradient && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .course-card-${course.id} {
              background: ${course.gradient_from_light && course.gradient_to_light 
                ? `linear-gradient(135deg, ${course.gradient_from_light} 0%, ${course.gradient_to_light} 100%)`
                : 'transparent'} !important;
            }
            .dark .course-card-${course.id} {
              background: ${course.gradient_from_dark && course.gradient_to_dark 
                ? `linear-gradient(135deg, ${course.gradient_from_dark} 0%, ${course.gradient_to_dark} 100%)`
                : 'transparent'} !important;
            }
            .course-card-${course.id}-text {
              color: ${course.on_light || '#000000'} !important;
            }
            .dark .course-card-${course.id}-text {
              color: ${course.on_dark || '#ffffff'} !important;
            }
          `
        }} />
      )}
      
      <Link 
        href={getCourseUrl(course, locale)}
        className={cn(
          "course-card-link rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border group relative",
          gradientStyles.hasGradient 
            ? `border-transparent course-card-${course.id}` 
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        )}
        aria-label={`${translation.title} - ${locale === 'fr' ? 'Voir le cours' : 'View course'}`}
      >
      <div className="relative z-10 course-card-content">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={translation.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          
          {/* Bookmark button positioned in top-right corner */}
          <div className="absolute top-2 right-2 z-10">
            <BookmarkButton 
              courseId={course.id} 
              size="sm"
              className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full hover:bg-white/30 dark:hover:bg-black/30"
            />
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-1">
          <h3 
            className={cn(
              "text-xl font-semibold mb-2 group-hover:opacity-80 transition-all duration-200",
              gradientStyles.hasGradient 
                ? `course-card-${course.id}-text`
                : "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            )}
          >
            {translation.title}
          </h3>
          
          <p 
            className={cn(
              "text-sm mb-4 opacity-90 course-card-text flex-1",
              gradientStyles.hasGradient 
                ? `course-card-${course.id}-text`
                : "text-gray-600 dark:text-gray-400"
            )}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {translation.description}
          </p>
          
          <div 
            className={cn(
              "flex items-center justify-between text-sm mt-auto",
              gradientStyles.hasGradient 
                ? `course-card-${course.id}-text`
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            {duration && (
              <span className={cn(
                "px-2 py-1 rounded text-xs",
                gradientStyles.hasGradient 
                  ? "bg-white/20 backdrop-blur-sm"
                  : "bg-gray-100 dark:bg-gray-700"
              )}>
                {duration}
              </span>
            )}
            <span 
              className={cn(
                "font-medium group-hover:translate-x-1 transition-transform duration-200",
                gradientStyles.hasGradient 
                  ? `course-card-${course.id}-text`
                  : "text-blue-600 dark:text-blue-400"
              )}
            >
              {locale === 'fr' ? 'Voir le cours →' : 'View course →'}
            </span>
          </div>
        </div>
      </div>
    </Link>
    </>
  );
}