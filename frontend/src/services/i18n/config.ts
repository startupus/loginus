import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import en from './locales/en.json';

// Получаем сохраненный язык из localStorage (через zustand persist)
const getStoredLanguage = (): string => {
  try {
    const stored = localStorage.getItem('loginus-language');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.language || 'ru';
    }
  } catch (e) {
    // Игнорируем ошибки парсинга
  }
  return 'ru';
};

const initialLanguage = getStoredLanguage();

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

