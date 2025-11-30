import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store';
import { themeClasses } from '../../design-system/utils/themeClasses';

/**
 * Страница обработки GitHub OAuth callback
 * GitHub перенаправляет сюда после авторизации с параметром code
 */
export const GitHubLoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isProcessing = false; // ✅ Защита от повторных вызовов (React StrictMode)
    
    const handleGitHubCallback = async () => {
      if (isProcessing) {
        console.log('[GitHubLoginPage] Already processing, skipping...');
        return;
      }
      
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        setError('Код авторизации не получен от GitHub');
        setLoading(false);
        return;
      }

      isProcessing = true;
      
      try {
        console.log('[GitHubLoginPage] Processing GitHub callback with code:', code.substring(0, 10) + '...');
        
        // Вызываем backend endpoint для обработки callback (GET с query параметрами)
        const params = new URLSearchParams({ code });
        if (state) {
          params.append('state', state);
        }
        
        const response = await apiClient.get(`/auth/multi/oauth/github/callback?${params.toString()}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log('[GitHubLoginPage] GitHub callback response:', response.data);

        const data = response.data?.data || response.data;
        
        if (data.accessToken && data.refreshToken && data.user) {
          // Сохраняем токены и пользователя
          login(data.user, data.accessToken, data.refreshToken);
          
          // Редиректим на dashboard
          console.log('[GitHubLoginPage] Redirecting to dashboard');
          navigate('/ru/dashboard', { replace: true });
        } else if (data.oauthFlow && data.returnTo) {
          // Это OAuth flow для внешнего сервиса
          console.log('[GitHubLoginPage] OAuth flow detected, redirecting to:', data.returnTo);
          window.location.href = data.returnTo;
        } else {
          setError('Не удалось получить данные пользователя');
          setLoading(false);
        }
      } catch (error: any) {
        console.error('[GitHubLoginPage] Error processing GitHub callback:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Ошибка при авторизации через GitHub';
        setError(errorMessage);
        setLoading(false);
      } finally {
        isProcessing = false;
      }
    };

    handleGitHubCallback();
  }, [searchParams, navigate, login]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClasses.background.default}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={themeClasses.text.secondary}>Обработка авторизации через GitHub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClasses.background.default}`}>
        <div className="text-center max-w-md">
          <h1 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>Ошибка авторизации</h1>
          <p className={`mb-6 ${themeClasses.text.secondary}`}>{error}</p>
          <button
            onClick={() => navigate('/ru/auth', { replace: true })}
            className={`px-6 py-2 rounded-lg ${themeClasses.button.primary}`}
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GitHubLoginPage;

