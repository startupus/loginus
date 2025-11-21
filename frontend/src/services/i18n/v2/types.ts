/**
 * Типы для системы переводов v2
 */

/**
 * Доступные модули переводов
 */
export type ModuleName =
  | 'common'
  | 'dashboard'
  | 'auth'
  | 'profile'
  | 'errors'
  | 'landing'
  | 'about'
  | 'work'
  | 'modals'
  | 'support'
  | 'payment';

/**
 * Доступные локали
 */
export type Locale = 'ru' | 'en';

/**
 * Ответ API для отдельного модуля перевода
 */
export interface TranslationModuleResponse {
  version: string;
  locale: string;
  module: string;
  data: Record<string, any>;
  timestamp: number;
  checksum: string;
}

/**
 * Статус переводов
 */
export interface TranslationStatus {
  version: string;
  modules: string[];
  locales: string[];
  lastUpdated: number;
}

/**
 * Версия переводов для локали
 */
export interface TranslationVersion {
  version: string;
  locale: string;
  timestamp: number;
}

/**
 * Кэшированные переводы модуля
 */
export interface CachedTranslation {
  id: string; // Составной ключ: `${locale}:${module}`
  version: string;
  locale: string;
  module: string;
  data: Record<string, any>;
  timestamp: number;
  checksum: string;
  cachedAt: number;
}

/**
 * Конфигурация загрузки модуля
 */
export interface LoadModuleOptions {
  /** Использовать кэш */
  useCache?: boolean;
  /** Использовать API */
  useAPI?: boolean;
  /** Использовать статические файлы как fallback */
  useStaticFallback?: boolean;
  /** Принудительное обновление (игнорировать кэш) */
  forceRefresh?: boolean;
}

