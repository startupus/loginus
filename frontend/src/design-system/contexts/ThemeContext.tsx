import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '../themes/types';
import { lightTheme } from '../themes/light';
import { darkTheme } from '../themes/dark';
import { corporateTheme } from '../themes/corporate';

type ThemeMode = 'light' | 'dark' | 'system' | 'corporate';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('loginus-theme-mode');
    return (saved as ThemeMode) || 'light';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      let dark = false;

      if (themeMode === 'dark') {
        dark = true;
      } else if (themeMode === 'system') {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(dark);

      // Синхронизировать токены темы с CSS переменными для динамического изменения
      const currentTheme = themeMode === 'corporate' ? corporateTheme : dark ? darkTheme : lightTheme;
      const root = document.documentElement;
      
      // Утилита для конвертации hex в RGB
      const hexToRgb = (hex: string): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return '';
        return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
      };
      
      // Устанавливаем переменные ПЕРЕД добавлением класса dark
      // Это гарантирует, что inline стили будут иметь приоритет над CSS
      const borderColor = hexToRgb(currentTheme.colors.border) || (dark ? '31 41 55' : '226 232 240');
      
      // Цвета - конвертируем hex в RGB формат для CSS переменных
      root.style.setProperty('--color-primary', hexToRgb(currentTheme.colors.primary) || '14 165 233');
      root.style.setProperty('--color-secondary', hexToRgb(currentTheme.colors.secondary) || '100 116 139');
      root.style.setProperty('--color-success', hexToRgb(currentTheme.colors.success) || '34 197 94');
      root.style.setProperty('--color-error', hexToRgb(currentTheme.colors.error) || '239 68 68');
      root.style.setProperty('--color-warning', hexToRgb(currentTheme.colors.warning) || '245 158 11');
      root.style.setProperty('--color-info', hexToRgb(currentTheme.colors.info) || '59 130 246');
      root.style.setProperty('--color-background', hexToRgb(currentTheme.colors.background) || '255 255 255');
      root.style.setProperty('--color-surface', hexToRgb(currentTheme.colors.surface) || '248 250 252');
      // surface-elevated: белый в светлой теме, более светлый серый в темной теме
      const surfaceElevatedColor = dark 
        ? '55 65 81' // #374151 - более светлый серый для контраста в темной теме
        : '255 255 255'; // Белый в светлой теме
      root.style.setProperty('--color-surface-elevated', surfaceElevatedColor);
      root.style.setProperty('--color-text-primary', hexToRgb(currentTheme.colors.text.primary) || '15 23 42');
      root.style.setProperty('--color-text-secondary', hexToRgb(currentTheme.colors.text.secondary) || '100 116 139');
      root.style.setProperty('--color-text-disabled', hexToRgb(currentTheme.colors.text.disabled) || '203 213 225');
      root.style.setProperty('--color-border', borderColor);
      // Обновляем --color-stroke чтобы он соответствовал --color-border (для совместимости)
      root.style.setProperty('--color-stroke', borderColor);
      
      // Обновить класс на html элементе ПОСЛЕ установки переменных
      // Inline стили имеют приоритет над CSS, поэтому они будут использоваться
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Повторно устанавливаем переменные после добавления класса для гарантии
      // Используем requestAnimationFrame для гарантии применения после изменения класса
      requestAnimationFrame(() => {
        root.style.setProperty('--color-border', borderColor);
        root.style.setProperty('--color-stroke', borderColor);
        root.style.setProperty('--color-surface-elevated', surfaceElevatedColor);
        // Дополнительная проверка в dev режиме
        if (process.env.NODE_ENV === 'development') {
          const computedBorder = getComputedStyle(root).getPropertyValue('--color-border').trim();
          if (computedBorder !== borderColor) {
            console.warn(`[ThemeContext] Border color mismatch: expected "${borderColor}", got "${computedBorder}"`);
            console.warn('[ThemeContext] Attempting to fix...');
            // Пытаемся исправить, устанавливая значение напрямую на :root
            root.style.setProperty('--color-border', borderColor);
            root.style.setProperty('--color-stroke', borderColor);
          }
        }
      });
      
      // Spacing
      root.style.setProperty('--spacing-xs', currentTheme.spacing.xs);
      root.style.setProperty('--spacing-sm', currentTheme.spacing.sm);
      root.style.setProperty('--spacing-md', currentTheme.spacing.md);
      root.style.setProperty('--spacing-lg', currentTheme.spacing.lg);
      root.style.setProperty('--spacing-xl', currentTheme.spacing.xl);
      
      // Border Radius
      root.style.setProperty('--radius-sm', currentTheme.borderRadius.sm);
      root.style.setProperty('--radius-md', currentTheme.borderRadius.md);
      root.style.setProperty('--radius-lg', currentTheme.borderRadius.lg);
      root.style.setProperty('--radius-xl', currentTheme.borderRadius.xl);
      root.style.setProperty('--radius-full', currentTheme.borderRadius.full);
      
      // Shadows
      root.style.setProperty('--shadow-sm', currentTheme.shadows.sm);
      root.style.setProperty('--shadow-md', currentTheme.shadows.md);
      root.style.setProperty('--shadow-lg', currentTheme.shadows.lg);
      root.style.setProperty('--shadow-xl', currentTheme.shadows.xl);
    };

    updateTheme();

    // Слушать изменения system theme
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('loginus-theme-mode', mode);
  };

  const theme =
    themeMode === 'corporate' ? corporateTheme : isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

