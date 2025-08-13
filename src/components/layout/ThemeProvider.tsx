"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
};

/**
 * ThemeProvider component that wraps the application with next-themes functionality
 * Supports system, light, and dark themes with persistence
 */
export default function ThemeProvider({ 
  children, 
  defaultTheme = "system",
  storageKey = "afthonios-theme"
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      storageKey={storageKey}
      themes={["light", "dark", "system"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}