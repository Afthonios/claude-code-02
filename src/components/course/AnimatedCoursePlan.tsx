'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, Zap, BookOpen, Anchor, Plus } from 'lucide-react';

interface AnimatedCoursePlanProps {
  plan: string;
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
  plan,
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
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Parse HTML plan content into structured sections
  const parsePlanSections = (htmlContent: string): PlanSection[] => {
    // Always use plain text parsing to avoid hydration issues
    return parsePlainTextSections(htmlContent);
  };
  
  
  // Fallback function for plain text parsing
  const parsePlainTextSections = (htmlContent: string): PlanSection[] => {
    // Always use server-side parsing to avoid hydration issues
    const textContent = htmlContent
      // Convert HTML line breaks to newlines first
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<h[1-6][^>]*>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ul[^>]*>/gi, '\n')
      // Remove all other HTML tags
      .replace(/<[^>]*>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&eacute;/gi, 'é')
      .replace(/&Eacute;/gi, 'É')
      .replace(/&egrave;/gi, 'è')
      .replace(/&Egrave;/gi, 'È')
      .replace(/&agrave;/gi, 'à')
      .replace(/&Agrave;/gi, 'À')
      .replace(/&acirc;/gi, 'â')
      .replace(/&Acirc;/gi, 'Â')
      .replace(/&ccedil;/gi, 'ç')
      .replace(/&Ccedil;/gi, 'Ç')
      .replace(/&ucirc;/gi, 'û')
      .replace(/&Ucirc;/gi, 'Û')
      // Add line breaks before section keywords for better parsing
      .replace(/(DÉCOUVRIR|DECOUVRIR)/g, '\nDÉCOUVRIR')
      .replace(/(SECOUER)/g, '\nSECOUER')
      .replace(/(APPRENDRE)/g, '\nAPPRENDRE')
      .replace(/(ANCRER)/g, '\nANCRER')
      .replace(/(RESSOURCES COMPLEMENTAIRES|RESSOURCES COMPLÉMENTAIRES)/g, '\nRESSOURCES COMPLÉMENTAIRES')
      .replace(/(DISCOVER)/g, '\nDISCOVER')
      .replace(/(SHAKING UP)/g, '\nSHAKING UP')
      .replace(/(LEARN)/g, '\nLEARN')
      .replace(/(ANCHOR)/g, '\nANCHOR')
      .replace(/(ADDITIONAL RESOURCES)/g, '\nADDITIONAL RESOURCES')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .replace(/\n+/g, '\n')
      .trim();
    
