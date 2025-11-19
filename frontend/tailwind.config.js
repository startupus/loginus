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
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)' },
        secondary: { DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)' },
        success: { DEFAULT: 'rgb(var(--color-success) / <alpha-value>)' },
        warning: { DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)' },
        error: { DEFAULT: 'rgb(var(--color-error) / <alpha-value>)' },
        info: { DEFAULT: 'rgb(var(--color-info) / <alpha-value>)' },
        // Цвета TailGrids для темной темы
        dark: {
          DEFAULT: '#111928',  // стандарт TailGrids - основной темный фон
          2: '#1F2A37',        // стандарт TailGrids - фон карточек/секций
          3: '#374151',        // стандарт TailGrids - границы
          6: '#9CA3AF',        // стандарт TailGrids - вторичный текст
        },
        stroke: { DEFAULT: 'rgb(var(--color-stroke) / <alpha-value>)' },
        'body-color': { DEFAULT: 'rgb(var(--color-text-secondary) / <alpha-value>)' },
        gray: {
          DEFAULT: 'rgb(var(--color-gray-1) / <alpha-value>)',
          1: 'rgb(var(--color-gray-1) / <alpha-value>)',
          2: 'rgb(var(--color-gray-2) / <alpha-value>)',
          3: 'rgb(var(--color-gray-3) / <alpha-value>)',
        },
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
        pattern: /^(bg|text|border)-(primary|secondary|success|warning|error|info)/,
        variants: ['hover', 'focus', 'active', 'dark'],
      },
      {
        pattern: /^(w|h)-(6|8|10|12|16|20)/,
      },
    ],
  }),
};

