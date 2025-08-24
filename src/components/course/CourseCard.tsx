"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { formatDuration, filterTranslations, getAssetUrlWithTransforms, getCourseUrl } from '@/lib/directus';
import { getCourseGradientStyles, cn, type CourseGradientData } from '@/lib/utils';
import BookmarkButton from './BookmarkButton';
import FrenchText from '../ui/FrenchText';
import type { DirectusCourse } from '@/types/directus';

interface CourseCardProps {
  course: DirectusCourse;
  locale: string;
}

// Comprehensive text cleaning function
const cleanDescription = (text: string | undefined): string => {
  if (!text) return '';
  
  // Remove all types of whitespace and replace with single spaces
  // This includes: regular spaces, non-breaking spaces, em spaces, en spaces, 
  // thin spaces, zero-width spaces, etc.
  return text
    .trim()
    .replace(/[\s\u00A0\u1680\u2000-\u200D\u2028\u2029\u202F\u205F\u3000\uFEFF]+/g, ' ')
    .replace(/\u200B/g, '') // Remove zero-width spaces
    .trim();
};

export default function CourseCard({ course, locale }: CourseCardProps) {
  const t = useTranslations('courses');
  const translation = filterTranslations(course.translations, locale);
  
  // State for dynamic line allocation (7 total lines: title + description)
  const [titleLines, setTitleLines] = useState(2); // Default assumption
  const [descriptionLines, setDescriptionLines] = useState(5); // 7 - 2
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Effect to measure title lines and calculate description lines
  useEffect(() => {
    if (!titleRef.current || !translation?.title) return;

    const measureTitleLines = () => {
      const element = titleRef.current;
      if (!element) return;

      // Get computed line height
      const computedStyle = window.getComputedStyle(element);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      
      // If line-height is 'normal' or not a number, calculate it
      const fontSize = parseFloat(computedStyle.fontSize);
      const actualLineHeight = isNaN(lineHeight) ? fontSize * 1.2 : lineHeight; // 1.2 is typical for 'normal'
      
      // Get actual height of the element
      const height = element.scrollHeight;
      
      // Calculate number of lines
      const calculatedLines = Math.round(height / actualLineHeight);
      
      // Clamp between 1 and 6 lines (leave at least 1 line for description)
      const clampedTitleLines = Math.min(Math.max(calculatedLines, 1), 6);
      const remainingDescriptionLines = 7 - clampedTitleLines;
      
      // Only update if different to prevent unnecessary re-renders
      if (clampedTitleLines !== titleLines) {
        setTitleLines(clampedTitleLines);
        setDescriptionLines(remainingDescriptionLines);
      }
    };

    // Measure on mount
    measureTitleLines();

    // Measure on resize (for responsive behavior)
    const handleResize = () => measureTitleLines();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [translation?.title, titleLines]); // Include titleLines to prevent infinite loops

  if (!translation) {
    return null;
  }

  // Determine button text based on course type
  const getViewButtonText = () => {
    if (course.course_type === 'Parcours') {
      return t('viewLearningPath');
    }
    // Default to micro course for 'Formation' or any other type
    return t('viewMicroCourse');
  };

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
          "course-card-link rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border group relative flex flex-col h-full min-h-[420px]",
          gradientStyles.hasGradient 
            ? `border-transparent course-card-${course.id}` 
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        )}
        aria-label={`${translation.title} - ${getViewButtonText()}`}
      >
      <div className="relative z-10 course-card-content flex flex-col flex-1">
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
          <FrenchText 
            as="h3"
            ref={titleRef}
            className={cn(
              "text-xl font-semibold mb-3 group-hover:opacity-80 transition-all duration-200 course-title leading-tight",
              gradientStyles.hasGradient 
                ? `course-card-${course.id}-text`
                : "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            )}
          >
            {translation.title}
          </FrenchText>
          
          <FrenchText 
            as="p"
            className={cn(
              "text-sm mb-5 opacity-90 course-card-text flex-1 leading-relaxed",
              gradientStyles.hasGradient 
                ? `course-card-${course.id}-text`
                : "text-gray-600 dark:text-gray-400"
            )}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: descriptionLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.5em',
              maxHeight: `${descriptionLines * 1.5}em`,
              wordWrap: 'break-word',
              whiteSpace: 'pre-line'
            }}
          >
            {cleanDescription(translation.description)}
          </FrenchText>
          
          <div 
            className={cn(
              "flex items-center justify-between text-sm mt-auto pt-3",
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
              {getViewButtonText()}
            </span>
          </div>
        </div>
      </div>
    </Link>
    </>
  );
}