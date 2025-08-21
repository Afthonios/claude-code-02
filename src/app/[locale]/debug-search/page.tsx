'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { getCoursesListUrl } from '@/lib/directus';
import type { Locale } from '@/i18n';

export default function DebugSearchPage() {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as Locale;

  const log = (message: string) => {
    console.log('DEBUG:', message);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSearchTest = () => {
    log('Starting search test...');
    try {
      const searchQuery = searchValue.trim();
      log(`Search query: "${searchQuery}"`);
      
      if (searchQuery) {
        const coursesUrl = getCoursesListUrl(currentLocale);
        log(`Courses URL: ${coursesUrl}`);
        
        const fullUrl = `${coursesUrl}?search=${encodeURIComponent(searchQuery)}`;
        log(`Full URL: ${fullUrl}`);
        
        log('Attempting navigation...');
        router.push(fullUrl);
        log('Navigation completed');
      } else {
        log('Empty search query - not navigating');
      }
    } catch (error) {
      log(`Error: ${error}`);
      console.error('Search error:', error);
    }
  };

  const testOverlay = () => {
    log('Testing overlay toggle...');
    setIsSearchOpen(!isSearchOpen);
    log(`Overlay is now: ${!isSearchOpen ? 'open' : 'closed'}`);
  };

  const TestOverlay = ({ isOpen }: { isOpen: boolean }) => {
    log(`Rendering overlay with isOpen: ${isOpen}`);
    
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Test Search Overlay</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Type search query..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchTest();
                }
              }}
            />
            <button
              onClick={handleSearchTest}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Search
            </button>
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 w-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Search Debug Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Controls */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Locale: <strong>{currentLocale}</strong>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Search Query</label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter search query..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSearchTest}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Test Search Navigation
              </button>
              
              <button
                onClick={testOverlay}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                {isSearchOpen ? 'Close' : 'Open'} Test Overlay
              </button>
            </div>
            
            <div>
              <button
                onClick={() => {
                  setDebugLog([]);
                  log('Debug log cleared');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear Log
              </button>
            </div>
          </div>
        </div>

        {/* Debug Log */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Debug Log</h2>
          <div className="space-y-1 text-sm font-mono max-h-96 overflow-y-auto">
            {debugLog.length === 0 ? (
              <p className="text-gray-500">No debug messages yet...</p>
            ) : (
              debugLog.map((message, index) => (
                <div key={index} className="text-gray-700 dark:text-gray-300">
                  {message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Test URLs */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Test URLs</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
          <p><strong>Locale:</strong> {currentLocale}</p>
          <p><strong>Expected Courses URL:</strong> {getCoursesListUrl(currentLocale)}</p>
          {searchValue && (
            <p><strong>Search URL:</strong> {getCoursesListUrl(currentLocale)}?search={encodeURIComponent(searchValue)}</p>
          )}
        </div>
      </div>

      <TestOverlay isOpen={isSearchOpen} />
    </div>
  );
}