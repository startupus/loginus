import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { useTranslation } from 'react-i18next';

/**
 * EmbeddedAppPage - страница для встроенных приложений (как Telegram Apps)
 * Отображает внешнее приложение в iframe с полной высотой
 */
const EmbeddedAppPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const appUrl = searchParams.get('url');

  if (!appUrl) {
    return (
      <PageTemplate title={t('embedded.error.title', 'Ошибка')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-text-secondary">
              {t('embedded.error.noUrl', 'Не указан URL приложения')}
            </p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('embedded.title', 'Встроенное приложение')} 
      showSidebar={true}
      contentClassName="p-0"
    >
      <div className="w-full h-[calc(100vh-120px)]">
        <iframe
          src={appUrl}
          className="w-full h-full border-0"
          title={t('embedded.title', 'Встроенное приложение')}
          allow="camera; microphone; geolocation; payment; encrypted-media"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
        />
      </div>
    </PageTemplate>
  );
};

export default EmbeddedAppPage;

