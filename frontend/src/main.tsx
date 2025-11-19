import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider, ClientProvider, LanguageProvider } from './design-system/contexts';
import App from './App.tsx';
import './index.css';
import './services/i18n';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (заменяет cacheTime в v5)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Не перезагружать при монтировании, если данные в кэше
    },
  },
});

// Проверка наличия root элемента
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Логирование для отладки
console.log('🚀 Starting Loginus UI application...');
console.log('Root element:', rootElement);

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <ClientProvider>
            <LanguageProvider>
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </LanguageProvider>
          </ClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✅ Application rendered successfully');
} catch (error) {
  console.error('❌ Failed to render application:', error);
  throw error;
}

