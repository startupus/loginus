import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { loadModule, loadModules } from './v2/loader';
import { AVAILABLE_MODULES, CRITICAL_MODULES, getModuleByKey } from './v2/config';
import type { Locale, ModuleName } from './v2/types';

/**
 * Возвращает язык из URL (приоритет) или из localStorage (fallback).
 * Это предотвращает мигание текста при загрузке страницы.
 */
const getInitialLanguage = (): Locale => {
  // Приоритет 1: язык из URL (если доступен)
  if (typeof window !== 'undefined') {
    const pathMatch = window.location.pathname.match(/^\/(ru|en)(\/|$)/);
    if (pathMatch && (pathMatch[1] === 'ru' || pathMatch[1] === 'en')) {
      return pathMatch[1] as Locale;
    }
  }
  
  // Приоритет 2: язык из localStorage (zustand persist)
  try {
    const stored = localStorage.getItem('loginus-language');
    if (stored) {
      const parsed = JSON.parse(stored);
      const lang = parsed?.state?.language;
      if (lang === 'ru' || lang === 'en') {
        return lang;
      }
    }
  } catch {
    // Игнорируем ошибки чтения/парсинга
  }
  
  // Fallback: русский по умолчанию
  return 'ru';
};

const initialLanguage: Locale = getInitialLanguage();

/**
 * Трекер загруженных модулей, чтобы не дёргать один и тот же бандл повторно.
 */
const loadedModules = new Map<Locale, Set<ModuleName>>();

const markModuleAsLoaded = (locale: Locale, module: ModuleName) => {
  if (!loadedModules.has(locale)) {
    loadedModules.set(locale, new Set());
  }
  loadedModules.get(locale)!.add(module);
};

const ensureModuleNamespace = (
  module: ModuleName,
  rawData: Record<string, any>,
): Record<string, any> => {
  if (!rawData || typeof rawData !== 'object') {
    return { [module]: {} };
  }

  const data =
    rawData && typeof rawData === 'object' && 'data' in rawData && typeof rawData.data === 'object'
      ? rawData.data
      : rawData;

  if (Object.prototype.hasOwnProperty.call(data, module)) {
    return data;
  }

  return { [module]: data };
};

/**
 * Глубокое объединение объектов переводов.
 */
const deepMerge = (target: Record<string, any>, source: Record<string, any>): Record<string, any> => {
  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = result[key];

    const isObject = (value: unknown): value is Record<string, any> =>
      typeof value === 'object' && value !== null && !Array.isArray(value);

    if (isObject(sourceValue) && isObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  });

  return result;
};

/**
 * Загружает конкретный модуль перевода и помечает его как загруженный.
 */