    return parseTextContent(textContent);
  };
  
  // Helper function to parse text content into sections
  const parseTextContent = (textContent: string): PlanSection[] => {
    const sections: PlanSection[] = [];
    
    const mainTopics = locale === 'fr' ? 
      ['DÉCOUVRIR', 'SECOUER', 'APPRENDRE', 'ANCRER'] :
      ['DISCOVER', 'SHAKING UP', 'LEARN', 'ANCHOR'];
    
    const resourcesTopic = locale === 'fr' ? 'RESSOURCES COMPLÉMENTAIRES' : 'ADDITIONAL RESOURCES';
    const allTopics = [...mainTopics, resourcesTopic];
    
    // Split the text using the topic keywords as delimiters
    const currentText = textContent;
    let sectionIndex = 0;
    
    for (const topic of allTopics) {
      const regex = new RegExp(`\\b${topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const match = currentText.match(regex);
      
      if (match && match.index !== undefined) {
        const startIndex = match.index;
        const topicLength = match[0].length;
        
        // Get content after this topic until the next topic or end
        const contentAfterTopic = currentText.substring(startIndex + topicLength);
        let endIndex = contentAfterTopic.length;
        
        // Find the next topic
        for (const nextTopic of allTopics) {
          if (nextTopic === topic) continue;
          const nextRegex = new RegExp(`\\b${nextTopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          const nextMatch = contentAfterTopic.match(nextRegex);
          if (nextMatch && nextMatch.index !== undefined && nextMatch.index < endIndex) {
            endIndex = nextMatch.index;
          }
        }
        
        const sectionContent = contentAfterTopic.substring(0, endIndex).trim();
        
        if (sectionContent) {
          sections.push({
            id: `section-${sectionIndex}`,
            title: topic,
            content: sectionContent,
            index: sectionIndex
          });
          sectionIndex++;
        }
      }
    }
    
    // If no sections were found, create a fallback section with all content
    if (sections.length === 0 && textContent.trim()) {
      sections.push({
        id: 'section-0',
        title: locale === 'fr' ? 'Plan du cours' : 'Course Plan',
        content: textContent,
        index: 0
      });
    }
    
    return sections;
  };

  // Helper function to normalize section titles
  const normalizeSectionTitle = (title: string, locale: string): string => {
    const upperTitle = title.toUpperCase();
    
    if (locale === 'fr') {
      // French mappings (handle both accented and unaccented versions)
      if (upperTitle.includes('DECOUVRIR') || upperTitle.includes('DÉCOUVRIR')) {
        return 'DÉCOUVRIR';
      }
      if (upperTitle.includes('SECOUER')) {
        return 'SECOUER';
      }
      if (upperTitle.includes('APPRENDRE')) {
        return 'APPRENDRE';
      }
      if (upperTitle.includes('ANCRER')) {
        return 'ANCRER';
      }
      if (upperTitle.includes('RESSOURCES') && upperTitle.includes('COMPLEMENTAIRES')) {
        return 'RESSOURCES COMPLÉMENTAIRES';
      }
    } else {
      // English mappings
      if (upperTitle.includes('DISCOVER')) {
        return 'DISCOVER';
      }
      if (upperTitle.includes('SHAKING')) {
        return 'SHAKING UP';
      }
      if (upperTitle.includes('LEARN')) {
        return 'LEARN';
      }
      if (upperTitle.includes('ANCHOR')) {
        return 'ANCHOR';
      }
      if (upperTitle.includes('ADDITIONAL') && upperTitle.includes('RESOURCES')) {
        return 'ADDITIONAL RESOURCES';
      }
    }
    
    // Return original title if no match found
    return title;
  };

  // Helper function to format section content with proper hierarchy
  const formatSectionContent = (content: string, hasGradient: boolean, courseId: string) => {
    // First convert HTML to text and handle the structure properly
    const processedContent = content
      // Convert HTML line breaks to newlines first
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<h[1-6][^>]*>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ul[^>]*>/gi, '\n')
      // Remove all other HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&eacute;/gi, 'é')
      .replace(/&Eacute;/gi, 'É')
      .replace(/&egrave;/gi, 'è')
      .replace(/&Egrave;/gi, 'È')
      .replace(/&agrave;/gi, 'à')
      .replace(/&Agrave;/gi, 'À')
      .replace(/&acirc;/gi, 'â')
      .replace(/&Acirc;/gi, 'Â')
      .replace(/&ccedil;/gi, 'ç')
      .replace(/&Ccedil;/gi, 'Ç')
      .replace(/&ucirc;/gi, 'û')
      .replace(/&Ucirc;/gi, 'Û')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .replace(/\n+/g, '\n')
      .trim();

    const lines = processedContent.split('\n').filter(line => line.trim());
    
    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      
      // Check if this is a main point (starts with a), b), c), etc.)
      const isMainPoint = /^[a-z]\)/.test(trimmedLine);
      
      // Sub-points are lines that don't start with a letter followed by )
      // and are not section titles (which would be handled elsewhere)
      const isSubPoint = !isMainPoint && !trimmedLine.match(/^(DISCOVER|SHAKING UP|LEARN|ANCHOR|ADDITIONAL RESOURCES|DÉCOUVRIR|SECOUER|APPRENDRE|ANCRER|RESSOURCES)/i);
      
      return (
        <div key={lineIndex} className={cn(
          isMainPoint ? "mb-3 mt-2" : isSubPoint ? "mb-1 ml-6 text-sm" : "mb-1", 
          "last:mb-0"
        )}>
          {isMainPoint ? (
            // Main point - show the a), b), c) as is with bold styling
            <div className={cn(
              "font-semibold leading-relaxed",
              hasGradient 
                ? `plan-text-${courseId}`
                : "text-gray-900 dark:text-gray-100"
            )}>
              {trimmedLine}
            </div>
          ) : isSubPoint ? (
            // Sub-point - indented and slightly less prominent
            <div className={cn(
              "opacity-85 leading-relaxed pl-2 border-l-2 border-opacity-30",
              hasGradient 
                ? `plan-text-${courseId} border-current`
                : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
            )}>
              {trimmedLine}
            </div>
          ) : (
            // Regular content
            <div className={cn(
              "leading-relaxed",
              hasGradient 
                ? `plan-text-${courseId}`
                : "text-gray-700 dark:text-gray-300"
            )}>
              {trimmedLine}
            </div>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  const sections = parsePlanSections(plan);

  // Helper function to get section icon component
  const getSectionIcon = (sectionTitle: string) => {
    const normalizedTitle = normalizeSectionTitle(sectionTitle, locale);
    const icons = SECTION_ICONS[locale as keyof typeof SECTION_ICONS];
    
    if (icons && normalizedTitle in icons) {
      return icons[normalizedTitle as keyof typeof icons];
    }
    
    // Fallback: return default icon
    return Plus;
  };


  // Helper function to get section description for accessibility
  const getSectionDescription = (sectionTitle: string): string => {
    const normalizedTitle = normalizeSectionTitle(sectionTitle, locale);
    
    const descriptions = {
      fr: {
        'DÉCOUVRIR': 'Section découverte (cercle) - Explorer et identifier',
        'SECOUER': 'Section transformation (losange) - Dynamiser et modifier',
        'APPRENDRE': 'Section apprentissage (triangle) - Acquérir des connaissances',
        'ANCRER': 'Section ancrage (carré) - Consolider et intégrer',
        'RESSOURCES COMPLÉMENTAIRES': 'Ressources supplémentaires (étoile) et matériel d\'accompagnement'
      },
      en: {
        'DISCOVER': 'Discovery section (circle) - Explore and identify',
        'SHAKING UP': 'Transformation section (diamond) - Energize and modify',
        'LEARN': 'Learning section (triangle) - Acquire knowledge',
        'ANCHOR': 'Anchoring section (square) - Consolidate and integrate',
        'ADDITIONAL RESOURCES': 'Additional resources (star) and supporting material'
      }
    };
    
    const localeDescriptions = descriptions[locale as keyof typeof descriptions];
    if (localeDescriptions && normalizedTitle in localeDescriptions) {
      return localeDescriptions[normalizedTitle as keyof typeof localeDescriptions];
    }
    
    return sectionTitle;
  };

  // Container visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, []);

  // Individual section observers
  useEffect(() => {
    const observers = new Map<string, IntersectionObserver>();
    
    sections.forEach((section) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, section.id]));
          }
        },
        {
          threshold: 0.3,
          rootMargin: '0px 0px -20px 0px'
        }
      );
      
      const element = sectionRefs.current.get(section.id);
      if (element) {
        observer.observe(element);
        observers.set(section.id, observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [sections]);

  // Generate gradient styles
  const getGradientStyles = () => {
    const hasGradient = gradientFromLight && gradientToLight && gradientFromDark && gradientToDark;
    
    if (!hasGradient) return {};
    
    return {
      '--light-gradient': `linear-gradient(135deg, ${gradientFromLight} 0%, ${gradientToLight} 100%)`,
      '--dark-gradient': `linear-gradient(135deg, ${gradientFromDark} 0%, ${gradientToDark} 100%)`,
      '--light-text': onLight || '#000000',
      '--dark-text': onDark || '#ffffff',
    } as React.CSSProperties;
  };

  const hasGradient = gradientFromLight && gradientToLight && gradientFromDark && gradientToDark;

  return (
    <div 
      ref={containerRef}
      className="mb-8 overflow-visible"
      style={getGradientStyles()}
    >
      {/* Inject CSS for gradient styling and animations */}
      {hasGradient && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .plan-gradient-${courseId} {
              background: var(--light-gradient);
              background-size: 200% 200%;
              position: relative;
              overflow: hidden;
            }
            .dark .plan-gradient-${courseId} {
              background: var(--dark-gradient);
              background-size: 200% 200%;
            }
            .plan-gradient-${courseId}:hover {
              animation: gradient-shift 4s ease-in-out infinite;
            }
            .plan-gradient-${courseId}::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.8s ease;
            }
            .plan-gradient-${courseId}:hover::before {
              left: 100%;
            }
            .plan-text-${courseId} {
              color: var(--light-text);
            }
            .dark .plan-text-${courseId} {
              color: var(--dark-text);
            }
            @keyframes gradient-shift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes pulse-glow {
              0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
              50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
            }
          `
        }} />
      )}
      
      {/* Additional animations for non-gradient sections */}
      {!hasGradient && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .plan-section-${courseId}:hover {
              animation: pulse-glow 2s ease-in-out infinite;
            }
            @keyframes pulse-glow {
              0%, 100% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
              50% { box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04); }
            }
          `
        }} />
      )}
      
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8">
        {locale === 'fr' ? 'Ce module contient 4 parties :' : 'This module contains 4 parts:'}
      </h2>
      
      <div className="space-y-6">
        {sections.map((section, index) => {
          const isAnimated = isVisible && visibleSections.has(section.id);
          const delay = index * 200;
          
          // Check if this is the "RESSOURCES COMPLEMENTAIRES" section
          const isResourcesSection = section.title.toUpperCase().includes('RESSOURCES') || 
                                    section.title.toUpperCase().includes('ADDITIONAL');
          
          // Get the section number based on the 4 main topics
          const mainTopics = locale === 'fr' ? 
            ['DÉCOUVRIR', 'SECOUER', 'APPRENDRE', 'ANCRER'] :
            ['DISCOVER', 'SHAKING UP', 'LEARN', 'ANCHOR'];
          
          const sectionIndex = mainTopics.findIndex(topic => {
            const upperTitle = section.title.toUpperCase();
            const upperTopic = topic.toUpperCase();
            
            // Direct match
            if (upperTitle.includes(upperTopic)) {
              return true;
            }
            
            // Handle accent variations for French
            if (locale === 'fr') {
              if (upperTopic === 'DÉCOUVRIR' && upperTitle.includes('DECOUVRIR')) {
                return true;
              }
            }
            
            return false;
          });
          
          // Only show number for the 4 main topics (index >= 0), use symbol for resources
          const isNumbered = sectionIndex >= 0 && !isResourcesSection;
          const sectionNumber = sectionIndex + 1;
          
          // Get the appropriate icon component for this section
          const IconComponent = getSectionIcon(section.title);
          
          return (
            <div
              key={section.id}
              ref={(el) => {
                if (el) {
                  sectionRefs.current.set(section.id, el);
                }
              }}
              className={cn(
                "group relative rounded-xl p-6 sm:p-8 transition-all duration-700 transform cursor-default overflow-visible",
                hasGradient 
                  ? `plan-gradient-${courseId} shadow-lg hover:shadow-xl`
                  : `plan-section-${courseId} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800`,
                isAnimated 
                  ? "opacity-100 translate-y-0 scale-100" 
                  : "opacity-0 translate-y-8 scale-95",
                "hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]"
              )}
              role="article"
              aria-label={getSectionDescription(section.title)}
              style={{
                transitionDelay: isAnimated ? `${delay}ms` : '0ms',
                animationDelay: isAnimated ? `${delay}ms` : '0ms',
              }}
            >
              {/* Section Number or Symbol - positioned at bottom left */}
              <div className={cn(
                "absolute bottom-4 left-4 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg z-10",
                hasGradient 
                  ? `plan-text-${courseId} bg-white/20 dark:bg-black/20 backdrop-blur-sm`
                  : "bg-blue-600 dark:bg-blue-500 text-white"
              )}>
                {isNumbered ? sectionNumber : '⟡'}
              </div>
              
              {/* Section Title */}
              <h3 className={cn(
                "text-base sm:text-lg font-bold mb-2 sm:mb-3 uppercase tracking-wide pr-8 sm:pr-12",
                hasGradient 
                  ? `plan-text-${courseId}`
                  : "text-blue-900 dark:text-blue-100"
              )}>
                {section.title}
              </h3>
              
              {/* Section Content */}
              <div className={cn(
                "text-sm leading-relaxed pr-16 sm:pr-20 mb-16",
                hasGradient 
                  ? `plan-text-${courseId} opacity-90`
                  : "text-gray-700 dark:text-gray-300"
              )}>
                {formatSectionContent(section.content, hasGradient, courseId)}
              </div>
              
              {/* Large Icon in right side - overlapping text */}
              <div className={cn(
                "absolute top-6 right-6 opacity-20 transition-all duration-300",
                "group-hover:opacity-30 group-hover:scale-110",
                hasGradient 
                  ? `plan-text-${courseId}`
                  : "text-blue-600 dark:text-blue-400"
              )}>
                <IconComponent 
                  size={64} 
                  className="sm:w-20 sm:h-20"
                  aria-label={`${locale === 'fr' ? 'Icône de section' : 'Section icon'}: ${getSectionDescription(section.title)}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bottom decorative line */}
      <div className={cn(
        "mt-6 sm:mt-8 h-1 rounded-full mx-auto transition-all duration-1000",
        isVisible ? "w-24 sm:w-32 opacity-100" : "w-0 opacity-0",
        hasGradient 
          ? "bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-black/30"
          : "bg-gradient-to-r from-transparent via-blue-400 to-transparent dark:via-blue-600"
      )} />
    </div>
  );
}