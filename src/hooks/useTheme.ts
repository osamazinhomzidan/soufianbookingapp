'use client';

import { useContext } from 'react';
import { ThemeContext, type Theme } from '@/contexts/ThemeContext';

// Theme context interface (re-exported for convenience)
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

/**
 * Custom hook to access theme context
 * 
 * @returns ThemeContextType - Theme state and methods
 * @throws Error if used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * const { theme, toggleTheme, isDark } = useTheme();
 * 
 * return (
 *   <button 
 *     onClick={toggleTheme}
 *     className={`p-2 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
 *   >
 *     {isDark ? '☀️' : '🌙'} Toggle Theme
 *   </button>
 * );
 * ```
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Make sure to wrap your component tree with <ThemeProvider>.'
    );
  }
  
  return context;
}

// Re-export Theme type for convenience
export type { Theme } from '@/contexts/ThemeContext';