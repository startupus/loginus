/**
 * Feature toggle для переключения между системами переводов
 */

import { I18N_MODE, isDynamicMode, useStaticFallback } from './config';

/**
 * Режим работы i18n системы
 */
export type I18nMode = 'static' | 'dynamic' | 'hybrid';

/**
 * Получает текущий режим работы i18n
 */
export function getI18nMode(): I18nMode {
  return I18N_MODE;
}

/**
 * Проверяет, используется ли статическая система (текущая)
 */
export function isStaticMode(): boolean {
  return I18N_MODE === 'static';
}

/**
 * Проверяет, используется ли динамическая система (новая)
 */
export function isDynamicI18nMode(): boolean {
  return isDynamicMode();
}

/**
 * Проверяет, используется ли гибридный режим
 */
export function isHybridMode(): boolean {
  return I18N_MODE === 'hybrid';
}

/**
 * Проверяет, используется ли статический fallback
 */
export function useStaticFallbackMode(): boolean {
  return useStaticFallback();
}

/**
 * Переключает режим работы i18n (только для development)
 * В production режим определяется через environment variables
 */
export function setI18nMode(mode: I18nMode): void {
  if (process.env.NODE_ENV === 'development') {
    // В development можно переключать режим через localStorage
    localStorage.setItem('i18n-mode-override', mode);
    
    // Перезагружаем страницу для применения изменений
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } else {
    console.warn('setI18nMode is only available in development mode');
  }
}

/**
 * Получает режим работы с учетом override в development
 */
export function getEffectiveI18nMode(): I18nMode {
  if (process.env.NODE_ENV === 'development') {
    const override = localStorage.getItem('i18n-mode-override');
    if (override && ['static', 'dynamic', 'hybrid'].includes(override)) {
      return override as I18nMode;
    }
  }
  return I18N_MODE;
}

