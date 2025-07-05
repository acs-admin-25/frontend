'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { ThemeProvider as MuiThemeProvider, CssBaseline, PaletteMode } from '@mui/material';
import { getTheme } from '@/app/theme/theme';
import { SimpleThemeProvider } from '@/lib/theme/simple-theme-provider';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function MuiAndTailwindThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const mode = useMemo(() => nextTheme === 'dark' ? 'dark' : 'light', [nextTheme]);

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const muiTheme = useMemo(() => getTheme(mode), [mode]);

  if (!mounted) {
    // to avoid layout shift, render nothing on the server
    return null; 
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <SimpleThemeProvider>
        <MuiAndTailwindThemeProvider>
          {children}
        </MuiAndTailwindThemeProvider>
      </SimpleThemeProvider>
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 