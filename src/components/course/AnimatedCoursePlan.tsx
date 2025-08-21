'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, Zap, BookOpen, Anchor, Plus, Video, Youtube, Download, Clock, CheckSquare, XSquare, Grid3X3 } from 'lucide-react';

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
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Parse markdown plan content into structured sections
  const parsePlanSections = (markdownContent: string): PlanSection[] => {
    return parseMarkdownSections(markdownContent);
  };
  
  
  // Parse markdown content into sections using H3 headers as section markers
  const parseMarkdownSections = (markdownContent: string): PlanSection[] => {
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
          id: `section-${Math.floor(i / 2)}`,
          title: title,
          content: content,
          index: Math.floor(i / 2)
        });
      }
    }
    
    // If no H3 sections found, fall back to the old parsing method
    if (sections.length === 0) {
      return parseLegacyTextSections(markdownContent);
    }
    
    return sections;
  };
  
  // Fallback function for legacy text parsing (kept for compatibility)
  const parseLegacyTextSections = (htmlContent: string): PlanSection[] => {
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

  // Helper function to detect trigger words and add icons after them
  const addIconsToText = (text: string, _hasGradient: boolean, _courseId: string) => {
    const triggerWords: { word: RegExp; icon: React.ComponentType<{ className?: string; width?: number; height?: number }> }[] = [
      // No trigger words - all icons disabled
    ];

    const processedText = text;
    const iconElements: { position: number; icon: React.ComponentType<{ className?: string; width?: number; height?: number }>; id: string }[] = [];
    
    triggerWords.forEach((trigger, triggerIndex) => {
      let match;
      while ((match = trigger.word.exec(processedText)) !== null) {
        const IconComponent = trigger.icon;
        const iconId = `icon-${triggerIndex}-${match.index}`;
        
        iconElements.push({
          position: match.index + match[0].length,
          icon: IconComponent,
          id: iconId
        });
      }
    });

    // Sort icons by position (reverse order to insert from end to start)
    iconElements.sort((a, b) => b.position - a.position);

    return { text: processedText, iconElements };
  };

  // Helper function to format markdown section content
  const formatSectionContent = (content: string, hasGradient: boolean, courseId: string) => {
    if (!content || !content.trim()) return null;
    
    // Split content into lines
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) return null;

    const elements: React.ReactElement[] = [];
    let currentGroup: string[] = [];
    let groupIndex = 0;
    
    const processGroup = (group: string[], index: number) => {
      if (group.length === 0) return null;
      
      const mainLine = group[0];
      const subLines = group.slice(1);
      
      // Check if this is a main point (starts with letter+))
      const isMainPoint = /^[a-z]\)\s+/.test(mainLine);
      
      return (
        <div key={`group-${index}`} className="mb-4">
          {/* Main line - no bullet point for a), b), c) items */}
          <div className="flex items-start gap-2 leading-relaxed mb-1">
            <span className={cn(
              hasGradient 
                ? `plan-text-${courseId}`
                : isMainPoint
                  ? "text-gray-900 dark:text-gray-100 font-semibold"
                  : "text-gray-700 dark:text-gray-300",
              "text-base"
            )}>
              {formatLineWithIcons(mainLine, hasGradient, courseId)}
            </span>
          </div>
          
          {/* Sub-lines (use bullet points instead of dashes) */}
          {subLines.map((line, lineIndex) => (
            <div key={`sub-${lineIndex}`} className="flex items-baseline gap-2 leading-relaxed mb-0.5 ml-6">
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
                {formatLineWithIcons(line.replace(/^-\s*/, ''), hasGradient, courseId)}
              </span>
            </div>
          ))}
        </div>
      );
    };
    
    // Group lines by main points and their sub-items
    for (const line of lines) {
      // If it's a new main point (starts with letter+)), process previous group
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
        // It's a continuation or sub-item
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
  };

  // Helper function to format a line with specific icons
  const formatLineWithIcons = (line: string, hasGradient: boolean, courseId: string) => {
    const elements: React.ReactElement[] = [];
    let remainingText = line;
    let keyIndex = 0;
    
    // Pattern 1: Add video icon after video-related content
    const videoExpertRegex = /(Vid[eé]o d'expert|Expert video|Storytelling\s*:\s*Vid[eé]o)/gi;
    let match;
    let lastIndex = 0;
    
    while ((match = videoExpertRegex.exec(line)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${keyIndex++}`}>
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add the matched text
      elements.push(
        <span key={`video-text-${keyIndex++}`}>
          {match[0]}
        </span>
      );
      
      // Add video icon
      elements.push(
        <Video
          key={`video-icon-${keyIndex++}`}
          className={cn(
            "inline w-4 h-4 mx-1 align-text-bottom",
            hasGradient 
              ? `plan-text-${courseId}`
              : "text-blue-600 dark:text-blue-400"
          )}
        />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Pattern for downloadable documents
    const downloadRegex = /(Documents t[eé]l[eé]chargeables|Downloadable documents)/gi;
    let downloadMatch;
    let downloadLastIndex = lastIndex;
    
    while ((downloadMatch = downloadRegex.exec(line.substring(lastIndex))) !== null) {
      const actualIndex = lastIndex + downloadMatch.index;
      const actualEnd = actualIndex + downloadMatch[0].length;
      
      // Add text before download match
      if (actualIndex > downloadLastIndex) {
        elements.push(
          <span key={`download-text-before-${keyIndex++}`}>
            {line.substring(downloadLastIndex, actualIndex)}
          </span>
        );
      }
      
      // Add the matched text
      elements.push(
        <span key={`download-text-${keyIndex++}`}>
          {downloadMatch[0]}
        </span>
      );
      
      // Add download icon
      elements.push(
        <Download
          key={`download-icon-${keyIndex++}`}
          className={cn(
            "inline w-4 h-4 mx-1 align-text-bottom",
            hasGradient 
              ? `plan-text-${courseId}`
              : "text-blue-600 dark:text-blue-400"
          )}
        />
      );
      
      downloadLastIndex = actualEnd;
    }
    
    // Update lastIndex to include download processing
    if (downloadLastIndex > lastIndex) {
      lastIndex = downloadLastIndex;
    }
    
    // Pattern for VRAI/FAUX or TRUE/FALSE
    const trueFalseRegex = /(VRAI\/FAUX|TRUE\/FALSE)/gi;
    let trueFalseMatch;
    let trueFalseLastIndex = lastIndex;
    
    while ((trueFalseMatch = trueFalseRegex.exec(line.substring(lastIndex))) !== null) {
      const actualIndex = lastIndex + trueFalseMatch.index;
      const actualEnd = actualIndex + trueFalseMatch[0].length;
      
      // Add text before true/false match
      if (actualIndex > trueFalseLastIndex) {
        elements.push(
          <span key={`truefalse-text-before-${keyIndex++}`}>
            {line.substring(trueFalseLastIndex, actualIndex)}
          </span>
        );
      }
      
      // Add the matched text
      elements.push(
        <span key={`truefalse-text-${keyIndex++}`}>
          {trueFalseMatch[0]}
        </span>
      );
      
      // Add boxed check and X icons
      elements.push(
        <CheckSquare
          key={`check-icon-${keyIndex++}`}
          className={cn(
            "inline w-4 h-4 mx-0.5 align-text-bottom",
            hasGradient 
              ? `plan-text-${courseId}`
              : "text-green-600 dark:text-green-400"
          )}
        />
      );
      
      elements.push(
        <XSquare
          key={`x-icon-${keyIndex++}`}
          className={cn(
            "inline w-4 h-4 ml-0.5 mr-1 align-text-bottom",
            hasGradient 
              ? `plan-text-${courseId}`
              : "text-red-600 dark:text-red-400"
          )}
        />
      );
      
      trueFalseLastIndex = actualEnd;
    }
    
    // Update lastIndex to include true/false processing
    if (trueFalseLastIndex > lastIndex) {
      lastIndex = trueFalseLastIndex;
    }
    
    // Pattern for YouTube
    const youtubeRegex = /(Youtube|YouTube)/gi;
    let youtubeMatch;
    let youtubeLastIndex = lastIndex;
    
    while ((youtubeMatch = youtubeRegex.exec(line.substring(lastIndex))) !== null) {
      const actualIndex = lastIndex + youtubeMatch.index;
      const actualEnd = actualIndex + youtubeMatch[0].length;
      
      // Add text before youtube match
      if (actualIndex > youtubeLastIndex) {
        elements.push(
          <span key={`youtube-text-before-${keyIndex++}`}>
            {line.substring(youtubeLastIndex, actualIndex)}
          </span>
        );
      }
      
      // Add the matched text
      elements.push(
        <span key={`youtube-text-${keyIndex++}`}>
          {youtubeMatch[0]}
        </span>
      );
      
      // Add YouTube icon
      elements.push(
        <Youtube
          key={`youtube-icon-${keyIndex++}`}
          className={cn(
            "inline w-4 h-4 mx-1 align-text-bottom",
            hasGradient 
              ? `plan-text-${courseId}`
              : "text-red-600 dark:text-red-400"
          )}
        />
      );
      
      youtubeLastIndex = actualEnd;
    }
    
    // Update lastIndex to include youtube processing
    if (youtubeLastIndex > lastIndex) {
      lastIndex = youtubeLastIndex;
    }
    
    // Pattern for Quiz with word boundaries
    const quizRegex = /\b(Quiz|Quizzes)\b/gi;
    let quizMatch;
    let quizLastIndex = lastIndex;
    
    while ((quizMatch = quizRegex.exec(line.substring(lastIndex))) !== null) {
      const actualIndex = lastIndex + quizMatch.index;
      const actualEnd = actualIndex + quizMatch[0].length;
      
      // Add text before quiz match
      if (actualIndex > quizLastIndex) {
        elements.push(
          <span key={`quiz-text-before-${keyIndex++}`}>
            {line.substring(quizLastIndex, actualIndex)}
          </span>
        );
      }
      
      // Add the matched text
      elements.push(
        <span key={`quiz-text-${keyIndex++}`}>
          {quizMatch[0]}
        </span>
      );
      
      // Add quiz icon (grid for quizzes/forms)
      elements.push(
        <Grid3X3
          key={`quiz-icon-${keyIndex++}`}
          className={cn(
            "inline w-4 h-4 mx-1 align-text-bottom",
            hasGradient 
              ? `plan-text-${courseId}`
              : "text-purple-600 dark:text-purple-400"
          )}
        />
      );
      
      quizLastIndex = actualEnd;
    }
    
    // Update lastIndex to include quiz processing
    if (quizLastIndex > lastIndex) {
      lastIndex = quizLastIndex;
    }
    
    // Reset for time pattern
    videoExpertRegex.lastIndex = 0;
    
    // Pattern 2: Add clock icon before time duration
    const timeRegex = /(\d+'\d+)/g;
    let timeMatch;
    let processedLine = lastIndex > 0 ? line.substring(lastIndex) : line;
    let timeElements: React.ReactElement[] = [];
    let timeLastIndex = 0;
    let timeKeyIndex = 0;
    
    while ((timeMatch = timeRegex.exec(processedLine)) !== null) {
      // Add text before match
      if (timeMatch.index > timeLastIndex) {
        timeElements.push(
          <span key={`time-text-${timeKeyIndex++}`}>
            {processedLine.substring(timeLastIndex, timeMatch.index)}
          </span>
        );
      }
      
      // Add clock icon
      timeElements.push(
        <Clock
          key={`clock-icon-${timeKeyIndex++}`}
          className={cn(
            "inline w-4 h-4 mr-1 align-text-bottom",
            hasGradient 
              ? `plan-text-${courseId}`
              : "text-blue-600 dark:text-blue-400"
          )}
        />
      );
      
      // Add the time text
      timeElements.push(
        <span key={`time-duration-${timeKeyIndex++}`}>
          {timeMatch[0]}
        </span>
      );
      
      timeLastIndex = timeMatch.index + timeMatch[0].length;
    }
    
    // Add remaining text after time matches
    if (timeLastIndex < processedLine.length) {
      timeElements.push(
        <span key={`remaining-time-text-${timeKeyIndex++}`}>
          {processedLine.substring(timeLastIndex)}
        </span>
      );
    }
    
    // Combine all elements
    if (lastIndex > 0) {
      // Had video matches, add time processing to remaining text
      elements.push(...timeElements);
    } else if (timeElements.length > 0) {
      // Only had time matches
      return <>{timeElements}</>;
    } else {
      // No matches, return plain text
      return <span>{line}</span>;
    }
    
    return elements.length > 0 ? <>{elements}</> : <span>{line}</span>;
  };

  const sections = parsePlanSections(plan_md);
  
  // Extract the first line of plan_md for the subtitle (before any ### headers)
  const getFirstLine = (content: string): string => {
    // Split by H3 headers to get the intro part
    const h3Regex = /^### (.+)$/gm;
    const parts = content.split(h3Regex);
    
    // The first part is the intro text before any H3 headers
    const introText = parts[0] || '';
    
    // Clean and extract first meaningful line from intro
    const cleanText = introText
      .replace(/<[^>]*>/g, ' ')
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
      .replace(/\s+/g, ' ')
      .trim();
    
    const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line);
    return lines.length > 0 ? lines[0] : '';
  };
  
  const firstLineSubtitle = getFirstLine(plan_md);

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
        if (entry?.isIntersecting) {
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
          if (entry?.isIntersecting) {
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
            @keyframes icon-float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              25% { transform: translateY(-2px) rotate(1deg); }
              75% { transform: translateY(2px) rotate(-1deg); }
            }
            @keyframes content-reveal {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
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
      
      {/* Main title */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {locale === 'fr' ? 'Programme de la formation' : 'Course Curriculum'}
      </h2>
      
      {/* Subtitle with first line of plan_md */}
      {firstLineSubtitle && (
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
          {firstLineSubtitle}
        </p>
      )}
      
      <div className="space-y-8 sm:space-y-10">
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
                "group relative transition-all duration-700 transform cursor-default",
                isAnimated 
                  ? "opacity-100 translate-y-0 scale-100" 
                  : "opacity-0 translate-y-8 scale-95"
              )}
              role="article"
              aria-label={getSectionDescription(section.title)}
              style={{
                transitionDelay: isAnimated ? `${delay}ms` : '0ms',
                animationDelay: isAnimated ? `${delay}ms` : '0ms',
              }}
            >
              {/* Large Circle with Number - positioned outside/overlapping top-left corner */}
              <div className={cn(
                "absolute -top-6 -left-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold shadow-lg z-30 transition-all duration-500",
                hasGradient 
                  ? `plan-text-${courseId} bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm`
                  : "bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 backdrop-blur-sm",
                isAnimated ? "animate-[content-reveal_0.5s_ease-out]" : ""
              )}
              style={{
                animationDelay: isAnimated ? `${delay + 100}ms` : '0ms',
              }}>
                {isNumbered ? sectionNumber : '⟡'}
              </div>
              
              {/* Content Area */}
              <div className={cn(
                "rounded-xl p-6 sm:p-8 pl-10 sm:pl-12 pt-10 sm:pt-12 transition-all duration-700 transform cursor-default overflow-visible relative",
                hasGradient 
                  ? `plan-gradient-${courseId} shadow-lg hover:shadow-xl`
                  : `plan-section-${courseId} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800`,
                "hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]",
                "backdrop-blur-sm"
              )}>
                
                {/* Horizontal Line extending from circle */}
                <div className={cn(
                  "absolute -top-3 left-6 sm:left-8 right-6 h-0.5 transition-all duration-500",
                  hasGradient 
                    ? "bg-white/30 dark:bg-gray-600/30"
                    : "bg-gray-300 dark:bg-gray-600",
                  isAnimated ? "animate-[content-reveal_0.6s_ease-out]" : ""
                )}
                style={{
                  animationDelay: isAnimated ? `${delay + 200}ms` : '0ms',
                }} />
                
                {/* Section Title with Icon */}
                <h3 className={cn(
                  "flex items-center gap-3 text-base sm:text-lg font-bold mb-2 sm:mb-3 uppercase tracking-wide transition-all duration-500",
                  hasGradient 
                    ? `plan-text-${courseId}`
                    : "text-blue-900 dark:text-blue-100",
                  isAnimated ? "animate-[content-reveal_0.6s_ease-out]" : ""
                )}
                style={{
                  animationDelay: isAnimated ? `${delay + 300}ms` : '0ms',
                }}>
                  <span>{section.title}</span>
                  <IconComponent 
                    size={24} 
                    className={cn(
                      "transition-transform duration-300 opacity-60",
                      hasGradient 
                        ? `plan-text-${courseId}`
                        : "text-blue-600 dark:text-blue-400"
                    )}
                    aria-label={`${locale === 'fr' ? 'Icône de section' : 'Section icon'}: ${getSectionDescription(section.title)}`}
                  />
                </h3>
                
                {/* Section Content */}
                <div className={cn(
                  "text-base leading-relaxed transition-all duration-500",
                  hasGradient 
                    ? `plan-text-${courseId} opacity-90`
                    : "text-gray-700 dark:text-gray-300",
                  isAnimated ? "animate-[content-reveal_0.6s_ease-out]" : ""
                )}
                style={{
                  animationDelay: isAnimated ? `${delay + 400}ms` : '0ms',
                }}>
                  {formatSectionContent(section.content, !!hasGradient, courseId)}
                </div>
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