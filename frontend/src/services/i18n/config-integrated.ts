/**
 * Интегрированная конфигурация i18n с поддержкой v2 системы
 * Этот файл можно использовать для постепенной миграции на v2 систему
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isDynamicI18nMode, getEffectiveI18nMode } from './v2/toggle';
import { loadModule as loadModuleV2, loadModules as loadModulesV2 } from './v2/loader';
import { getModuleByKey } from './v2/config';
import { CRITICAL_MODULES } from './v2/config';
import type { Locale, ModuleName } from './v2/types';

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
const i18nMode = getEffectiveI18nMode();

// Кэш загруженных модулей для избежания повторных загрузок
const loadedModules = new Map<string, Set<string>>();

// Доступные модули локализации
const availableModules = ['common', 'dashboard', 'auth', 'profile', 'errors', 'landing', 'about', 'work', 'modals', 'support', 'payment'] as const;
type ModuleNameLegacy = typeof availableModules[number];

// Статические ресурсы: RU подгружаем сразу, чтобы не было водопада чанков на первом экране
const staticResources: Record<'ru', Record<string, any>> = {
  ru: {},
};

// Загружаем статические ресурсы только если не используется динамический режим
if (!isDynamicI18nMode() || i18nMode === 'hybrid') {
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

  // Помечаем ru-модули как уже загруженные
  loadedModules.set('ru', new Set(availableModules));
}

/**
 * Загружает модуль локализации (универсальная функция)
 * Поддерживает как статическую, так и динамическую загрузку
 */
const loadModule = async (locale: string, module: ModuleNameLegacy): Promise<Record<string, any>> => {
  // Проверяем кэш - был ли уже загружен этот модуль для данного языка
  if (loadedModules.has(locale) && loadedModules.get(locale)!.has(module)) {
    // Модуль уже загружен, возвращаем пустой объект (данные уже в i18n)
    return {};
  }

  // Если включен динамический режим, используем v2 систему
  if (isDynamicI18nMode()) {
    try {
      const data = await loadModuleV2(locale as Locale, module as ModuleName, {
        useAPI: true,
        useCache: true,
        useStaticFallback: i18nMode === 'hybrid',
      });

      // Помечаем модуль как загруженный
      if (!loadedModules.has(locale)) {
        loadedModules.set(locale, new Set());
      }
      loadedModules.get(locale)!.add(module);

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n-integrated] v2 load failed for ${locale}/${module}, falling back to static:`, error);
      }
      // Fallback на статическую загрузку
    }
  }

  // Статическая загрузка (текущая система или fallback)
  try {
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
    return {};
  }
};

/**
 * Загружает все модули для языка и объединяет их
 */
const loadAllModules = async (locale: string): Promise<Record<string, any>> => {
  try {
    // Если включен динамический режим, используем v2 систему
    if (isDynamicI18nMode()) {
      try {
        const modules = await loadModulesV2(
          locale as Locale,
          [...availableModules] as ModuleName[],
          {
            useAPI: true,
            useCache: true,
            useStaticFallback: i18nMode === 'hybrid',
          },
        );

        // Объединяем модули
        const merged = Object.values(modules).reduce((acc, moduleData) => {
          return { ...acc, ...moduleData };
        }, {});

        return merged;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n-integrated] v2 loadAllModules failed, falling back:`, error);
        }
        // Fallback на статическую загрузку
      }
    }

    // Статическая загрузка
    const modules = await Promise.all(
      availableModules.map(module => loadModule(locale, module))
    );

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
 */
const loadCriticalModule = async (locale: string): Promise<Record<string, any>> => {
  return loadModule(locale, 'common');
};

// Инициализация i18n с модульной загрузкой
// В динамическом режиме не загружаем статические ресурсы сразу
i18n.use(initReactI18next).init({
  resources: isDynamicI18nMode() && i18nMode !== 'hybrid' 
    ? {} // В чистом динамическом режиме не загружаем статику
    : {
        ru: {
          translation: staticResources.ru,
        },
      },
  lng: initialLanguage,
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  returnNull: false,
  returnEmptyString: false,
  returnObjects: false,
});

