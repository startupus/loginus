import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '../design-system/primitives';
import { Logo } from '../design-system/primitives/Logo';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';

/**
 * ErrorPage - стилизованная страница ошибок для React Router
 * Поддерживает различные типы ошибок: 404, 403, 500, и другие
 */
export const ErrorPage: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const currentLang = useCurrentLanguage() || 'ru';

  // Определяем тип ошибки
  let errorType: '404' | '403' | '500' | '401' | '503' | 'generic' = 'generic';
  let errorTitle = t('errors.somethingWentWrong', 'Что-то пошло не так');
  let errorDescription = t('errors.unexpectedError', 'Произошла непредвиденная ошибка');
  let errorMessage = '';

  if (isRouteErrorResponse(error)) {
    // Ошибка маршрутизации (404, 403, и т.д.)
    const status = error.status;
    if (status === 404) {
      errorType = '404';
      errorTitle = t('errors.404Title', 'Страница не найдена');
      errorDescription = t('errors.404Description', 'Запрашиваемая страница не существует или была удалена');
    } else if (status === 403) {
      errorType = '403';
      errorTitle = t('errors.403Title', 'Доступ запрещен');
      errorDescription = t('errors.403Description', 'У вас нет прав для просмотра этой страницы');
    } else if (status === 500) {
      errorType = '500';
      errorTitle = t('errors.500Title', 'Ошибка сервера');
      errorDescription = t('errors.500Description', 'Что-то пошло не так. Мы уже работаем над исправлением.');
    } else if (status === 401) {
      errorType = '401';
      errorTitle = t('errors.401Title', 'Требуется авторизация');
      errorDescription = t('errors.401Description', 'Для доступа к этой странице необходимо войти в систему');
    } else if (status === 503) {
      errorType = '503';
      errorTitle = t('errors.503Title', 'Сервис временно недоступен');
      errorDescription = t('errors.503Description', 'Проводятся технические работы. Скоро все заработает.');
    }
    errorMessage = error.statusText || error.data?.message || '';
  } else if (error instanceof Error) {
    // Обычная ошибка JavaScript
    errorMessage = error.message;
    // Пытаемся определить тип ошибки по сообщению
    if (error.message.includes('404') || error.message.includes('not found')) {
      errorType = '404';
      errorTitle = t('errors.404Title', 'Страница не найдена');
      errorDescription = t('errors.404Description', 'Запрашиваемая страница не существует или была удалена');
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      errorType = '403';
      errorTitle = t('errors.403Title', 'Доступ запрещен');
      errorDescription = t('errors.403Description', 'У вас нет прав для просмотра этой страницы');
    } else if (error.message.includes('500') || error.message.includes('server')) {
      errorType = '500';
      errorTitle = t('errors.500Title', 'Ошибка сервера');
      errorDescription = t('errors.500Description', 'Что-то пошло не так. Мы уже работаем над исправлением.');
    }
  }

  // Иконки для разных типов ошибок
  const getErrorIcon = () => {
    switch (errorType) {
      case '404':
        return 'alert-circle';
      case '403':
        return 'shield';
      case '500':
        return 'alert-circle';
      case '401':
        return 'lock';
      case '503':
        return 'alert-circle';
      default:
        return 'alert-circle';
    }
  };

  // Цвета для разных типов ошибок
  const getErrorColor = () => {
    switch (errorType) {
      case '404':
        return 'text-blue-600 dark:text-blue-400';
      case '403':
        return 'text-orange-600 dark:text-orange-400';
      case '500':
        return 'text-red-600 dark:text-red-400';
      case '401':
        return 'text-yellow-600 dark:text-yellow-400';
      case '503':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-error dark:text-error-400';
    }
  };

  const handleGoHome = () => {
    navigate(buildPathWithLang('/', currentLang));
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-1 dark:bg-dark px-4">
      <div className="max-w-2xl w-full">
        {/* Header с логотипом */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={true} />
          </div>
        </div>

        {/* Основной блок ошибки */}
        <div className="bg-white dark:bg-dark-2 rounded-2xl shadow-lg dark:shadow-card p-8 sm:p-12 text-center">
          {/* Иконка ошибки */}
          <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-3`}>
            <Icon 
              name={getErrorIcon()} 
              size="xl" 
              className={getErrorColor()}
            />
          </div>

          {/* Заголовок */}
          <h1 className="text-3xl sm:text-4xl font-bold text-dark dark:text-white mb-4">
            {errorType !== 'generic' && (
              <span className="text-5xl sm:text-6xl font-extrabold text-primary mr-3">
                {errorType === '404' ? '404' : errorType === '403' ? '403' : errorType === '500' ? '500' : errorType === '401' ? '401' : '503'}
              </span>
            )}
            {errorTitle}
          </h1>

          {/* Описание */}
          <p className="text-lg text-body-color dark:text-dark-6 mb-6 max-w-md mx-auto">
            {errorDescription}
          </p>

          {/* Детали ошибки (только в dev режиме или для определенных типов) */}
          {errorMessage && (import.meta.env.DEV || errorType === 'generic') && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-dark-3 rounded-lg text-left">
              <p className="text-sm font-mono text-body-color dark:text-dark-6 break-all">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {errorType === '401' ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(buildPathWithLang('/auth', currentLang))}
                className="w-full sm:w-auto"
              >
                {t('common.login', 'Войти')}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGoHome}
                  className="w-full sm:w-auto"
                >
                  <Icon name="home" size="sm" className="mr-2" />
                  {t('errors.goHome', 'Вернуться на главную')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoBack}
                  className="w-full sm:w-auto"
                >
                  <Icon name="arrow-left" size="sm" className="mr-2" />
                  {t('common.back', 'Назад')}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={handleReload}
              className="w-full sm:w-auto"
            >
              <Icon name="refresh-cw" size="sm" className="mr-2" />
              {t('errors.reload', 'Обновить страницу')}
            </Button>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 text-center">
          <p className="text-sm text-body-color dark:text-dark-6">
            {t('errors.helpText', 'Если проблема сохраняется, обратитесь в службу поддержки')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

