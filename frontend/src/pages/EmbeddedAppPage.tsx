import React, { useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { pluginsApi } from '@/services/api/plugins';
import { useCurrentLanguage } from '@/utils/routing';
import { themeClasses } from '../design-system/utils/themeClasses';

/**
 * EmbeddedAppPage - страница для встроенных приложений (как Telegram Apps).
 *
 * Варианты работы:
 * - Новый режим: /:lang/plugins/:slug — берём slug, вызываем POST /plugins/:slug/launch,
 *   получаем launchUrl + initData, открываем iframe и отправляем initData через postMessage.
 * - Старый режим (fallback): /:lang/embedded?url=... — просто открываем внешний URL в iframe.
 */
const EmbeddedAppPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const params = useParams<{ slug?: string }>();
  const location = useLocation();
  const currentLang = useCurrentLanguage();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const legacyUrl = searchParams.get('url');
  const slug = params.slug;

  const isLegacyMode = !slug && !!legacyUrl;

  const launchQuery = useQuery({
    queryKey: ['plugin-launch', slug, currentLang],
    queryFn: () =>
      pluginsApi.launchWebApp(slug!, {
        locale: currentLang,
        location: 'sidebar-main',
        extra: {
          pathname: location.pathname,
          search: location.search,
        },
      }),
    enabled: !!slug, // запрос только если есть slug
  });

  const launchData = useMemo(
    () => launchQuery.data?.data.data,
    [launchQuery.data],
  );

  const appUrl = isLegacyMode ? legacyUrl : launchData?.launchUrl;

  // Отправляем initData в iframe после загрузки (для режима web_app)
  useEffect(() => {
    if (!launchData?.initData || !appUrl) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const targetWindow = iframe.contentWindow;
        if (!targetWindow) return;

        let targetOrigin = '*';
        try {
          const url = new URL(appUrl, window.location.origin);
          targetOrigin = url.origin;
        } catch {
          // оставляем '*', если URL некорректен
        }

        targetWindow.postMessage(
          {
            type: 'loginus:init',
            initData: launchData.initData,
          },
          targetOrigin,
        );
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[EmbeddedAppPage] Failed to send initData via postMessage', error);
        }
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [launchData?.initData, appUrl]);

  // Обрабатываем сообщения от плагина (минимальный SDK-хост)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const { type } = event.data as { type?: string };

      switch (type) {
        case 'loginus:ready':
          // Плагин сообщил, что инициализировался
          if (process.env.NODE_ENV === 'development') {
            console.log('[EmbeddedAppPage] Plugin reported ready', event.origin);
          }
          break;
        case 'loginus:resize':
          // В будущем можно динамически менять высоту iframe
          break;
        case 'loginus:navigate':
          // Здесь можно реализовать навигацию хоста по запросу плагина
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!appUrl) {
    const errorKey = isLegacyMode
      ? 'embedded.error.noUrl'
      : 'embedded.error.noSlug';

    return (
      <PageTemplate title={t('embedded.error.title', 'Ошибка')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className={themeClasses.text.secondary}>
              {t(errorKey, 'Не удалось запустить встроенное приложение')}
            </p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  const isLoading = !isLegacyMode && launchQuery.isLoading;
  const hasError = !isLegacyMode && launchQuery.isError;

  return (
    <PageTemplate 
      title={t('embedded.title', 'Встроенное приложение')} 
      showSidebar={true}
      contentClassName="p-0"
    >
      <div className="w-full h-[calc(100vh-120px)] flex flex-col">
        {isLoading && (
          <div className="flex items-center justify-center flex-none h-12 text-sm text-text-secondary">
            {t('common.loading', 'Загрузка...')}
          </div>
        )}
        {hasError && (
          <div className="flex items-center justify-center flex-none h-12 text-sm text-error">
            {t('embedded.error.launchFailed', 'Не удалось запустить приложение')}
          </div>
        )}
        <div className="flex-1 min-h-0">
          <iframe
            ref={iframeRef}
            src={appUrl}
            className="w-full h-full border-0"
            title={t('embedded.title', 'Встроенное приложение')}
            allow="camera; microphone; geolocation; payment; encrypted-media"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default EmbeddedAppPage;

