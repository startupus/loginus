import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { useTranslation } from 'react-i18next';

/**
 * IframePage - страница для отображения кастомных iframe
 * Получает URL или код iframe из query параметров
 */
const IframePage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeUrl = searchParams.get('url');
  const iframeCode = searchParams.get('code');

  useEffect(() => {
    // Если передан код, вставляем его в iframe
    if (iframeCode && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(iframeCode);
        doc.close();
      }
    }
  }, [iframeCode]);

  if (!iframeUrl && !iframeCode) {
    return (
      <PageTemplate title={t('iframe.error.title', 'Ошибка')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-text-secondary">
              {t('iframe.error.noContent', 'Не указан URL или код для отображения')}
            </p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={t('iframe.title', 'Встроенный контент')} showSidebar={true}>
      <div className="w-full h-[calc(100vh-200px)]">
        <iframe
          ref={iframeRef}
          src={iframeUrl || undefined}
          className="w-full h-full border-0 rounded-lg"
          title={t('iframe.title', 'Встроенный контент')}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </PageTemplate>
  );
};

export default IframePage;

