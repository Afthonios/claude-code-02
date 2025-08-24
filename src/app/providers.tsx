"use client";

import { ThemeProvider } from "next-themes";
import FrenchTypographyProvider from "../components/layout/FrenchTypographyProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FrenchTypographyProvider />
      {children}
    </ThemeProvider>
  );
}