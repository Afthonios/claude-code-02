'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getCoursesListUrl } from '@/lib/directus';
import type { Locale } from '@/i18n';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('courses');
  const inputRef = useRef<HTMLInputElement>(null);
  const currentLocale = params.locale as Locale;

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Focus input after animation starts
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setIsAnimating(false);
      setSearchValue(''); // Clear search when closing
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      const coursesUrl = getCoursesListUrl(currentLocale);
      router.push(`${coursesUrl}?search=${encodeURIComponent(searchValue.trim())}`);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center px-4
        bg-black/60 backdrop-blur-sm
        transition-all duration-300 ease-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-title"
    >
      <div
        className={`
          w-full max-w-2xl mx-auto
          transform transition-all duration-300 ease-out
          ${isOpen 
            ? 'scale-100 translate-y-0 opacity-100' 
            : 'scale-95 translate-y-4 opacity-0'
          }
        `}
      >
        {/* Search Box */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center">
              {/* Search Icon */}
              <div className="pl-6 pr-3 py-5">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Search Input */}
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="
                  flex-1 py-5 pr-4 text-lg
                  bg-transparent border-0 outline-none
                  text-gray-900 dark:text-gray-100
                  placeholder:text-gray-500 dark:placeholder:text-gray-400
                  focus:ring-0 focus:outline-none
                "
                id="search-input"
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="
                  mr-4 p-2 rounded-lg
                  text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors duration-150
                "
                aria-label="Close search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}