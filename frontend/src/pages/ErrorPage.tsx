import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
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
        return 'text-info';
      case '403':
        return 'text-warning';
      case '500':
        return 'text-error';
      case '401':
        return 'text-warning';
      case '503':
        return 'text-info';
      default:
        return 'text-error';
    }
  };

  const handleGoHome = () => {
    navigate(buildPathWithLang('/', currentLang));
  };

  const handleReload = () => {
    window.location.reload();
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
        <div className="bg-background dark:bg-surface rounded-2xl shadow-lg dark:shadow-card p-8 sm:p-12 text-center">
          {/* Иконка ошибки */}
          <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-1 dark:bg-gray-2`}>
            <Icon 
              name={getErrorIcon()} 
              size="xl" 
              className={getErrorColor()}
            />
          </div>

          {/* Заголовок */}
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            {errorType !== 'generic' && (
              <span className="text-5xl sm:text-6xl font-extrabold text-primary mr-3">
                {errorType === '404' ? '404' : errorType === '403' ? '403' : errorType === '500' ? '500' : errorType === '401' ? '401' : '503'}
              </span>
            )}
            {errorTitle}
          </h1>

          {/* Описание */}
          <p className="text-lg text-text-secondary mb-6 max-w-md mx-auto">
            {errorDescription}
          </p>

          {/* Детали ошибки - всегда показываем суть ошибки */}
          {errorMessage && (
            <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="alert-circle" size="sm" color="rgb(var(--color-error))" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-error mb-1">
                    {t('errors.technicalDetails', 'Технические детали')}:
                  </p>
                  <p className="text-sm font-mono text-text-primary break-words whitespace-pre-wrap">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки действий - только 2 кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {errorType === '401' ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(buildPathWithLang('/auth', currentLang))}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {t('common.login', 'Войти')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoHome}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {t('errors.goHome', 'На главную')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGoHome}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {t('errors.goHome', 'На главную')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReload}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {t('errors.reload', 'Обновить')}
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ErrorPage;

