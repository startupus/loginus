import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

/**
 * IframePage - страница для отображения кастомных iframe
 * Получает URL или код iframe из query параметров
 */
const IframePage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  const iframeUrl = searchParams.get('url');
  const iframeCode = searchParams.get('code');

  useEffect(() => {
    // Если передан код, вставляем его в iframe
    if (iframeCode && iframeRef.current) {
      const iframe = iframeRef.current;
      
      // Декодируем код из URL
      let decodedCode = '';
      try {
        decodedCode = decodeURIComponent(iframeCode);
        if (process.env.NODE_ENV === 'development') {
          console.log('[IframePage] Decoded iframeCode length:', decodedCode.length);
        }
      } catch (error) {
        console.error('[IframePage] Error decoding iframeCode:', error);
        decodedCode = iframeCode; // Используем как есть, если декодирование не удалось
      }
      
      // Функция для записи кода в iframe
      const writeCodeToIframe = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[IframePage] Writing code to iframe document');
            }
            doc.open();
            doc.write(decodedCode);
            doc.close();
            
            // Отправляем токен после записи кода
            setTimeout(() => {
              if (iframe.contentWindow && accessToken) {
                iframe.contentWindow.postMessage(
                  {
                    type: 'LOGINUS_AUTH_TOKEN',
                    token: accessToken,
                    timestamp: Date.now(),
                  },
                  '*'
                );
                if (process.env.NODE_ENV === 'development') {
                  console.log('[IframePage] Token sent to iframe with code via postMessage');
                }
              }
            }, 200);
          } else {
            console.error('[IframePage] Cannot access iframe document');
          }
        } catch (error) {
          console.error('[IframePage] Error writing code to iframe:', error);
        }
      };
      
      // Используем about:blank для возможности записи в iframe
      if (iframe.src !== 'about:blank') {
        // Устанавливаем about:blank и ждём загрузки
        const handleLoad = () => {
          writeCodeToIframe();
        };
        
        iframe.addEventListener('load', handleLoad, { once: true });
        iframe.src = 'about:blank';
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[IframePage] Set iframe src to about:blank, waiting for load');
        }
        
        return () => {
          iframe.removeEventListener('load', handleLoad);
        };
      } else {
        // Если уже about:blank, проверяем готовность и записываем
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          writeCodeToIframe();
        } else {
          const handleLoad = () => {
            writeCodeToIframe();
          };
          iframe.addEventListener('load', handleLoad, { once: true });
          return () => {
            iframe.removeEventListener('load', handleLoad);
          };
        }
      }
    }
  }, [iframeCode, accessToken]);

  // Передаём токен в iframe через postMessage (для iframeUrl)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframeUrl || iframeCode) return; // Пропускаем если есть код

    const handleLoad = () => {
      // Ждём немного чтобы iframe полностью загрузился
      setTimeout(() => {
        if (iframe.contentWindow && accessToken) {
          iframe.contentWindow.postMessage(
            {
              type: 'LOGINUS_AUTH_TOKEN',
              token: accessToken,
              timestamp: Date.now(),
            },
            '*'
          );
          if (process.env.NODE_ENV === 'development') {
            console.log('[IframePage] Token sent to iframe via postMessage');
          }
        }
      }, 500);
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [iframeUrl, accessToken, iframeCode]);

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

  // Определяем src для iframe
  const iframeSrc = useMemo(() => {
    if (iframeCode) {
      return 'about:blank'; // Для кода всегда используем about:blank
    }
    return iframeUrl || undefined;
  }, [iframeCode, iframeUrl]);

  return (
    <PageTemplate title={t('iframe.title', 'Встроенный контент')} showSidebar={true}>
      <div className="w-full h-[calc(100vh-200px)]">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full border-0 rounded-lg"
          title={t('iframe.title', 'Встроенный контент')}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </PageTemplate>
  );
};

export default IframePage;

