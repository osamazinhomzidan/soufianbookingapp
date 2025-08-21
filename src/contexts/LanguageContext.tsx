'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Language type definition
export type Language = 'en' | 'ar';

// Language context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  toggleLanguage: () => void;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider props interface
interface LanguageProviderProps {
  children: ReactNode;
}

// Language Provider component
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate RTL based on language
  const isRTL = language === 'ar';

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    }
    setIsInitialized(true);
  }, []);

  // Update document direction and localStorage when language changes
  useEffect(() => {
    if (isInitialized) {
      // Update document direction
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      
      // Save to localStorage
      localStorage.setItem('preferred-language', language);
      
      // Update body class for additional styling if needed
      document.body.classList.toggle('rtl', isRTL);
      document.body.classList.toggle('ltr', !isRTL);
    }
  }, [language, isRTL, isInitialized]);

  // Set language function with validation
  const setLanguage = (lang: Language) => {
    if (lang === 'en' || lang === 'ar') {
      setLanguageState(lang);
    }
  };

  // Toggle between languages
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isRTL,
    toggleLanguage,
  };

  // Don't render until initialized to prevent hydration issues
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export context for advanced usage
export { LanguageContext };