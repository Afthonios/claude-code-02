import { ReactNode, CSSProperties } from 'react';
import { fixFrenchPunctuation } from '../../utils/french-typography';

interface FrenchTextProps {
  children: string | ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Component that applies French typography rules to text content.
 * Automatically converts regular spaces before punctuation marks to non-breaking spaces.
 * 
 * @param children - The text content to format
 * @param className - Additional CSS classes
 * @param style - Inline styles
 * @param as - HTML element to render (default: span)
 */
export default function FrenchText({ 
  children, 
  className = '', 
  style,
  as: Element = 'span' 
}: FrenchTextProps) {
  // If children is a string, apply French typography rules
  const processedContent = typeof children === 'string' 
    ? fixFrenchPunctuation(children)
    : children;

  return (
    <Element className={`french-text ${className}`.trim()} style={style}>
      {processedContent}
    </Element>
  );
}