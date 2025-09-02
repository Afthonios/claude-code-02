"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import FrenchTypographyProvider from "../components/layout/FrenchTypographyProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <FrenchTypographyProvider />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}