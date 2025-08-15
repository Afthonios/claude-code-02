"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

/**
 * ThemeToggle component that cycles through light, dark, and system themes
 * Uses Lucide React icons for visual representation
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder button to prevent hydration mismatch
    return (
      <button
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        disabled
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only">Loading theme</span>
      </button>
    );
  }

  const { resolvedTheme } = useTheme();
  
  const toggleTheme = () => {
    // Simple toggle: light <-> dark
    // When toggling, we override system preference
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const getIcon = () => {
    // Show sun when it's currently dark (clicking will make it light)
    // Show moon when it's currently light (clicking will make it dark)
    return resolvedTheme === "dark" ? 
      <Sun className="h-4 w-4" /> : 
      <Moon className="h-4 w-4" />;
  };

  const getLabel = () => {
    return resolvedTheme === "dark" ? 
      "Switch to light mode" : 
      "Switch to dark mode";
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </button>
  );
}