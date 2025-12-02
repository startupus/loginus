import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store';
import { themeClasses } from '../../design-system/utils/themeClasses';

/**
 * Страница обработки Telegram Login Widget
 * Показывает Telegram Login Widget и обрабатывает callback
 */
export const TelegramLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const processingRef = useRef(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Инициализация Telegram Login Widget
    const initTelegramWidget = async () => {
      // Ждем, пока ref будет привязан к DOM (может потребоваться несколько попыток)
      let attempts = 0;
      const maxAttempts = 20; // Максимум 2 секунды (20 * 100ms)
      
      const checkAndInit = async () => {
        if (!widgetRef.current) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`[TelegramLoginPage] Waiting for widgetRef (attempt ${attempts}/${maxAttempts})...`);
            setTimeout(checkAndInit, 100);
            return;
          } else {
            console.error('[TelegramLoginPage] widgetRef.current is still null after all attempts');
            setError('Не удалось инициализировать виджет. Попробуйте обновить страницу.');
            setLoading(false);
            return;
          }
        }
        
        // Ref привязан, продолжаем инициализацию
        console.log('[TelegramLoginPage] widgetRef is ready, initializing widget...');

        // Очищаем предыдущий виджет, если он был
        widgetRef.current.innerHTML = '';

        // Получаем bot username из переменных окружения или с бэкенда
        let botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
        
        console.log('[TelegramLoginPage] Initial bot username from env:', botUsername);
        
        // Если не задан в переменных окружения, пытаемся получить с бэкенда
        if (!botUsername) {
          try {
            const configResponse = await apiClient.get('/micro-modules/telegram-auth/config');
            console.log('[TelegramLoginPage] Full config response:', configResponse.data);
            // Ответ имеет структуру: {success: true, data: {botUsername: "..."}} или {botUsername: "..."}
            const configData = configResponse.data?.data || configResponse.data;
            botUsername = configData?.botUsername;
            console.log('[TelegramLoginPage] Bot username from backend:', botUsername);
          } catch (error) {
            console.warn('[TelegramLoginPage] Failed to get bot username from backend:', error);
            setError('Не удалось получить конфигурацию Telegram бота. Проверьте подключение к серверу.');
            setLoading(false);
            return;
          }
        }
        
        // Если все еще не задан, показываем ошибку
        if (!botUsername || botUsername === 'your_bot_username') {
          setError('Telegram Bot Username не настроен. Пожалуйста, настройте VITE_TELEGRAM_BOT_USERNAME или TELEGRAM_BOT_USERNAME на бэкенде.');
          setLoading(false);
          console.error('[TelegramLoginPage] Telegram bot username not configured');
          return;
        }
        
        console.log('[TelegramLoginPage] Using bot username:', botUsername);
        
        // Проверяем, что ref все еще существует
        if (!widgetRef.current) {
          console.error('[TelegramLoginPage] widgetRef.current became null during initialization');
          setError('Ошибка инициализации виджета. Попробуйте обновить страницу.');
          setLoading(false);
          return;
        }
        
        // Создаем скрипт для Telegram Login Widget
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botUsername);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;
        
        // Обработка ошибок загрузки скрипта
        script.onerror = () => {
          console.error('[TelegramLoginPage] Failed to load Telegram widget script');
          setError('Не удалось загрузить Telegram Login Widget. Проверьте подключение к интернету.');
          setLoading(false);
        };
        
        script.onload = () => {
          console.log('[TelegramLoginPage] Telegram widget script loaded successfully');
          setLoading(false);
        };
        
        widgetRef.current.appendChild(script);

        // Глобальная функция для обработки callback от Telegram
        (window as any).onTelegramAuth = async (telegramUser: any) => {
          if (processingRef.current) {
            console.log('[TelegramLoginPage] Already processing, skipping...');
            return;
          }

          processingRef.current = true;
          setLoading(true);
          setError(null);

          try {
            console.log('[TelegramLoginPage] Processing Telegram callback:', telegramUser);
            
            // Отправляем данные на бэкенд
            const response = await apiClient.post('/auth/multi/telegram-login', {
              telegramUser,
            });

            console.log('[TelegramLoginPage] Telegram login response:', response.data);

            const data = response.data?.data || response.data;
            
            if (data.accessToken && data.refreshToken && data.user) {
              // ✅ ИСПРАВЛЕНИЕ: Правильно преобразуем данные пользователя перед сохранением
              const userName = data.user.name || 
                `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || 
                data.user.email || 
                'User';
              
              // Сохраняем токены и пользователя с полными данными
              login(
                {
                  id: data.user.id,
                  name: userName,
                  email: data.user.email || '',
                  phone: data.user.phone || '',
                  avatar: data.user.avatar || undefined,
                  githubEmail: data.user.githubEmail || null,
                  telegramPhone: data.user.telegramPhone || null,
                  role: (data.user.role as any) || 'user',
                  companyId: data.user.companyId || null,
                  permissions: data.user.permissions || [],
                },
                data.accessToken,
                data.refreshToken
              );
              
              // Редиректим на dashboard
              console.log('[TelegramLoginPage] Redirecting to dashboard');
              navigate('/ru/dashboard', { replace: true });
            } else if (data.oauthFlow && data.returnTo) {
              // Это OAuth flow для внешнего сервиса
              console.log('[TelegramLoginPage] OAuth flow detected, redirecting to:', data.returnTo);
              window.location.href = data.returnTo;
            } else if (data.requiresNFA) {
              // Требуется nFA (multi-factor authentication)
              console.log('[TelegramLoginPage] nFA required, redirecting to verify code page');
              navigate(`/ru/auth/verify-code?userId=${data.userId}&methods=${data.methods.join(',')}`, { replace: true });
            } else {
              setError('Не удалось получить данные пользователя');
              setLoading(false);
            }
          } catch (error: any) {
            console.error('[TelegramLoginPage] Error processing Telegram callback:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Ошибка при авторизации через Telegram';
            setError(errorMessage);
            setLoading(false);
          } finally {
            processingRef.current = false;
          }
        };
      };
      
      // Начинаем проверку и инициализацию
      checkAndInit();
    };

    // Инициализируем виджет с небольшой задержкой, чтобы ref успел привязаться
    const timer = setTimeout(() => {
      initTelegramWidget();
    }, 100);

    return () => {
      // Очищаем таймер, если он был установлен
      if (timer) {
        clearTimeout(timer);
      }
      // Очищаем глобальную функцию при размонтировании
      delete (window as any).onTelegramAuth;
      // Очищаем виджет, если он был создан
      if (widgetRef.current) {
        widgetRef.current.innerHTML = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className={`flex items-center justify-center min-h-screen ${themeClasses.background.default}`}>
      <div className="text-center max-w-md p-8 relative">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className={themeClasses.text.secondary}>Загрузка Telegram Login Widget...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <>
            <h1 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>Ошибка авторизации</h1>
            <p className={`mb-6 ${themeClasses.text.secondary}`}>{error}</p>
            <button
              onClick={() => navigate('/ru/auth', { replace: true })}
              className={`px-6 py-2 rounded-lg ${themeClasses.button.primary}`}
            >
              Вернуться к входу
            </button>
          </>
        ) : (
          <>
            <h1 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>
              Вход через Telegram
            </h1>
            <p className={`mb-6 ${themeClasses.text.secondary}`}>
              Нажмите на кнопку ниже, чтобы войти через Telegram
            </p>
            <div ref={widgetRef} className="flex justify-center mb-6 min-h-[50px]">
            </div>
            <button
              onClick={() => navigate('/ru/auth', { replace: true })}
              className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
            >
              Вернуться к входу
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TelegramLoginPage;

