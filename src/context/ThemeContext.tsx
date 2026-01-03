import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Theme, FontSize } from '@sudobility/types';

// Simple storage using localStorage directly to avoid importing @sudobility/components (648KB) on critical path
const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors (e.g., private browsing mode)
    }
  },
};

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = storage.getItem('shapeshyft-theme');
    return (saved as Theme) || Theme.LIGHT;
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = storage.getItem('shapeshyft-font-size');
    return (saved as FontSize) || FontSize.MEDIUM;
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storage.setItem('shapeshyft-theme', newTheme);
  };

  const setFontSize = (newFontSize: FontSize) => {
    setFontSizeState(newFontSize);
    storage.setItem('shapeshyft-font-size', newFontSize);
  };

  useEffect(() => {
    // Apply theme classes to document
    const root = document.documentElement;

    // Determine the actual theme to apply
    let actualTheme = theme;

    if (theme === Theme.SYSTEM) {
      // Detect system theme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = prefersDark ? Theme.DARK : Theme.LIGHT;
    }

    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);

    // Apply font size class
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);
  }, [theme, fontSize]);

  useEffect(() => {
    // Listen for system theme changes when using system theme
    if (theme === Theme.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement;
        const actualTheme = e.matches ? Theme.DARK : Theme.LIGHT;
        root.classList.remove('light', 'dark');
        root.classList.add(actualTheme);
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    fontSize,
    setTheme,
    setFontSize,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
