"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFoundPage() {
  const t = useTranslations('common');
  const tNav = useTranslations('navigation');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-600">
            404
          </h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page non trouvée
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {t('home')}
          </Link>
          
          <Link
            href="/courses"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700"
          >
            {tNav('courses')}
          </Link>
        </div>
        
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            ← {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}