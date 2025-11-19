import React, { createContext, useContext, ReactNode } from 'react';
import { useLanguageStore } from '@/store';

interface LanguageContextType {
  language: 'ru' | 'en';
  setLanguage: (lang: 'ru' | 'en') => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { language, setLanguage } = useLanguageStore();
  
  const t = (key: string, fallback?: string) => {
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};


