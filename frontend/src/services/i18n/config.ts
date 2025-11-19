import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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

// Кэш загруженных модулей для избежания повторных загрузок
const loadedModules = new Map<string, Set<string>>();

// Доступные модули локализации
const availableModules = ['common', 'dashboard', 'auth', 'profile', 'errors', 'landing', 'work'] as const;
type ModuleName = typeof availableModules[number];

/**
 * Загружает модуль локализации
 * @param locale - код языка (ru, en)
 * @param module - название модуля
 * @returns Promise с данными модуля или пустым объектом при ошибке
 */
const loadModule = async (locale: string, module: ModuleName): Promise<Record<string, any>> => {
  // Проверяем кэш - был ли уже загружен этот модуль для данного языка
  if (loadedModules.has(locale) && loadedModules.get(locale)!.has(module)) {
    // Модуль уже загружен, возвращаем пустой объект (данные уже в i18n)
    return {};
  }

  try {
    const data = await import(`./locales/${locale}/${module}.json`);
    const moduleData = data.default || {};
    
    // Помечаем модуль как загруженный
    if (!loadedModules.has(locale)) {
      loadedModules.set(locale, new Set());
    }
    loadedModules.get(locale)!.add(module);
    
    return moduleData;
  } catch (error) {
    console.warn(`Failed to load module ${module} for locale ${locale}:`, error);
    // Возвращаем пустой объект вместо ошибки для graceful degradation
    return {};
  }
};

/**
 * Загружает все модули для языка и объединяет их
 * @param locale - код языка
 * @returns Promise с объединенными данными всех модулей
 */
const loadAllModules = async (locale: string): Promise<Record<string, any>> => {
  try {
    // Загружаем все модули параллельно
    const modules = await Promise.all(
      availableModules.map(module => loadModule(locale, module))
    );
    
    // Объединяем все модули в один объект
    const merged = modules.reduce((acc, moduleData) => {
      return { ...acc, ...moduleData };
    }, {});
    
    return merged;
  } catch (error) {
    console.error(`Failed to load modules for locale ${locale}:`, error);
    // Fallback на русский язык при ошибке
    if (locale !== 'ru') {
      return loadAllModules('ru');
    }
    return {};
  }
};

/**
 * Загружает критический модуль common для быстрого старта
 * @param locale - код языка
 */
const loadCriticalModule = async (locale: string): Promise<Record<string, any>> => {
  return loadModule(locale, 'common');
};

// Инициализация i18n с модульной загрузкой
i18n.use(initReactI18next).init({
  resources: {}, // Ресурсы будут загружены динамически
  lng: initialLanguage,
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // Отключаем Suspense для i18n, чтобы не блокировать рендеринг
  },
});

// Загружаем критический модуль common при старте для быстрой инициализации
loadCriticalModule(initialLanguage).then((commonData) => {
  i18n.addResourceBundle(initialLanguage, 'translation', commonData, true, true);
  
  // Предзагружаем dashboard и profile модули для оптимизации (так как они часто используются на DashboardPage)
  // Загружаем параллельно для ускорения
  Promise.all([
    loadModule(initialLanguage, 'dashboard'),
    loadModule(initialLanguage, 'profile'),
  ]).then(([dashboardData, profileData]) => {
    if (Object.keys(dashboardData).length > 0) {
      i18n.addResourceBundle(initialLanguage, 'translation', dashboardData, true, true);
    }
    if (Object.keys(profileData).length > 0) {
      i18n.addResourceBundle(initialLanguage, 'translation', profileData, true, true);
    }
  }).catch((error) => {
    console.warn('Failed to preload i18n modules:', error);
  });
});

/**
 * Функция для динамической загрузки языка с модулями
 * @param locale - код языка
 */
export const changeLanguage = async (locale: string) => {
  // Проверяем, загружен ли уже язык полностью
  if (!loadedModules.has(locale) || loadedModules.get(locale)!.size < availableModules.length) {
    // Загружаем все модули для нового языка
    const allModules = await loadAllModules(locale);
    i18n.addResourceBundle(locale, 'translation', allModules, true, true);
  }
  await i18n.changeLanguage(locale);
};

/**
 * Предзагружает модуль для текущего языка
 * @param module - название модуля для предзагрузки
 */
export const preloadModule = async (module: ModuleName) => {
  const currentLang = i18n.language;
  const moduleData = await loadModule(currentLang, module);
  if (Object.keys(moduleData).length > 0) {
    i18n.addResourceBundle(currentLang, 'translation', moduleData, true, true);
  }
};

export default i18n;

