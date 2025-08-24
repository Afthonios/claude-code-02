/**
 * French Typography Utilities
 * 
 * Handles proper French typography by preventing line breaks before punctuation marks.
 * In French, colons (:), question marks (?), exclamation marks (!), and semicolons (;)
 * should have a non-breaking space before them to prevent orphaning.
 */

/**
 * Converts regular spaces before French punctuation to non-breaking spaces
 * @param text - The text to process
 * @returns Text with non-breaking spaces before French punctuation
 */
export function fixFrenchPunctuation(text: string): string {
  if (!text) return text;
  
  // Replace regular space + punctuation with non-breaking space + punctuation
  return text
    // Colon
    .replace(/\s+:/g, '\u00A0:')
    // Question mark
    .replace(/\s+\?/g, '\u00A0?')
    // Exclamation mark
    .replace(/\s+!/g, '\u00A0!')
    // Semicolon
    .replace(/\s+;/g, '\u00A0;')
    // Handle multiple spaces before punctuation
    .replace(/\u00A0+:/g, '\u00A0:')
    .replace(/\u00A0+\?/g, '\u00A0?')
    .replace(/\u00A0+!/g, '\u00A0!')
    .replace(/\u00A0+;/g, '\u00A0;');
}

/**
 * Applies French typography rules to all text content in a DOM element
 * @param element - The DOM element to process (defaults to document.body)
 */
export function applyFrenchTypography(element: Element = document.body): void {
  // Get all text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script, style, and other non-content elements
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        const tagName = parent.tagName.toLowerCase();
        if (['script', 'style', 'code', 'pre'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Only process nodes that contain French punctuation patterns
        const text = node.textContent || '';
        if (/\s+[?!:;]/.test(text)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        
        return NodeFilter.FILTER_REJECT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node;
  
  // Collect all text nodes first to avoid modifying DOM during traversal
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }

  // Process each text node
  textNodes.forEach((textNode) => {
    const originalText = textNode.textContent || '';
    const fixedText = fixFrenchPunctuation(originalText);
    
    if (originalText !== fixedText) {
      textNode.textContent = fixedText;
    }
  });
}

/**
 * React hook to apply French typography to text content
 * @param text - The text to process
 * @returns Text with proper French typography
 */
export function useFrenchTypography(text: string): string {
  return fixFrenchPunctuation(text);
}

/**
 * Initialize French typography for the entire page
 * Call this after page load or when content changes
 */
export function initializeFrenchTypography(): void {
  // Apply to existing content
  applyFrenchTypography();
  
  // Set up observer for dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          applyFrenchTypography(node as Element);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Clean up observer when page unloads
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      observer.disconnect();
    });
  }
}