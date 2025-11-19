import React from 'react';
import ReactDOM from 'react-dom/client';
import { RootProvider } from './providers/RootProvider';
import App from './App.tsx';
import './index.css';
import './services/i18n';

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
      <RootProvider>
                <App />
      </RootProvider>
    </React.StrictMode>
  );
  console.log('✅ Application rendered successfully');
} catch (error) {
  console.error('❌ Failed to render application:', error);
  throw error;
}

