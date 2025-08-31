'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, Zap, BookOpen, Anchor, Plus, Video, Clock } from 'lucide-react';
import { createStableHash } from '@/hooks/useHydrationSafeContent';

interface AnimatedCoursePlanProps {
  plan_md: string;
  locale: string;
  courseId: string;
  gradientFromLight?: string;
  gradientToLight?: string;
  gradientFromDark?: string;
  gradientToDark?: string;
  onLight?: string;
  onDark?: string;
}

// Section icons mapping using Lucide React icons
const SECTION_ICONS = {
  fr: {
    'DÉCOUVRIR': Eye,
    'SECOUER': Zap,
    'APPRENDRE': BookOpen,
    'ANCRER': Anchor,
    'RESSOURCES COMPLÉMENTAIRES': Plus
  },
  en: {
    'DISCOVER': Eye,
    'SHAKING UP': Zap,
    'LEARN': BookOpen,
    'ANCHOR': Anchor,
    'ADDITIONAL RESOURCES': Plus
  }
} as const;

interface PlanSection {
  id: string;
  title: string;
  content: string;
  index: number;
}

export default function AnimatedCoursePlan({
  plan_md,
  locale,
  courseId,
  gradientFromLight,
  gradientToLight,
  gradientFromDark,
  gradientToDark,
  onLight,
  onDark,
}: AnimatedCoursePlanProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [isHydrated, setIsHydrated] = useState(false);

  // Check if gradients are provided
  const hasGradient = !!(gradientFromLight && gradientToLight);

  // Process content after hydration
  const firstLineSubtitle = isHydrated ? extractFirstLine(plan_md) : '';
  const sections = isHydrated ? parsePlanSections(plan_md) : [];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Extract the first line of plan_md for the subtitle (before any ### headers)
  function extractFirstLine(content: string): string {
    try {
      // Split by H3 headers to get the intro part
      const h3Regex = /^### (.+)$/gm;
      const parts = content.split(h3Regex);
      
      // The first part is the intro text before any H3 headers
      const introText = parts[0] || '';
      
      // Clean and extract first meaningful line from intro
      const cleanText = introText
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line);
      return lines.length > 0 && lines[0] ? lines[0] : '';
    } catch (error) {
      console.warn('Error extracting first line:', error);
      return '';
    }
  }

  // Parse markdown content into sections using H3 headers as section markers
  function parsePlanSections(markdownContent: string): PlanSection[] {
    try {
      const sections: PlanSection[] = [];
      
      // Split by H3 headers (### SECTION_NAME)
      const h3Regex = /^### (.+)$/gm;
      const parts = markdownContent.split(h3Regex);
      
      // The first part before any H3 is ignored (it's the intro text)
      // Then we have alternating section titles and content
      for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i]?.trim();
        const content = parts[i + 1]?.trim();
        
        if (title && content) {
          sections.push({
            id: `section-${Math.floor(i / 2)}-${createStableHash(title, 6)}`,
            title: title,
            content: content,
            index: Math.floor(i / 2)
          });
        }
      }
      
      // If no H3 sections found, create a single section from all content
      if (sections.length === 0 && markdownContent.trim()) {
        sections.push({
          id: `section-0-${createStableHash(markdownContent, 6)}`,
          title: locale === 'fr' ? 'Contenu' : 'Content',
          content: markdownContent,
          index: 0
        });
      }
      
      return sections;
    } catch (error) {
      console.warn('Error parsing plan sections:', error);
      return [];
    }
  }

  // Helper function to get section icon component
  function getSectionIcon(sectionTitle: string) {
    const normalizedTitle = normalizeSectionTitle(sectionTitle, locale);
    const icons = SECTION_ICONS[locale as keyof typeof SECTION_ICONS];
    
    if (icons && normalizedTitle in icons) {
      return icons[normalizedTitle as keyof typeof icons];
    }
    
    // Default icon fallback
    return BookOpen;
  }

  // Normalize section title for icon lookup
  function normalizeSectionTitle(title: string, locale: string): string {
    const cleanTitle = title.toUpperCase().trim();
    
    // French mappings
    if (locale === 'fr') {
      if (cleanTitle.includes('DÉCOUVRIR') || cleanTitle.includes('DECOUVRIR')) return 'DÉCOUVRIR';
      if (cleanTitle.includes('SECOUER')) return 'SECOUER';
      if (cleanTitle.includes('APPRENDRE')) return 'APPRENDRE';
      if (cleanTitle.includes('ANCRER')) return 'ANCRER';
      if (cleanTitle.includes('RESSOURCES') || cleanTitle.includes('COMPLÉMENTAIRES')) return 'RESSOURCES COMPLÉMENTAIRES';
    }
    
    // English mappings
    if (locale === 'en') {
      if (cleanTitle.includes('DISCOVER')) return 'DISCOVER';
      if (cleanTitle.includes('SHAKING')) return 'SHAKING UP';
      if (cleanTitle.includes('LEARN')) return 'LEARN';
      if (cleanTitle.includes('ANCHOR')) return 'ANCHOR';
      if (cleanTitle.includes('ADDITIONAL') || cleanTitle.includes('RESOURCES')) return 'ADDITIONAL RESOURCES';
    }
    
    return cleanTitle;
  }

  // Format section content with hydration-safe processing
  function formatSectionContent(content: string, hasGradient: boolean, courseId: string) {
    if (!isHydrated) {
      // Return simple text content for server-side rendering
      return <div className="text-gray-700 dark:text-gray-300">{content}</div>;
    }

    // Client-side processing
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) return null;

    const elements: React.ReactElement[] = [];
    let currentGroup: string[] = [];
    let groupIndex = 0;
    
    const processGroup = (group: string[], index: number) => {
      if (group.length === 0) return null;
      
      const mainLine = group[0];
      if (!mainLine) return null;
      
      const subLines = group.slice(1);
      const isMainPoint = /^[a-z]\)\s+/.test(mainLine);
      const groupKey = `group-${index}-${createStableHash(mainLine, 6)}`;
      
      return (
        <div key={groupKey} className="mb-4">
          <div className="flex items-start gap-2 leading-relaxed mb-1">
            <span className={cn(
              hasGradient 
                ? `plan-text-${courseId}`
                : isMainPoint
                  ? "text-gray-900 dark:text-gray-100 font-semibold"
                  : "text-gray-700 dark:text-gray-300",
              "text-base"
            )}>
              {formatLineWithIcons(mainLine)}
            </span>
          </div>
          
          {subLines.map((line, lineIndex) => {
            if (!line) return null;
            const subLineKey = `sub-${lineIndex}-${createStableHash(line, 6)}`;
            return (
              <div key={subLineKey} className="flex items-baseline gap-2 leading-relaxed mb-0.5 ml-6">
                {line.startsWith('-') && (
                  <span className={cn(
                    "flex-shrink-0",
                    hasGradient 
                      ? `plan-text-${courseId}`
                      : "text-gray-500 dark:text-gray-500"
                  )}>
                    •
                  </span>
                )}
                <span className={cn(
                  "text-sm",
                  hasGradient 
                    ? `plan-text-${courseId}`
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {formatLineWithIcons(line.replace(/^-\s*/, ''))}
                </span>
              </div>
            );
          })}
        </div>
      );
    };
    
    // Group lines by main points and their sub-items
    for (const line of lines) {
      if (/^[a-z]\)\s+/.test(line)) {
        if (currentGroup.length > 0) {
          const groupElement = processGroup(currentGroup, groupIndex);
          if (groupElement) {
            elements.push(groupElement);
            groupIndex++;
          }
          currentGroup = [];
        }
        currentGroup.push(line);
      } else {
        currentGroup.push(line);
      }
    }
    
    // Process the last group
    if (currentGroup.length > 0) {
      const groupElement = processGroup(currentGroup, groupIndex);
      if (groupElement) {
        elements.push(groupElement);
      }
    }
    
    return elements.length > 0 ? <div>{elements}</div> : null;
  }

  // Simple icon formatting that works consistently
  function formatLineWithIcons(line: string) {
    if (!isHydrated) {
      return line; // Return plain text on server-side
    }

    const baseKey = createStableHash(line, 8);
    
    // Create a simple array of text and icon elements
    const elements: React.ReactNode[] = [];
    const processedLine = line;
    let elementIndex = 0;

    // Video pattern
    const videoMatch = processedLine.match(/(Vid[eé]o d'expert|Expert video|Storytelling\s*:\s*Vid[eé]o)/i);
    if (videoMatch) {
      const parts = processedLine.split(videoMatch[0]);
      elements.push(
        <span key={`${baseKey}-text-${elementIndex++}`}>{parts[0]}</span>,
        <span key={`${baseKey}-video-text-${elementIndex++}`}>{videoMatch[0]}</span>,
        <Video key={`${baseKey}-video-icon-${elementIndex++}`} className="inline w-4 h-4 mx-1 align-text-bottom text-blue-600 dark:text-blue-400" />,
        <span key={`${baseKey}-text-after-${elementIndex++}`}>{parts[1] || ''}</span>
      );
      return <>{elements}</>;
    }

    // Time pattern
    const timeMatch = processedLine.match(/(\d+'\d+)/);
    if (timeMatch) {
      const parts = processedLine.split(timeMatch[0]);
      elements.push(
        <span key={`${baseKey}-text-${elementIndex++}`}>{parts[0]}</span>,
        <Clock key={`${baseKey}-clock-${elementIndex++}`} className="inline w-4 h-4 mr-1 align-text-bottom text-blue-600 dark:text-blue-400" />,
        <span key={`${baseKey}-time-${elementIndex++}`}>{timeMatch[0]}</span>,
        <span key={`${baseKey}-text-after-${elementIndex++}`}>{parts[1] || ''}</span>
      );
      return <>{elements}</>;
    }

    // If no patterns match, return the original line
    return line;
  }

  // Intersection observer for animations
  useEffect(() => {
    if (!isHydrated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px 20px 0px'
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isHydrated]);

  return (
    <div 
      ref={containerRef} 
      className="mb-8 overflow-visible" 
      style={{
        transform: isVisible ? 'none' : 'translateY(20px)',
        opacity: isVisible ? 1 : 0.7,
        transition: 'all 0.6s ease-out'
      }}
    >
      {/* Gradient styles - only inject after hydration */}
      {isHydrated && hasGradient && (
        <style suppressHydrationWarning dangerouslySetInnerHTML={{
          __html: `
            .course-plan-${courseId} {
              background: linear-gradient(135deg, ${gradientFromLight} 0%, ${gradientToLight} 100%) !important;
            }
            .dark .course-plan-${courseId} {
              background: linear-gradient(135deg, ${gradientFromDark || gradientFromLight} 0%, ${gradientToDark || gradientToLight} 100%) !important;
            }
            .plan-text-${courseId} {
              color: ${onLight || '#000000'} !important;
            }
            .dark .plan-text-${courseId} {
              color: ${onDark || '#ffffff'} !important;
            }
          `
        }} />
      )}
      
      {/* Main title */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {locale === 'fr' ? 'Programme de la formation' : 'Course Curriculum'}
      </h2>
      
      {/* Subtitle with first line of plan_md */}
      {firstLineSubtitle && (
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8" suppressHydrationWarning>
          {firstLineSubtitle}
        </p>
      )}
      
      <div className="space-y-8 sm:space-y-10">
        {sections.map((section, index) => {
          const IconComponent = getSectionIcon(section.title);
          const isAnimated = isVisible && isHydrated;
          const delay = index * 200;
          
          return (
            <div 
              key={section.id}
              ref={(el) => {
                if (el) sectionRefs.current.set(section.id, el);
              }}
              className={cn(
                "group relative transition-all duration-700 ease-out rounded-xl p-6 sm:p-8",
                hasGradient 
                  ? `course-plan-${courseId}`
                  : "bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
              )}
              style={{
                transform: isAnimated ? 'translateY(0)' : 'translateY(30px)',
                opacity: isAnimated ? 1 : 0.3,
                transitionDelay: isAnimated ? `${delay}ms` : '0ms'
              }}
              role="article"
              aria-label={`Section ${section.title}`}
            >
              {/* Section Icon & Title */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  hasGradient 
                    ? "bg-white/20 dark:bg-black/20"
                    : "bg-blue-100 dark:bg-blue-900"
                )}>
                  <IconComponent className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6",
                    hasGradient 
                      ? `plan-text-${courseId}`
                      : "text-blue-600 dark:text-blue-400"
                  )} />
                </div>
                
                <h3 className={cn(
                  "text-lg sm:text-xl font-bold",
                  hasGradient 
                    ? `plan-text-${courseId}`
                    : "text-gray-900 dark:text-gray-100"
                )}>
                  {section.title}
                </h3>
              </div>

              {/* Section Content */}
              <div className={cn(
                "text-base",
                hasGradient 
                  ? `plan-text-${courseId}`
                  : "text-gray-700 dark:text-gray-300"
              )}>
                {formatSectionContent(section.content, hasGradient, courseId)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}