/**
 * Store для управления режимом работы i18n системы
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { I18nMode } from '../services/i18n/v2/toggle';
import { getEffectiveI18nMode } from '../services/i18n/v2/toggle';

interface I18nModeState {
  mode: I18nMode;
  setMode: (mode: I18nMode) => void;
}

/**
 * Store для режима работы i18n
 * Используется для отслеживания и переключения режима работы системы переводов
 */
export const useI18nModeStore = create<I18nModeState>()(
  persist(
    (set) => ({
      mode: getEffectiveI18nMode(),
      setMode: (mode: I18nMode) => {
        set({ mode });
        // В development можно перезагрузить страницу для применения изменений
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
          localStorage.setItem('i18n-mode-override', mode);
        }
      },
    }),
    {
      name: 'loginus-i18n-mode',
      // Не сохраняем в production, используем только environment variables
      skipHydration: process.env.NODE_ENV === 'production',
    },
  ),
);

