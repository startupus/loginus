import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@design-system': path.resolve(__dirname, './src/design-system'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 20000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('proxy error', err);
            }
          });
          // Убраны console.log для ускорения - логи только при необходимости
        },
      },
    },
  },
  build: {
    // Оптимизация размера чанков
    rollupOptions: {
      output: {
        // Более агрессивное разделение на чанки
        manualChunks: {
          // React и роутинг - критический чанк
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // State management
          'state-management': ['zustand', '@tanstack/react-query'],
          
          // Утилиты и i18n
          'utils': ['axios', 'i18next', 'react-i18next'],
          
          // Дизайн-система - разделяем на части
          'design-system-primitives': [
            './src/design-system/primitives/Button',
            './src/design-system/primitives/Input',
            './src/design-system/primitives/Avatar',
            './src/design-system/primitives/Icon',
            './src/design-system/primitives/Badge',
          ],
          'design-system-composites': [
            './src/design-system/composites/Modal',
            './src/design-system/composites/Tabs',
            './src/design-system/composites/DataSection',
          ],
          'design-system-layouts': [
            './src/design-system/layouts/Header',
            './src/design-system/layouts/Sidebar',
            './src/design-system/layouts/PageTemplate',
          ],
        },
        // Оптимизация именования файлов для лучшего кэширования
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Увеличиваем лимит предупреждения о размере чанка
    chunkSizeWarningLimit: 1000,
    // Оптимизация минификации
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удаляем console.log в продакшене
        drop_debugger: true, // Удаляем debugger
        pure_funcs: ['console.log', 'console.info'], // Удаляем дополнительные функции логирования
      },
      format: {
        comments: false, // Удаляем комментарии
      },
    },
    // Включаем source maps только для production (для отладки)
    sourcemap: false,
    // Оптимизация CSS
    cssCodeSplit: true, // Разделяем CSS по чанкам
    // Настройка target для лучшей оптимизации
    target: 'es2015',
    // Оптимизация модулей
    modulePreload: {
      polyfill: true, // Polyfill для module preload
    },
  },
  // Оптимизация для dev режима
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'axios',
      'i18next',
      'react-i18next',
    ],
  },
});

