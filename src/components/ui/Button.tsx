import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent disabled:pointer-events-none disabled:opacity-50 h-9 px-3",
          // Variant styles
          {
            // Primary variant
            "bg-primary text-white hover:bg-primary-dark": variant === 'primary',
            // Secondary variant
            "text-secondary border border-secondary/30 hover:border-secondary dark:text-accent dark:border-accent/30 dark:hover:border-accent": variant === 'secondary',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };