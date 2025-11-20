/** @type {import('tailwindcss').Config} */
export default {
  // Оптимизация: сканируем только необходимые файлы
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Исключаем директории, которые не содержат UI компонентов
    '!./src/**/*.test.{js,ts,jsx,tsx}',
    '!./src/**/*.spec.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Используем класс для переключения темной темы
  theme: {
    extend: {
      colors: {
        // Основные цвета через CSS переменные темы
        primary: { DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)' },
        secondary: { DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)' },
        success: { DEFAULT: 'rgb(var(--color-success) / <alpha-value>)' },
        warning: { DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)' },
        error: { DEFAULT: 'rgb(var(--color-error) / <alpha-value>)' },
        info: { DEFAULT: 'rgb(var(--color-info) / <alpha-value>)' },
        
        // Фоновые цвета через CSS переменные
        background: { DEFAULT: 'rgb(var(--color-background) / <alpha-value>)' },
        surface: { DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)' },
        'surface-elevated': { DEFAULT: 'rgb(var(--color-surface-elevated) / <alpha-value>)' },
        
        // Цвета текста через CSS переменные
        'text-primary': { DEFAULT: 'rgb(var(--color-text-primary) / <alpha-value>)' },
        'text-secondary': { DEFAULT: 'rgb(var(--color-text-secondary) / <alpha-value>)' },
        'text-disabled': { DEFAULT: 'rgb(var(--color-text-disabled) / <alpha-value>)' },
        
        // Границы через CSS переменные
        border: { DEFAULT: 'rgb(var(--color-border) / <alpha-value>)' },
        
        // Цвета TailGrids для темной темы (используются в некоторых компонентах)
        // Используем CSS переменные для динамического изменения в зависимости от темы
        dark: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',  // Основной темный фон
          2: 'rgb(var(--color-surface) / <alpha-value>)',            // Фон карточек/секций
          3: 'rgb(var(--color-border) / <alpha-value>)',              // Границы
          4: 'rgb(var(--color-text-secondary) / <alpha-value>)',      // Вторичный текст
          6: 'rgb(var(--color-text-secondary) / <alpha-value>)',      // Вторичный текст (альтернативный)
        },
        
        // Дополнительные цвета для совместимости
        stroke: { DEFAULT: 'rgb(var(--color-stroke) / <alpha-value>)' },
        'body-color': { DEFAULT: 'rgb(var(--color-text-secondary) / <alpha-value>)' },
        gray: {
          DEFAULT: 'rgb(var(--color-gray-1) / <alpha-value>)',
          1: 'rgb(var(--color-gray-1) / <alpha-value>)',
          2: 'rgb(var(--color-gray-2) / <alpha-value>)',
          3: 'rgb(var(--color-gray-3) / <alpha-value>)',
        },
      },
      spacing: {
        // Используем CSS переменные для spacing
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
      },
      borderRadius: {
        // Используем CSS переменные для border radius
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        // Используем CSS переменные для теней
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
    },
  },
  plugins: [],
  // Оптимизация: настройки для production
  ...(process.env.NODE_ENV === 'production' && {
    // Удаляем неиспользуемые стили более агрессивно
    safelist: [
      // Сохраняем динамические классы, которые генерируются программно
      {
        pattern: /^(bg|text|border)-(primary|secondary|success|warning|error|info|background|surface|surface-elevated|text-primary|text-secondary|text-disabled|border)/,
        variants: ['hover', 'focus', 'active', 'dark'],
      },
      {
        pattern: /^(w|h)-(6|8|10|12|16|20)/,
      },
    ],
  }),
};

