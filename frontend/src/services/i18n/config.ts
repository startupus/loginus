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
const availableModules = ['common', 'dashboard', 'auth', 'profile', 'errors', 'landing', 'about', 'features', 'help', 'work', 'modals', 'support', 'payment', 'admin'] as const;
type ModuleName = typeof availableModules[number];

// Статические ресурсы: RU подгружаем сразу, чтобы не было водопада чанков на первом экране
const staticResources: Record<'ru', Record<string, any>> = {
  ru: {},
};

const ruModules = import.meta.glob('./locales/ru/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, any> }
>;

for (const modulePath in ruModules) {
  const moduleData = ruModules[modulePath]?.default;
  if (moduleData) {
    Object.assign(staticResources.ru, moduleData);
  }
}

// Помечаем ru-модули как уже загруженные, чтобы динамический импорт не дергался повторно
loadedModules.set('ru', new Set(availableModules));

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
    // Динамический импорт с кэшированием браузером
    const data = await import(/* @vite-ignore */ `./locales/${locale}/${module}.json`);
    const moduleData = data.default || {};
    
    // Помечаем модуль как загруженный
    if (!loadedModules.has(locale)) {
      loadedModules.set(locale, new Set());
    }
    loadedModules.get(locale)!.add(module);
    
    return moduleData;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Failed to load module ${module} for locale ${locale}:`, error);
    }
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
  resources: {
    ru: {
      translation: staticResources.ru,
    },
  }, // Остальные языки подгружаются динамически
  lng: initialLanguage,
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // Отключаем Suspense для i18n, чтобы не блокировать рендеринг
  },
  // Отключаем возврат ключа если перевод не найден - используем fallback
  returnNull: false,
  returnEmptyString: false,
  returnObjects: false,
});

// Загружаем критический модуль common и profile при старте для быстрой инициализации
// Profile нужен для Header/ProfileMenu, который рендерится сразу
// Dashboard нужен для DashboardPage, который рендерится сразу
// Оптимизация: загружаем common модуль сразу (критично), profile и dashboard модули - асинхронно после первого рендера
(async () => {
  try {
    // Загружаем common модуль сразу (критично для базовых переводов)
    const commonData = await loadCriticalModule(initialLanguage);
    if (Object.keys(commonData).length > 0) {
      i18n.addResourceBundle(initialLanguage, 'translation', commonData, true, true);
    }
    
    // Загружаем profile и dashboard модули асинхронно после первого рендера (не блокируем)
    // Используем requestIdleCallback для неблокирующей загрузки
    const loadSecondaryModules = () => {
      Promise.all([
        loadModule(initialLanguage, 'profile'),
        loadModule(initialLanguage, 'dashboard'),
      ]).then(([profileData, dashboardData]) => {
          if (Object.keys(profileData).length > 0) {
            i18n.addResourceBundle(initialLanguage, 'translation', profileData, true, true);
          }
        if (Object.keys(dashboardData).length > 0) {
          i18n.addResourceBundle(initialLanguage, 'translation', dashboardData, true, true);
        }
        }).catch(() => {});
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadSecondaryModules, { timeout: 2000 });
    } else {
      // Fallback для браузеров без requestIdleCallback
      setTimeout(loadSecondaryModules, 100);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to load initial i18n modules:', error);
    }
  }
})();

// Автоматически загружаем модули при первом использовании ключа
i18n.on('missingKey', (lngs, _ns, key) => {
  const lng = Array.isArray(lngs) ? lngs[0] : lngs;
  if (!lng) return;
  
  // Определяем модуль по ключу и загружаем его
  let module: ModuleName | null = null;
  if (key.startsWith('dashboard.')) module = 'dashboard';
  else if (key.startsWith('auth.') || key.startsWith('onboarding.')) module = 'auth';
  else if (key.startsWith('profile.') || key.startsWith('security.') || key.startsWith('personalData.') || key.startsWith('personal.')) module = 'profile';
  else if (key.startsWith('landing.')) module = 'landing';
  else if (key.startsWith('about.')) module = 'about';
  else if (key.startsWith('work.')) module = 'work';
  else if (key.startsWith('errors.')) module = 'errors';
  else if (key.startsWith('modals.')) module = 'modals';
  else if (key.startsWith('support.')) module = 'support';
  
  if (module && (!loadedModules.has(lng) || !loadedModules.get(lng)!.has(module))) {
    // Загружаем модуль асинхронно без блокировки
    loadModule(lng, module).then((moduleData) => {
      if (Object.keys(moduleData).length > 0) {
        i18n.addResourceBundle(lng, 'translation', moduleData, true, true);
        // Обновляем ресурсы для применения изменений
        i18n.reloadResources(lng).catch(() => {});
      }
    }).catch(() => {});
  }
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
  // Перезагружаем ресурсы для принудительного обновления компонентов
  await i18n.reloadResources(locale);
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

