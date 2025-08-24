"use client";

import { useEffect } from 'react';
import { initializeFrenchTypography } from '../../utils/french-typography';

/**
 * Provider component that applies French typography rules to the entire application.
 * This prevents line breaks before French punctuation marks (:, ?, !, ;).
 */
export default function FrenchTypographyProvider() {
  useEffect(() => {
    // Apply French typography rules after component mounts
    initializeFrenchTypography();
  }, []);

  // This component doesn't render anything - it's just for side effects
  return null;
}