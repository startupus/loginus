/**
 * useThemeClasses - хук для удобного доступа к классам темы
 * Унифицирует использование темы через CSS переменные
 */

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getCSSVar, getRGBValue, getRGBAValue } from './themeUtils';

/**
 * Хук для получения классов и стилей с учетом темы
 * @returns Объект с утилитами для работы с темой
 */
export const useThemeClasses = () => {
  const { theme, isDark } = useTheme();

  /**
   * Получить CSS переменную темы
   */
  const getVar = (varName: string): string => {
    return getCSSVar(varName);
  };

  /**
   * Получить RGB значение цвета
   */
  const getColor = (varName: string): string => {
    return getRGBValue(varName);
  };

  /**
   * Получить RGBA значение цвета с прозрачностью
   */
  const getColorWithOpacity = (varName: string, opacity: number): string => {
    return getRGBAValue(varName, opacity);
  };

  /**
   * Получить стиль для фона с учетом темы
   */
  const getBackgroundStyle = (lightVar: string, darkVar?: string): React.CSSProperties => {
    const varName = isDark && darkVar ? darkVar : lightVar;
    return {
      backgroundColor: getColor(varName),
    };
  };

  /**
   * Получить стиль для текста с учетом темы
   */
  const getTextStyle = (lightVar: string, darkVar?: string): React.CSSProperties => {
    const varName = isDark && darkVar ? darkVar : lightVar;
    return {
      color: getColor(varName),
    };
  };

  /**
   * Получить стиль для границы с учетом темы
   */
  const getBorderStyle = (lightVar: string, darkVar?: string): React.CSSProperties => {
    const varName = isDark && darkVar ? darkVar : lightVar;
    return {
      borderColor: getColor(varName),
    };
  };

  /**
   * Получить классы для фона с учетом темы
   * Возвращает строку классов Tailwind с поддержкой dark mode
   */
  const getBackgroundClasses = (lightClass: string, darkClass?: string): string => {
    if (darkClass) {
      return `${lightClass} dark:${darkClass}`;
    }
    return lightClass;
  };

  /**
   * Получить классы для текста с учетом темы
   */
  const getTextClasses = (lightClass: string, darkClass?: string): string => {
    if (darkClass) {
      return `${lightClass} dark:${darkClass}`;
    }
    return lightClass;
  };

  /**
   * Получить классы для границы с учетом темы
   */
  const getBorderClasses = (lightClass: string, darkClass?: string): string => {
    if (darkClass) {
      return `${lightClass} dark:${darkClass}`;
    }
    return lightClass;
  };

  /**
   * Получить стиль для градиента с учетом темы
   */
  const getGradientStyle = (
    lightFrom: string,
    lightTo: string,
    darkFrom?: string,
    darkTo?: string
  ): React.CSSProperties => {
    const fromVar = isDark && darkFrom ? darkFrom : lightFrom;
    const toVar = isDark && darkTo ? darkTo : lightTo;
    
    return {
      background: `linear-gradient(to right, ${getColor(fromVar)}, ${getColor(toVar)})`,
    };
  };

  /**
   * Получить стиль для градиента с использованием CSS переменных напрямую
   */
  const getGradientStyleFromVars = (
    fromVar: string,
    toVar: string,
    direction: 'to right' | 'to left' | 'to bottom' | 'to top' = 'to right'
  ): React.CSSProperties => {
    return {
      background: `linear-gradient(${direction}, rgb(var(${fromVar})), rgb(var(${toVar})))`,
    };
  };

  return {
    theme,
    isDark,
    getVar,
    getColor,
    getColorWithOpacity,
    getBackgroundStyle,
    getTextStyle,
    getBorderStyle,
    getBackgroundClasses,
    getTextClasses,
    getBorderClasses,
    getGradientStyle,
    getGradientStyleFromVars,
  };
};