const loadModuleForI18n = async (
  locale: Locale,
  module: ModuleName,
  forceReload = false,
): Promise<Record<string, any>> => {
  const alreadyLoaded = loadedModules.has(locale) && loadedModules.get(locale)!.has(module);
  if (alreadyLoaded && !forceReload) {
    return {};
  }

  try {
    const data = await loadModule(locale, module, {
      useAPI: true,
      useCache: true,
      useStaticFallback: true,
      forceRefresh: forceReload,
    });

    if (data && Object.keys(data).length > 0) {
      markModuleAsLoaded(locale, module);
      return ensureModuleNamespace(module, data);
    }

    return {};
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Failed to load module ${module} for ${locale}:`, error);
    }
    return {};
  }
};

/**
 * Загружает все модули для языка и объединяет их в один объект.
 */
const loadAllModulesForLanguage = async (locale: Locale): Promise<Record<string, any>> => {
  try {
    const modules = await loadModules(
      locale,
      [...AVAILABLE_MODULES] as ModuleName[],
      {
        useAPI: true,
        useCache: true,
        useStaticFallback: true,
      },
    );

    const merged = Object.entries(modules).reduce<Record<string, any>>(
      (acc, [moduleName, moduleData]) => {
        if (moduleData && typeof moduleData === 'object' && Object.keys(moduleData).length > 0) {
          markModuleAsLoaded(locale, moduleName as ModuleName);
          return deepMerge(acc, ensureModuleNamespace(moduleName as ModuleName, moduleData));
        }
        return acc;
      },
      {},
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(`[i18n] Loaded & merged ${Object.keys(merged).length} top-level keys for ${locale}`);
    }

    return merged;
  } catch (error) {
    console.error(`[i18n] Failed to load modules for locale ${locale}:`, error);
    if (locale !== 'ru') {
      return loadAllModulesForLanguage('ru');
    }
    return {};
  }
};

const addBundle = (locale: Locale, data: Record<string, any>, context: string) => {
  if (!data || Object.keys(data).length === 0) {
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    const sampleKeys = Object.keys(data).slice(0, 10);
    console.log(`[i18n] [${context}] add bundle for ${locale}: ${sampleKeys.length} keys`, sampleKeys);
  }

  i18n.addResourceBundle(locale, 'translation', data, true, true);
};

/**
 * Базовая инициализация i18next. Все ресурсы загружаются динамически.
 */
i18n.use(initReactI18next).init({
  resources: {},
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
  defaultNS: 'translation',
  ns: ['translation'],
});

// Синхронизируем document.documentElement.lang сразу при инициализации
// Это предотвращает мигание текста при загрузке страницы
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

// Экспортируем инстанс для дебага (только в dev).
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).i18next = i18n;
}

/**
 * Загружаем критичные модули (common + profile) до первого рендера,
 * чтобы базовые переводы были доступны сразу.
 */
(async () => {
  try {
    const criticalModules = await loadModules(
      initialLanguage,
      [...CRITICAL_MODULES] as ModuleName[],
      {
        useAPI: true,
        useCache: true,
        useStaticFallback: true,
      },
    );

    const mergedCritical = Object.entries(criticalModules).reduce<Record<string, any>>(
      (acc, [name, data]) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          markModuleAsLoaded(initialLanguage, name as ModuleName);
          return deepMerge(acc, ensureModuleNamespace(name as ModuleName, data));
        }
        return acc;
      },
      {},
    );

    addBundle(initialLanguage, mergedCritical, 'critical');

    // Дополнительная загрузка модулей для предзагрузки (не критично для первого рендера)
    // dashboard уже загружен в критичных модулях, но можем предзагрузить другие
    const preloadAdditionalModules = async () => {
      try {
        // Предзагружаем модули, которые могут понадобиться на странице
        const additionalModules: ModuleName[] = ['modals', 'errors'];
        await loadModules(
          initialLanguage,
          additionalModules,
          {
            useAPI: true,
            useCache: true,
            useStaticFallback: true,
          },
        ).then((modules) => {
          const merged = Object.entries(modules).reduce<Record<string, any>>(
            (acc, [name, data]) => {
              if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                markModuleAsLoaded(initialLanguage, name as ModuleName);
                return deepMerge(acc, ensureModuleNamespace(name as ModuleName, data));
              }
              return acc;
            },
            {},
          );
          addBundle(initialLanguage, merged, 'preload');
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[i18n] Failed to preload additional modules:', error);
        }
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadAdditionalModules, { timeout: 2000 });
    } else {
      setTimeout(preloadAdditionalModules, 100);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[i18n] Failed to load critical modules:', error);
    }
  }
})();

/**
 * Автозагрузка модулей по событию missingKey (на всякий случай).
 */
i18n.on('missingKey', (lngs, _ns, key) => {
  const lng = (Array.isArray(lngs) ? lngs[0] : lngs) as Locale | undefined;
  if (!lng) {
    return;
  }

  const module = getModuleByKey(key);
  if (!module) {
    return;
  }

  const isLoaded = loadedModules.has(lng) && loadedModules.get(lng)!.has(module);
  if (isLoaded) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Key ${key} not found even though module ${module} is loaded`);
    }
    return;
  }

  loadModuleForI18n(lng, module)
    .then((data) => addBundle(lng, data, `missingKey:${module}`))
    .then(() => i18n.reloadResources(lng).catch(() => undefined))
    .catch(() => undefined);
});

/**
 * Смена языка с загрузкой только критичных модулей.
 * Остальные модули загружаются по требованию через missingKey handler.
 */
export const changeLanguage = async (locale: string) => {
  const targetLocale = (locale === 'en' ? 'en' : 'ru') as Locale;

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[i18n] Changing language to ${targetLocale}`);
    }

    // Загружаем только критичные модули для быстрого переключения языка
    // Остальные модули будут загружены по требованию через missingKey handler
    const criticalModules = await loadModules(
      targetLocale,
      [...CRITICAL_MODULES] as ModuleName[],
      {
        useAPI: true,
        useCache: true,
        useStaticFallback: true,
      },
    );

    const mergedCritical = Object.entries(criticalModules).reduce<Record<string, any>>(
      (acc, [name, data]) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          markModuleAsLoaded(targetLocale, name as ModuleName);
          return deepMerge(acc, ensureModuleNamespace(name as ModuleName, data));
        }
        return acc;
      },
      {},
    );

    addBundle(targetLocale, mergedCritical, 'changeLanguage');

    await i18n.changeLanguage(targetLocale);
    await i18n.reloadResources(targetLocale);
    
    // Синхронизируем document.documentElement.lang
    if (typeof document !== 'undefined') {
      document.documentElement.lang = targetLocale;
    }
    
    i18n.emit('languageChanged', targetLocale);
  } catch (error) {
    console.error(`[i18n] Failed to change language to ${targetLocale}:`, error);
    if (targetLocale !== 'ru') {
      await changeLanguage('ru');
    }
  }
};

/**
 * Предзагрузка модуля для текущего языка.
 * Использует кэш если модуль уже загружен, не делает лишних запросов к API.
 */
export const preloadModule = async (module: ModuleName) => {
  const currentLang = (i18n.language || initialLanguage) as Locale;
  
  // Проверяем, не загружен ли уже модуль
  const alreadyLoaded = loadedModules.has(currentLang) && loadedModules.get(currentLang)!.has(module);
  if (alreadyLoaded) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[i18n] Module ${module} already loaded for ${currentLang}, skipping preload`);
    }
    return;
  }
  
  // Загружаем модуль без forceReload, чтобы использовать кэш
  const data = await loadModuleForI18n(currentLang, module, false);
  addBundle(currentLang, data, `preload:${module}`);
};

export default i18n;

