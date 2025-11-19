/**
 * Theme Utilities - утилиты для работы с темами
 * Single Source of Truth для theme-driven design
 */

/**
 * Получить CSS переменную темы
 * @example
 * getCSSVar('--color-primary') // returns '58 88 249'
 */
export const getCSSVar = (varName: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
};

/**
 * Установить CSS переменную темы
 * @example
 * setCSSVar('--color-primary', '58 88 249')
 */
export const setCSSVar = (varName: string, value: string): void => {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(varName, value);
};

/**
 * Получить RGB значение цвета из CSS переменной
 * @example
 * getRGBValue('--color-primary') // returns 'rgb(58, 88, 249)'
 */
export const getRGBValue = (varName: string): string => {
  const value = getCSSVar(varName);
  return value ? `rgb(${value})` : '';
};

/**
 * Получить RGBA значение цвета из CSS переменной с opacity
 * @example
 * getRGBAValue('--color-primary', 0.5) // returns 'rgba(58, 88, 249, 0.5)'
 */
export const getRGBAValue = (varName: string, opacity: number = 1): string => {
  const value = getCSSVar(varName);
  return value ? `rgba(${value}, ${opacity})` : '';
};

/**
 * Класс для создания кастомных цветовых вариантов
 * @example
 * colorVariant('primary') // returns 'text-primary bg-primary border-primary'
 */
export const colorVariant = (color: string): string => {
  return `text-${color} bg-${color} border-${color}`;
};

/**
 * Генерация класса для работы с темами
 * @example
 * themeClass('bg', 'primary') // returns 'bg-primary dark:bg-primary'
 */
export const themeClass = (
  property: 'bg' | 'text' | 'border',
  color: string,
  darkColor?: string
): string => {
  const base = `${property}-${color}`;
  const dark = darkColor ? ` dark:${property}-${darkColor}` : '';
  return `${base}${dark}`;
};

/**
 * Theme Token Accessors - доступ к токенам темы через CSS переменные
 */
export const themeTokens = {
  // Colors
  colors: {
    primary: () => getRGBValue('--color-primary'),
    secondary: () => getRGBValue('--color-secondary'),
    success: () => getRGBValue('--color-success'),
    error: () => getRGBValue('--color-error'),
    warning: () => getRGBValue('--color-warning'),
    info: () => getRGBValue('--color-info'),
    background: () => getRGBValue('--color-background'),
    surface: () => getRGBValue('--color-surface'),
    text: {
      primary: () => getRGBValue('--color-text-primary'),
      secondary: () => getRGBValue('--color-text-secondary'),
      disabled: () => getRGBValue('--color-text-disabled'),
    },
    border: () => getRGBValue('--color-border'),
  },
  
  // Spacing
  spacing: {
    xs: () => getCSSVar('--spacing-xs'),
    sm: () => getCSSVar('--spacing-sm'),
    md: () => getCSSVar('--spacing-md'),
    lg: () => getCSSVar('--spacing-lg'),
    xl: () => getCSSVar('--spacing-xl'),
  },
  
  // Border Radius
  radius: {
    sm: () => getCSSVar('--radius-sm'),
    md: () => getCSSVar('--radius-md'),
    lg: () => getCSSVar('--radius-lg'),
    xl: () => getCSSVar('--radius-xl'),
    full: () => getCSSVar('--radius-full'),
  },
  
  // Shadows
  shadows: {
    sm: () => getCSSVar('--shadow-sm'),
    md: () => getCSSVar('--shadow-md'),
    lg: () => getCSSVar('--shadow-lg'),
    xl: () => getCSSVar('--shadow-xl'),
  },
};

/**
 * Проверка текущей темы
 * @returns true если темная тема активна
 */
export const isDarkTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

/**
 * Применить пользовательскую тему (для multi-tenancy)
 * @param theme - объект с токенами темы
 */
export interface CustomTheme {
  primary?: string;
  secondary?: string;
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

export const applyCustomTheme = (theme: CustomTheme): void => {
  if (theme.primary) setCSSVar('--color-primary', theme.primary);
  if (theme.secondary) setCSSVar('--color-secondary', theme.secondary);
  if (theme.success) setCSSVar('--color-success', theme.success);
  if (theme.error) setCSSVar('--color-error', theme.error);
  if (theme.warning) setCSSVar('--color-warning', theme.warning);
  if (theme.info) setCSSVar('--color-info', theme.info);
};

/**
 * Сбросить кастомную тему к дефолту
 */
export const resetCustomTheme = (): void => {
  // Удаляем инлайн стили, чтобы вернуться к CSS дефолтам
  const root = document.documentElement;
  root.style.removeProperty('--color-primary');
  root.style.removeProperty('--color-secondary');
  root.style.removeProperty('--color-success');
  root.style.removeProperty('--color-error');
  root.style.removeProperty('--color-warning');
  root.style.removeProperty('--color-info');
};

