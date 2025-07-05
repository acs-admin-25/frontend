/**
 * Simplified Theme Provider
 * Uses the simple theme system for easy theme switching
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SimpleTheme, greenTheme, blueTheme, applyTheme } from './simple-theme';

interface ThemeContextType {
  currentTheme: SimpleTheme;
  setTheme: (theme: SimpleTheme) => void;
  switchToGreen: () => void;
  switchToBlue: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function SimpleThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<SimpleTheme>(greenTheme);
  const [mounted, setMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to document when it changes, but only after mounting
  useEffect(() => {
    if (mounted) {
      applyTheme(currentTheme);
    }
  }, [currentTheme, mounted]);

  const setTheme = (theme: SimpleTheme) => {
    setCurrentTheme(theme);
  };

  const switchToGreen = () => setTheme(greenTheme);
  const switchToBlue = () => setTheme(blueTheme);

  // During SSR or before mounting, render children without theme application
  // This prevents hydration mismatch
  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      switchToGreen,
      switchToBlue,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSimpleTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSimpleTheme must be used within SimpleThemeProvider');
  }
  return context;
} 