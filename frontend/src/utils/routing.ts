import { useParams } from 'react-router-dom';
import { useLanguageStore } from '@/store';

/**
 * Хук для получения текущего языка из URL
 */
export const useCurrentLanguage = (): 'ru' | 'en' => {
  const { lang } = useParams<{ lang: string }>();
  const { language } = useLanguageStore();
  
  // Приоритет: язык из URL > язык из store > 'ru' по умолчанию
  const validLanguages = ['ru', 'en'];
  if (lang && validLanguages.includes(lang.toLowerCase())) {
    return lang.toLowerCase() as 'ru' | 'en';
  }
  
  return language || 'ru';
};

/**
 * Утилита для построения пути с языком
 */
export const buildPathWithLang = (path: string, lang?: string): string => {
  const currentLang = lang || 'ru';
  
  // Убираем ведущий слэш
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Убираем язык из начала пути, если есть (например, '/ru/auth' -> 'auth')
  if (cleanPath.match(/^(ru|en)\//)) {
    cleanPath = cleanPath.replace(/^(ru|en)\//, '');
  }
  
  // Если путь пустой, возвращаем только язык
  if (!cleanPath) {
    return `/${currentLang}`;
  }
  
  return `/${currentLang}/${cleanPath}`;
};

/**
 * Утилита для получения пути без языка
 */
export const getPathWithoutLang = (path: string): string => {
  return path.replace(/^\/[^/]+/, '') || '/';
};

