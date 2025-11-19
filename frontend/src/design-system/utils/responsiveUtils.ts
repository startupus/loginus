/**
 * Responsive Utilities - утилиты для работы с breakpoints
 */

import React from 'react';

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Проверка текущего breakpoint
 */
export const isBreakpoint = (breakpoint: Breakpoint): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints[breakpoint];
};

/**
 * Получить текущий breakpoint
 */
export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Hook для отслеживания breakpoint
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>(getCurrentBreakpoint());

  React.useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

/**
 * Проверка мобильного устройства
 */
export const isMobile = (): boolean => {
  return !isBreakpoint('lg');
};

/**
 * Проверка планшета
 */
export const isTablet = (): boolean => {
  return isBreakpoint('md') && !isBreakpoint('lg');
};

/**
 * Проверка десктопа
 */
export const isDesktop = (): boolean => {
  return isBreakpoint('lg');
};


