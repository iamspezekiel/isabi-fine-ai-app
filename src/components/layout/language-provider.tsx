
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations } from '@/lib/translations';

export type Language = 'en' | 'yo' | 'ha' | 'ig' | 'pcm' | 'efik';
export type TranslationKeys = keyof (typeof translations)['en'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('appLanguage') as Language | null;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key: TranslationKeys): string => {
    const langTyped = language as keyof typeof translations;
    const translationSet = translations[langTyped] || translations.en;
    // Fallback to English if a key is missing in the selected language
    return (translationSet as any)[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
