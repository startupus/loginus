import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/store';
import { changeLanguage } from '@/services/i18n/config';

interface LanguageRouteProps {
  children: React.ReactNode;
}

/**
 * LanguageRoute - компонент для синхронизации языка из URL с i18n и languageStore
 * Обрабатывает параметр :lang в пути и синхронизирует его с системой локализации
 */
export const LanguageRoute: React.FC<LanguageRouteProps> = ({ children }) => {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    // Валидация языка из URL
    const validLanguages = ['ru', 'en'];
    const urlLang = lang?.toLowerCase();

    // Если язык в URL валидный и отличается от текущего
    if (urlLang && validLanguages.includes(urlLang) && urlLang !== language) {
      setLanguage(urlLang as 'ru' | 'en');
      changeLanguage(urlLang).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to change language:', error);
        }
      });
    }
    // Если язык в URL невалидный или отсутствует
    else if (!urlLang || !validLanguages.includes(urlLang)) {
      // Редиректим на текущий язык из store или 'ru' по умолчанию
      const currentLang = language || 'ru';
      const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '') || '/';
      const newPath = `/${currentLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
      
      // Избегаем бесконечного редиректа
      if (location.pathname !== newPath) {
        navigate(newPath, { replace: true });
      }
    }
    // Синхронизируем i18n с текущим языком из store (на случай, если они разошлись)
    else if (i18n.language !== language) {
      changeLanguage(language).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to change language:', error);
        }
      });
    }
  }, [lang, language, setLanguage, i18n, navigate, location.pathname]);

  return <>{children}</>;
};

