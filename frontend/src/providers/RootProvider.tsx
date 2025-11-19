import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider, ClientProvider, LanguageProvider } from '../design-system/contexts';

// React Query client с оптимизированными настройками
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
      gcTime: 10 * 60 * 1000, // 10 минут (заменяет cacheTime в v5)
      retry: 1,
      retryDelay: 1000, // Быстрая обработка ошибок
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Использовать кэш при повторном монтировании
      refetchOnReconnect: false, // Не перезагружать при переподключении
    },
  },
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
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </LanguageProvider>
        </ClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

