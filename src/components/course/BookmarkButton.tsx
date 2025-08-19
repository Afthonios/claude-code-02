'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface BookmarkButtonProps {
  courseId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BookmarkButton({ courseId, size = 'md', className = '' }: BookmarkButtonProps) {
  const t = useTranslations('courses');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const paddingClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  // Load bookmark status from localStorage
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(courseId));
  }, [courseId]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking bookmark
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
      let newBookmarks;
      
      if (isBookmarked) {
        newBookmarks = bookmarks.filter((id: string) => id !== courseId);
      } else {
        newBookmarks = [...bookmarks, courseId];
      }
      
      localStorage.setItem('courseBookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(!isBookmarked);
      
      // TODO: In a real app, you would also sync this with the server
      // await api.toggleBookmark(courseId);
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`
        ${paddingClasses[size]} 
        transition-colors duration-200 
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        color: isBookmarked 
          ? 'hsl(var(--primary))' 
          : 'hsl(var(--primary))',
      }}
      title={isBookmarked ? t('bookmark.remove') : t('bookmark.add')}
      aria-label={isBookmarked ? t('bookmark.remove') : t('bookmark.add')}
    >
      {isBookmarked ? (
        <svg
          className={`${sizeClasses[size]}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ) : (
        <svg
          className={`${sizeClasses[size]}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      )}
    </button>
  );
}