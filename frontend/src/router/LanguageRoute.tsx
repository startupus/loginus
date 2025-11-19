import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/store';

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
      i18n.changeLanguage(urlLang);
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
      i18n.changeLanguage(language);
    }
  }, [lang, language, setLanguage, i18n, navigate, location.pathname]);

  return <>{children}</>;
};

