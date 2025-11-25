/**
 * Конфигурация системы переводов v2
 */

import type { ModuleName, Locale } from './types';

/**
 * Базовый URL для API v2
 */
export const API_V2_BASE_URL =
  import.meta.env.VITE_I18N_API_BASE_URL || '/api/v2';

/**
 * Режим работы i18n системы
 * - 'static' - только статические файлы (текущая система)
 * - 'dynamic' - только API v2 (новая система)
 * - 'hybrid' - гибридный режим (API → кэш → статические файлы)
 */
export const I18N_MODE: 'static' | 'dynamic' | 'hybrid' =
  (import.meta.env.VITE_I18N_MODE as 'static' | 'dynamic' | 'hybrid') ||
  'hybrid'; // По умолчанию используем гибридный режим (API → кэш → статические файлы)

/**
 * Версия API для переводов
 */
export const I18N_API_VERSION =
  import.meta.env.VITE_I18N_API_VERSION || 'v2';

/**
 * TTL кэша в миллисекундах (по умолчанию 5 минут)
 */
export const CACHE_TTL =
  Number(import.meta.env.VITE_I18N_CACHE_TTL) || 5 * 60 * 1000;

/**
 * Интервал проверки версии переводов (по умолчанию 5 минут)
 */
export const VERSION_CHECK_INTERVAL =
  Number(import.meta.env.VITE_I18N_VERSION_CHECK_INTERVAL) || 5 * 60 * 1000;

/**
 * Доступные модули переводов
 */
export const AVAILABLE_MODULES: readonly ModuleName[] = [
  'common',
  'dashboard',
  'auth',
  'profile',
  'data',
  'errors',
  'landing',
  'about',
  'features',
  'help',
  'work',
  'modals',
  'support',
  'payment',
  'admin',
] as const;

/**
 * Критичные модули, которые загружаются сразу при инициализации
 */
export const CRITICAL_MODULES: readonly ModuleName[] = [
  'common',
  'profile',
  'dashboard',
] as const;

/**
 * Название базы данных IndexedDB для кэширования переводов
 */
export const DB_NAME = 'loginus-i18n-cache';

/**
 * Версия базы данных IndexedDB
 */
export const DB_VERSION = 1;

/**
 * Название хранилища объектов в IndexedDB
 */
export const STORE_NAME = 'translations';

/**
 * Маппинг ключей переводов к модулям
 * Используется для автоматического определения модуля по ключу
 */
export const KEY_TO_MODULE_MAP: Record<string, ModuleName> = {
  dashboard: 'dashboard',
  auth: 'auth',
  onboarding: 'auth',
  profile: 'profile',
  security: 'profile',
  personalData: 'profile',
  personal: 'profile',
  family: 'profile',
  data: 'data',
  landing: 'landing',
  about: 'about',
  features: 'features',
  help: 'help',
  work: 'work',
  errors: 'errors',
  modals: 'modals',
  support: 'support',
  payment: 'payment',
  pay: 'payment',
  admin: 'admin',
};

/**
 * Определяет модуль по ключу перевода
 */
export function getModuleByKey(key: string): ModuleName | null {
  const prefix = key.split('.')[0];
  return KEY_TO_MODULE_MAP[prefix] || null;
}

/**
 * Проверяет, является ли режим работы динамическим или гибридным
 */
export function isDynamicMode(): boolean {
  return I18N_MODE === 'dynamic' || I18N_MODE === 'hybrid';
}

/**
 * Проверяет, используется ли статический fallback
 */
export function useStaticFallback(): boolean {
  return I18N_MODE === 'hybrid' || I18N_MODE === 'static';
}

