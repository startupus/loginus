import { Theme } from './types';

export const corporateTheme: Theme = {
  name: 'corporate',
  colors: {
    primary: '#8b5cf6', // фирменный фиолетовый
    secondary: '#64748b',
    success: '#16a34a',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#6366f1',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#cbd5e1',
    },
    border: '#e2e8f0',
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
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};


