/**
 * Система загрузки переводов с fallback стратегией
 * Уровни fallback:
 * 1. Кэш IndexedDB
 * 2. API бэкенда
 * 3. Статические JSON файлы (текущая система)
 * 4. Fallback на русский язык
 * 5. Показ ключа перевода вместо текста
 */

import type { Locale, ModuleName, LoadModuleOptions } from './types';
import { translationCache } from './cache';
import { translationsAPI } from './api-client';
import {
  isDynamicMode,
  useStaticFallback,
} from './config';

/**
 * Загружает модуль перевода с использованием fallback стратегии
 */
export async function loadModule(
  locale: Locale,
  module: ModuleName,
  options: LoadModuleOptions & { _fallbackDepth?: number } = {},
): Promise<Record<string, any>> {
  const {
    useCache = true,
    useAPI = true,
    useStaticFallback: useStatic = true,
    forceRefresh = false,
    _fallbackDepth = 0, // Защита от бесконечной рекурсии
  } = options;

  // Защита от бесконечной рекурсии
  if (_fallbackDepth > 3) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n-v2] Max fallback depth reached for ${locale}/${module}`);
    }
    return {};
  }

  // Level 1: Проверяем кэш (если не требуется принудительное обновление)
  if (useCache && !forceRefresh && isDynamicMode()) {
    try {
      const cached = await translationCache.get(locale, module);
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[i18n-v2] Loaded ${locale}/${module} from cache`);
        }
        return cached.data;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n-v2] Cache read failed for ${locale}/${module}:`, error);
      }
    }
  }

  // Level 2: Загружаем через API (если включен динамический режим)
  if (useAPI && isDynamicMode()) {
    try {
      const response = await translationsAPI.getModule(locale, module);
      
      // Сохраняем в кэш
      if (useCache) {
        await translationCache.set(
          locale,
          module,
          response.data,
          response.version,
          response.checksum,
          response.timestamp,
        ).catch(() => {
          // Игнорируем ошибки кэширования
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[i18n-v2] Loaded ${locale}/${module} from API`);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n-v2] API load failed for ${locale}/${module}:`, error);
      }
      // Продолжаем к следующему уровню fallback
    }
  }

  // Level 3: Используем статические файлы (текущая система)
  if (useStatic && useStaticFallback()) {
    try {
      const data = await import(
        /* @vite-ignore */ `../locales/${locale}/${module}.json`
      );
      const moduleData = data.default || {};

      if (process.env.NODE_ENV === 'development') {
        console.log(`[i18n-v2] Loaded ${locale}/${module} from static files`);
      }

      return moduleData;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n-v2] Static load failed for ${locale}/${module}:`, error);
      }
      // Продолжаем к следующему уровню fallback
    }
  }

  // Level 4: Fallback на русский язык
  if (locale !== 'ru') {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[i18n-v2] Falling back to ru for module ${module}`);
      }
      return await loadModule('ru', module, {
        ...options,
        useAPI: false, // Не пытаемся загружать через API для fallback
        _fallbackDepth: _fallbackDepth + 1, // Увеличиваем глубину рекурсии
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n-v2] Fallback to ru failed for ${module}:`, error);
      }
    }
  }

  // Level 5: Возвращаем пустой объект (i18next покажет ключ)
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[i18n-v2] All fallback levels failed for ${locale}/${module}`);
  }

  return {};
}

/**
 * Загружает несколько модулей одновременно
 */
export async function loadModules(
  locale: Locale,
  modules: ModuleName[],
  options: LoadModuleOptions = {},
): Promise<Record<string, any>> {
  const { useAPI = true, useCache = true } = options;

  // Если включен динамический режим, пытаемся загрузить через API
  if (useAPI && isDynamicMode()) {
    try {
      const responses = await translationsAPI.getModules(locale, modules);
      const result: Record<string, any> = {};

      for (const response of responses) {
        result[response.module] = response.data;

        // Сохраняем в кэш
        if (useCache) {
          await translationCache.set(
            response.locale as Locale,
            response.module as ModuleName,
            response.data,
            response.version,
            response.checksum,
            response.timestamp,
          ).catch(() => {
            // Игнорируем ошибки кэширования
          });
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[i18n-v2] Loaded ${modules.length} modules from API`);
      }

      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n-v2] API load failed for modules:`, error);
      }
      // Продолжаем к загрузке по одному модулю
    }
  }

  // Загружаем модули по одному с fallback
  const result: Record<string, any> = {};
  await Promise.all(
    modules.map(async (module) => {
      try {
        result[module] = await loadModule(locale, module, options);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n-v2] Failed to load module ${module}:`, error);
        }
        result[module] = {};
      }
    }),
  );

  return result;
}

/**
 * Проверяет, нужно ли обновить модуль (сравнивает версии)
 */
export async function shouldUpdateModule(
  locale: Locale,
  module: ModuleName,
): Promise<boolean> {
  if (!isDynamicMode()) {
    return false;
  }

  try {
    // Получаем версию с сервера
    const serverVersion = await translationsAPI.getVersion(locale);
    
    // Получаем кэшированную версию
    const cached = await translationCache.get(locale, module);
    
    if (!cached) {
      return true; // Нет кэша, нужно загрузить
    }

    // Сравниваем версии
    return cached.version !== serverVersion.version;
  } catch {
    // При ошибке не обновляем
    return false;
  }
}

