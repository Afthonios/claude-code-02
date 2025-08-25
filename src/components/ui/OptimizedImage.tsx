'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  blurDataURL?: string | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  quality?: number;
}

export default function OptimizedImage({
  src,
  blurDataURL,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className,
  fallbackSrc = '/images/course-placeholder.svg',
  onLoad,
  onError,
  quality = 75,
}: OptimizedImageProps) {
  // If no src provided, use fallback immediately
  const initialSrc = src && src.trim() !== '' ? src : fallbackSrc;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('OptimizedImage props:', { src, currentSrc, isLoading, hasError });
  }

  // Use useEffect to handle loading state more reliably
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(initialSrc);
  }, [initialSrc]);

  const handleLoad = () => {
    console.log('Image loaded:', currentSrc);
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    console.log('Image error:', currentSrc);
    if (!hasError && currentSrc !== fallbackSrc) {
      console.log('Falling back to:', fallbackSrc);
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      // Don't set isLoading to false yet, let the fallback image load
    } else {
      setIsLoading(false);
      onError?.();
    }
  };

  // Build props conditionally to ensure required props are always present
  const baseImageProps = {
    src: currentSrc,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    quality,
    className: cn(
      'transition-opacity duration-300',
      isLoading && !hasError ? 'opacity-0' : 'opacity-100',
      className
    ),
    ...(blurDataURL && !hasError && {
      placeholder: 'blur' as const,
      blurDataURL
    }),
    ...(priority && { priority: true }),
    ...(fill && { 
      fill: true,
      ...(sizes && { sizes })
    }),
    ...(!fill && width && height && {
      width,
      height
    })
  };

  return (
    <div className="relative">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image {...baseImageProps} />
      
      {/* Loading skeleton overlay */}
      {isLoading && !hasError && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse",
            "flex items-center justify-center"
          )}
        >
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
        </div>
      )}
    </div>
  );
}