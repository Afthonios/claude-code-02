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
        rounded-full transition-colors duration-200 
        ${isBookmarked 
          ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20' 
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isBookmarked ? t('bookmark.remove', 'Remove from bookmarks') : t('bookmark.add', 'Add to bookmarks')}
      aria-label={isBookmarked ? t('bookmark.remove', 'Remove from bookmarks') : t('bookmark.add', 'Add to bookmarks')}
    >
      {isBookmarked ? (
        <svg
          className={`${sizeClasses[size]} fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      ) : (
        <svg
          className={`${sizeClasses[size]} stroke-current`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}