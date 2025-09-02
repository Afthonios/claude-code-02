'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatDuration, filterTranslations, getAssetUrlWithTransforms, getCoursesListUrl } from '@/lib/directus';
import { getCourseGradientStyles, cn, renderSafeHTML, type CourseGradientData } from '@/lib/utils';
import type { DirectusCourse } from '@/types/directus';
import BookmarkButton from './BookmarkButton';
import AnimatedCoursePlan from './AnimatedCoursePlan';
import { Clock } from 'lucide-react';

interface CourseDetailProps {
  course: DirectusCourse;
  locale: string;
}

export default function CourseDetail({ course, locale }: CourseDetailProps) {
  const translation = filterTranslations(course.translations, locale);
  const objectivesRef = useRef<HTMLUListElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Pre-compute the objectives label to ensure consistency
  const objectivesLabel = translation?.objectives_label || 
    (locale === 'fr' ? 'Dans cette formation en ligne, vous découvrirez comment :' : 'In this online training, you will discover how to:');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '0px 0px 20px 0px' // Start animation 20px before the element is fully in view
      }
    );

    const currentRef = objectivesRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMounted]);
  
  if (!translation) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {locale === 'fr' ? 'Cours non trouvé' : 'Course not found'}
        </h1>
        <p className="text-gray-600 dark:text-gray-200">
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

  // Get gradient styles for the course detail
  const gradientData: CourseGradientData = {};
  if (course.gradient_from_light) gradientData.gradient_from_light = course.gradient_from_light;
  if (course.gradient_to_light) gradientData.gradient_to_light = course.gradient_to_light;
  if (course.gradient_from_dark) gradientData.gradient_from_dark = course.gradient_from_dark;
  if (course.gradient_to_dark) gradientData.gradient_to_dark = course.gradient_to_dark;
  if (course.on_light) gradientData.on_light = course.on_light;
  if (course.on_dark) gradientData.on_dark = course.on_dark;
  const gradientStyles = getCourseGradientStyles(gradientData);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Inject CSS for gradient styling */}
      {hasMounted && gradientStyles.hasGradient && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .course-detail-${course.id} {
              background: ${course.gradient_from_light && course.gradient_to_light 
                ? `linear-gradient(135deg, ${course.gradient_from_light} 0%, ${course.gradient_to_light} 100%)`
                : 'transparent'} !important;
            }
            .dark .course-detail-${course.id} {
              background: ${course.gradient_from_dark && course.gradient_to_dark 
                ? `linear-gradient(135deg, ${course.gradient_from_dark} 0%, ${course.gradient_to_dark} 100%)`
                : 'transparent'} !important;
            }
            .course-detail-${course.id}-text {
              color: ${course.on_light || '#000000'} !important;
            }
            .dark .course-detail-${course.id}-text {
              color: ${course.on_dark || '#ffffff'} !important;
            }
          `
        }} />
      )}
      
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link 
          href={getCoursesListUrl(locale)}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
        >
          <span className="mr-1">←</span>
          <span>{locale === 'fr' ? 'Retour aux cours' : 'Back to courses'}</span>
        </Link>
      </nav>

      {/* Combined Hero and Course Information */}
      <div className={cn(
        "rounded-lg shadow-lg overflow-hidden mb-8",
        gradientStyles.hasGradient 
          ? `course-detail-${course.id}` 
          : "bg-white dark:bg-gray-800"
      )}>
        {/* Image Section */}
        <div className="relative w-full max-h-80 overflow-hidden">
          <Image
            src={imageUrl}
            alt={translation.title}
            width={800}
            height={400}
            className="w-full h-auto object-contain"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Bookmark button positioned in top-right corner */}
          <div className="absolute top-4 right-4 z-10">
            <BookmarkButton 
              courseId={course.id} 
              size="md"
              className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full hover:bg-white/30 dark:hover:bg-black/30"
            />
          </div>
          
          {/* Duration positioned in bottom-right corner */}
          {duration && (
            <div className="absolute bottom-4 right-4 z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/80 dark:bg-black/80 backdrop-blur-sm text-gray-900 dark:text-white">
                <Clock className="w-4 h-4 mr-1" />
                {duration}
              </span>
            </div>
          )}
          
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
        
        {/* Course Information - No gap */}
        <div className="p-4">

          {/* Description */}
          <div 
            className={cn(
              "prose max-w-none mb-3 text-sm",
              gradientStyles.hasGradient 
                ? `course-detail-${course.id}-text prose-headings:course-detail-${course.id}-text prose-p:course-detail-${course.id}-text`
                : "prose-gray dark:prose-invert"
            )}
            dangerouslySetInnerHTML={{ __html: translation.description }}
          />

          {/* Target Audience - moved here from later in the component */}
          {translation.public && (
            <div className="mt-4">
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                gradientStyles.hasGradient 
                  ? `course-detail-${course.id}-text`
                  : "text-gray-900 dark:text-gray-100"
              )}>
                {locale === 'fr' ? 'Public cible' : 'Target Audience'}
              </h3>
              <p className={cn(
                "text-sm",
                gradientStyles.hasGradient 
                  ? `course-detail-${course.id}-text`
                  : "text-gray-700 dark:text-gray-100"
              )}>
                {translation.public}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Launch Course Button - standalone section */}
      <div className="mb-8 text-center">
        <button
          className="px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-lg"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            borderColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(var(--primary))';
          }}
          onClick={() => {
            // TODO: Implement course launch functionality
            console.log('Launch course:', course.id);
          }}
        >
          {locale === 'fr' ? 'Lancer le cours' : 'Launch Course'}
        </button>
      </div>

      {/* Objectives - No Box Styling */}
      {translation.objectives_json && translation.objectives_json.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4" suppressHydrationWarning>
            {objectivesLabel}
          </h2>
          <ul ref={objectivesRef} className="space-y-3">
            {translation.objectives_json.map((objective, index) => (
              <li 
                key={index} 
                className={cn(
                  "flex transition-all duration-500",
                  "opacity-0 translate-y-4"
                )}
                style={{ 
                  transitionDelay: '0ms',
                  ...(hasMounted && isVisible && {
                    opacity: 1,
                    transform: 'translateY(0)',
                    transitionDelay: `${(index + 1) * 200}ms`
                  })
                }}
              >
                <span className="text-primary mr-3 mt-0.5 text-lg leading-none flex-shrink-0">•</span>
                <span className="text-gray-700 dark:text-gray-100 leading-relaxed">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Course Plan - Animated Cards */}
      {translation.plan_md && (
        <div className="mb-8">
          <AnimatedCoursePlan
            plan_md={translation.plan_md}
            locale={locale}
            courseId={course.id}
            {...(course.gradient_from_light && { gradientFromLight: course.gradient_from_light })}
            {...(course.gradient_to_light && { gradientToLight: course.gradient_to_light })}
            {...(course.gradient_from_dark && { gradientFromDark: course.gradient_from_dark })}
            {...(course.gradient_to_dark && { gradientToDark: course.gradient_to_dark })}
            {...(course.on_light && { onLight: course.on_light })}
            {...(course.on_dark && { onDark: course.on_dark })}
          />
        </div>
      )}

      {/* Quote - Simple Centered Design */}
      {translation.quote && (
        <div className="text-center py-8 mb-12">
          <blockquote className="text-xl md:text-2xl font-light italic text-gray-700 dark:text-gray-100 leading-relaxed max-w-4xl mx-auto">
            <span className="text-4xl text-blue-500 dark:text-blue-400 font-serif leading-none">&ldquo;</span>
            <span className="mx-2" style={{hyphens: 'none', wordBreak: 'keep-all', overflowWrap: 'break-word'}}>
              {renderSafeHTML(translation.quote)}
            </span>
            <span className="text-4xl text-blue-500 dark:text-blue-400 font-serif leading-none">&rdquo;</span>
          </blockquote>
          {course.quote_author && (
            <cite className="block mt-6 text-base font-medium text-gray-600 dark:text-gray-200 not-italic" style={{wordBreak: 'keep-all'}}>
              &mdash; {course.quote_author}
            </cite>
          )}
        </div>
      )}

      {/* Long Description - No Box Styling */}
      {translation.long_description && translation.long_description !== translation.description && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {locale === 'fr' ? 'Présentation détaillée' : 'Detailed Presentation'}
          </h2>
          <div 
            className="prose prose-gray dark:prose-invert max-w-none prose-ul:list-none prose-li:flex prose-li:items-start prose-li:mb-2 prose-li:before:content-['•'] prose-li:before:text-primary prose-li:before:mr-3 prose-li:before:mt-1"
            dangerouslySetInnerHTML={{ __html: translation.long_description }}
          />
        </div>
      )}

      {/* Back to courses */}
      <div className="text-center">
        <Link 
          href={getCoursesListUrl(locale)}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          {locale === 'fr' ? '← Voir tous les cours' : '← View all courses'}
        </Link>
      </div>
    </div>
  );
}