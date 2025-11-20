import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider, ClientProvider, LanguageProvider } from '../design-system/contexts';

// React Query client с оптимизированными настройками
export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
      gcTime: 10 * 60 * 1000, // 10 минут (заменяет cacheTime в v5)
      retry: 1,
      retryDelay: 1000, // Быстрая обработка ошибок
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Использовать кэш если данные свежие (staleTime не истек)
      refetchOnReconnect: false, // Не перезагружать при переподключении
    },
  },
  // Логирование отключено для производительности (можно включить при необходимости)
  // logger: process.env.NODE_ENV === 'development' ? {
  //   log: (...args) => console.log('[React Query]', ...args),
  //   warn: (...args) => console.warn('[React Query]', ...args),
  //   error: (...args) => console.error('[React Query]', ...args),
  // } : undefined,
});

interface RootProviderProps {
  children: React.ReactNode;
}

/**
 * RootProvider - объединенный провайдер для всех контекстов приложения
 * Оптимизирует структуру провайдеров, уменьшая вложенность
 * 
 * Порядок провайдеров важен:
 * 1. ErrorBoundary - перехватывает ошибки на верхнем уровне
 * 2. ThemeProvider - управление темой (должен быть доступен для всех)
 * 3. ClientProvider - управление клиентскими данными
 * 4. LanguageProvider - управление языком интерфейса
 * 5. QueryClientProvider - управление кэшем и запросами (должен быть последним для доступа ко всем контекстам)
 */
export const RootProvider: React.FC<RootProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ClientProvider>
          <LanguageProvider>
            <QueryClientProvider client={appQueryClient}>
              {children}
            </QueryClientProvider>
          </LanguageProvider>
        </ClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

