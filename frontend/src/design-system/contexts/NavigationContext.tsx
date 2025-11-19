import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';

interface NavigationContextType {
  navigate: (path: string) => void;
  currentPath: string;
  currentLang: 'ru' | 'en';
  buildPath: (path: string) => string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigateRouter = useNavigate();
  const location = useLocation();
  const currentLang = useCurrentLanguage();

  const navigate = (path: string) => {
    const fullPath = buildPathWithLang(path, currentLang);
    navigateRouter(fullPath);
  };

  const buildPath = (path: string) => buildPathWithLang(path, currentLang);

  return (
    <NavigationContext.Provider 
      value={{ 
        navigate, 
        currentPath: location.pathname,
        currentLang,
        buildPath,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};


