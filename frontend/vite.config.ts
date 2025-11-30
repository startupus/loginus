import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
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
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'loginus.startapus.com',
      'www.loginus.startapus.com',
      '.startapus.com', // Разрешаем все поддомены
      'localhost',
      '127.0.0.1',
      '45.144.176.42',
    ],
    // Отключаем строгую проверку хоста для production
    strictPort: false,
    hmr: {
      clientPort: 3002,
      host: 'localhost',
      protocol: 'ws',
      timeout: 5000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    fs: {
      strict: false,
      allow: ['..'],
    },
    cors: true,
    headers: {
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=600',
    },
    proxy: {
      '/api': {
        // Используем localhost:3004 для локального запуска (порт loginus-api контейнера)
        // В Docker используйте 'http://loginus-api:3001'
        target: process.env.VITE_API_URL || 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
        timeout: 20000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('[Vite Proxy] proxy error:', err);
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Vite Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
            }
          });
        },
      },
      '/uploads': {
        // Проксируем статические файлы плагинов к backend
        target: process.env.VITE_API_URL || 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
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
    // Оптимизация минификации - используем esbuild (быстрее и уже включен)
    minify: 'esbuild',
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
    // Максимально агрессивная пре-сборка для Docker
    entries: ['./src/main.tsx'],
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'axios',
      'i18next',
      'react-i18next',
      'react-hook-form',
      '@hookform/resolvers',
      '@hookform/resolvers/zod',
      'zod',
      'react-icons',
      'react-icons/fa',
      'react-icons/fi',
      'react-icons/ai',
      'react-icons/bi',
      'react-icons/bs',
      'react-icons/io',
      'react-icons/md',
      'react-icons/ri',
      'react-icons/hi',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
    ],
    // Форсируем пересборку для обеспечения стабильности в Docker
    force: true,
    // Устанавливаем тайм-аут побольше
    esbuildOptions: {
      target: 'es2020',
    },
  },
});

