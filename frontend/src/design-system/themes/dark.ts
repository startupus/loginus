import { Theme } from './types';

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#38bdf8',
    secondary: '#94a3b8',
    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#475569',
    },
    border: '#1e293b', // Граница совпадает с surface для минимальной видимости в темной теме
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
};