// Загружаем критичные модули при старте
(async () => {
  try {
    // Если включен динамический режим, загружаем критичные модули через v2
    if (isDynamicI18nMode()) {
      try {
        const modules = await loadModulesV2(
          initialLanguage as Locale,
          [...CRITICAL_MODULES] as ModuleName[],
          {
            useAPI: true,
            useCache: true,
            useStaticFallback: i18nMode === 'hybrid',
          },
        );

        // Добавляем модули в i18n
        Object.entries(modules).forEach(([module, data]) => {
          if (Object.keys(data).length > 0) {
            i18n.addResourceBundle(initialLanguage, 'translation', data, true, true);
          }
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[i18n-integrated] Failed to load critical modules via v2, using static:', error);
        }
        // Fallback на статическую загрузку
        const commonData = await loadCriticalModule(initialLanguage);
        if (Object.keys(commonData).length > 0) {
          i18n.addResourceBundle(initialLanguage, 'translation', commonData, true, true);
        }
      }
    } else {
      // Статическая загрузка критичных модулей
      const commonData = await loadCriticalModule(initialLanguage);
      if (Object.keys(commonData).length > 0) {
        i18n.addResourceBundle(initialLanguage, 'translation', commonData, true, true);
      }
    }

    // Загружаем profile модуль асинхронно после первого рендера
    // В динамическом режиме загружаем через v2, иначе через статику
    if (isDynamicI18nMode()) {
      // В динамическом режиме profile уже загружен через v2 выше
      // Дополнительно загружаем только если не был загружен
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(async () => {
          try {
            const profileData = await loadModuleV2(
              initialLanguage as Locale,
              'profile' as ModuleName,
              {
                useAPI: true,
                useCache: true,
                useStaticFallback: i18nMode === 'hybrid',
              },
            );
            if (Object.keys(profileData).length > 0) {
              i18n.addResourceBundle(initialLanguage, 'translation', profileData, true, true);
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[i18n-integrated] Failed to load profile via v2:', error);
            }
          }
        }, { timeout: 2000 });
      } else {
        setTimeout(async () => {
          try {
            const profileData = await loadModuleV2(
              initialLanguage as Locale,
              'profile' as ModuleName,
              {
                useAPI: true,
                useCache: true,
                useStaticFallback: i18nMode === 'hybrid',
              },
            );
            if (Object.keys(profileData).length > 0) {
              i18n.addResourceBundle(initialLanguage, 'translation', profileData, true, true);
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[i18n-integrated] Failed to load profile via v2:', error);
            }
          }
        }, 100);
      }
    } else {
      // Статическая загрузка profile модуля
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          loadModule(initialLanguage, 'profile').then((profileData) => {
            if (Object.keys(profileData).length > 0) {
              i18n.addResourceBundle(initialLanguage, 'translation', profileData, true, true);
            }
          }).catch(() => {});
        }, { timeout: 2000 });
      } else {
        setTimeout(() => {
          loadModule(initialLanguage, 'profile').then((profileData) => {
            if (Object.keys(profileData).length > 0) {
              i18n.addResourceBundle(initialLanguage, 'translation', profileData, true, true);
            }
          }).catch(() => {});
        }, 100);
      }
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

  // Используем функцию из v2/config для определения модуля
  const module = getModuleByKey(key) as ModuleName | null;

  if (module && (!loadedModules.has(lng) || !loadedModules.get(lng)!.has(module))) {
    // В динамическом режиме загружаем через v2, иначе через статику
    if (isDynamicI18nMode()) {
      loadModuleV2(
        lng as Locale,
        module,
        {
          useAPI: true,
          useCache: true,
          useStaticFallback: i18nMode === 'hybrid',
        },
      ).then((moduleData) => {
        if (Object.keys(moduleData).length > 0) {
          i18n.addResourceBundle(lng, 'translation', moduleData, true, true);
          i18n.reloadResources(lng).catch(() => {});
          // Помечаем модуль как загруженный
          if (!loadedModules.has(lng)) {
            loadedModules.set(lng, new Set());
          }
          loadedModules.get(lng)!.add(module);
        }
      }).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n-integrated] Failed to load module ${module} via v2:`, error);
        }
      });
    } else {
      // Статическая загрузка модуля
      loadModule(lng, module as ModuleNameLegacy).then((moduleData) => {
        if (Object.keys(moduleData).length > 0) {
          i18n.addResourceBundle(lng, 'translation', moduleData, true, true);
          i18n.reloadResources(lng).catch(() => {});
        }
      }).catch(() => {});
    }
  }
});

/**
 * Функция для динамической загрузки языка с модулями
 */
export const changeLanguage = async (locale: string) => {
  // Проверяем, загружен ли уже язык полностью
  if (!loadedModules.has(locale) || loadedModules.get(locale)!.size < availableModules.length) {
    // Загружаем все модули для нового языка
    const allModules = await loadAllModules(locale);
    i18n.addResourceBundle(locale, 'translation', allModules, true, true);
  }
  await i18n.changeLanguage(locale);
  await i18n.reloadResources(locale);
};

/**
 * Предзагружает модуль для текущего языка
 */
export const preloadModule = async (module: ModuleNameLegacy) => {
  const currentLang = i18n.language;
  const moduleData = await loadModule(currentLang, module);
  if (Object.keys(moduleData).length > 0) {
    i18n.addResourceBundle(currentLang, 'translation', moduleData, true, true);
  }
};

export default i18n;

