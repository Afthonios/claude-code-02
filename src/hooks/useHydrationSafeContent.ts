import React, { useEffect, useState } from 'react';

/**
 * Hook to ensure content processing happens only after hydration
 * This prevents hydration mismatches by returning simple fallback content on server-side
 * and processing complex content only after client-side mounting
 */
export function useHydrationSafeContent<T>(
  processor: () => T,
  fallback: T,
  dependencies: React.DependencyList = []
): { content: T; isHydrated: boolean } {
  const [isHydrated, setIsHydrated] = useState(false);
  const [content, setContent] = useState<T>(fallback);

  useEffect(() => {
    // Mark as hydrated and process content on client-side only
    setIsHydrated(true);
    try {
      setContent(processor());
    } catch (error) {
      console.warn('Error processing content:', error);
      setContent(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    content: isHydrated ? content : fallback,
    isHydrated,
  };
}

/**
 * Specialized hook for text content that might contain complex patterns
 * Returns plain text on server-side and processed content on client-side
 */
export function useHydrationSafeTextContent(
  text: string,
  processor: (text: string) => React.ReactNode,
  dependencies: React.DependencyList = []
): { content: React.ReactNode; isHydrated: boolean } {
  const [isHydrated, setIsHydrated] = useState(false);
  const [processedContent, setProcessedContent] = useState<React.ReactNode>(text);

  useEffect(() => {
    setIsHydrated(true);
    try {
      setProcessedContent(processor(text));
    } catch (error) {
      console.warn('Error processing text content:', error);
      setProcessedContent(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, ...dependencies]);

  return {
    content: isHydrated ? processedContent : text,
    isHydrated,
  };
}

/**
 * Hook for safely generating keys that need to be consistent between server and client
 */
export function useHydrationSafeKey(
  baseKey: string,
  generateKey: (base: string) => string,
  dependencies: React.DependencyList = []
): string {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // We don't actually use the generated key to avoid hydration issues
    // This hook exists for future extensibility
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey, ...dependencies]);

  // Always use base key to ensure consistency
  return baseKey;
}

/**
 * Creates a stable hash from a string for consistent key generation
 * This is used for creating deterministic keys that work across server/client
 */
export function createStableHash(input: string, maxLength: number = 10): string {
  // Simple hash function that produces consistent results
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and create string representation
  const positiveHash = Math.abs(hash).toString(36);
  return positiveHash.substring(0, maxLength);
}

/**
 * Hook for processing markdown-like content safely
 * Returns plain text on server, processed JSX on client
 */
export function useHydrationSafeMarkdown(
  markdown: string,
  processor: (md: string) => React.ReactNode
): { content: React.ReactNode; isProcessed: boolean } {
  const [isProcessed, setIsProcessed] = useState(false);
  const [processedContent, setProcessedContent] = useState<React.ReactNode>(markdown);

  useEffect(() => {
    // Only process on client-side after mount
    try {
      const processed = processor(markdown);
      setProcessedContent(processed);
      setIsProcessed(true);
    } catch (error) {
      console.warn('Error processing markdown content:', error);
      // Fallback to plain text if processing fails
      setProcessedContent(markdown);
      setIsProcessed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown]);

  return {
    content: isProcessed ? processedContent : markdown,
    isProcessed,
  };
}