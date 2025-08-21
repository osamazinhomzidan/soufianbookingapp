'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations, Translations } from '@/lib/translations';

// Type for nested object keys (for dot notation support)
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// Translation key type
type TranslationKey = NestedKeyOf<Translations>;

// Helper function to get nested object value by dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Custom hook for translations
export function useTranslation() {
  const { language } = useLanguage();
  
  // Get translation function
  const t = (key: TranslationKey): string => {
    const translationObj = translations[language];
    return getNestedValue(translationObj, key);
  };
  
  // Get translation with fallback
  const tWithFallback = (key: TranslationKey, fallback?: string): string => {
    const translationObj = translations[language];
    const translation = getNestedValue(translationObj, key);
    
    // If translation is the same as key (not found), return fallback or key
    if (translation === key) {
      return fallback || key;
    }
    
    return translation;
  };
  
  // Get translation with interpolation support
  const tInterpolate = (key: TranslationKey, values: Record<string, string | number> = {}): string => {
    let translation = t(key);
    
    // Replace placeholders like {{name}} with actual values
    Object.entries(values).forEach(([placeholder, value]) => {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      translation = translation.replace(regex, String(value));
    });
    
    return translation;
  };
  
  // Get current language
  const currentLanguage = language;
  
  // Check if current language is RTL
  const isRTL = language === 'ar';
  
  // Get direction class for styling
  const directionClass = isRTL ? 'rtl' : 'ltr';
  
  // Get text alignment class
  const textAlignClass = isRTL ? 'text-right' : 'text-left';
  
  // Get margin/padding classes for RTL support
  const marginLeftClass = isRTL ? 'mr' : 'ml';
  const marginRightClass = isRTL ? 'ml' : 'mr';
  const paddingLeftClass = isRTL ? 'pr' : 'pl';
  const paddingRightClass = isRTL ? 'pl' : 'pr';
  
  // Get border radius classes for RTL support
  const roundedLeftClass = isRTL ? 'rounded-r' : 'rounded-l';
  const roundedRightClass = isRTL ? 'rounded-l' : 'rounded-r';
  
  return {
    t,
    tWithFallback,
    tInterpolate,
    currentLanguage,
    isRTL,
    directionClass,
    textAlignClass,
    marginLeftClass,
    marginRightClass,
    paddingLeftClass,
    paddingRightClass,
    roundedLeftClass,
    roundedRightClass,
  };
}

// Export default
export default useTranslation;