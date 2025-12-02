import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../design-system/primitives/Icon';
import { themeClasses } from '../../../design-system/utils/themeClasses';

export interface PluginWidgetProps {
  widgetId: string;
  slug?: string;
  title: string;
  description?: string;
  uiType?: string;
  manifest?: any;
  config?: any; // Добавляем config для доступа к baseUrl
  icon?: string;
  onRemove?: (widgetId: string) => void;
  onDragStart?: (e: React.DragEvent, widgetId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, widgetId: string) => void;
  onDrop?: (e: React.DragEvent, widgetId: string) => void;
  isDragging?: boolean;
  dragOverPosition?: 'before' | 'after' | null;
}

/**
 * PluginWidget - универсальный виджет для отображения плагинов
 * Поддерживает iframe и встроенные приложения
 */
export const PluginWidget: React.FC<PluginWidgetProps> = ({
  widgetId,
  slug,
  title,
  description,
  uiType,
  manifest,
  config,
  icon,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  dragOverPosition,
}) => {
  const { t } = useTranslation();
  const [iframeHeight, setIframeHeight] = React.useState<number | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Слушаем сообщения от iframe о размере содержимого
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Проверяем что сообщение от нашего iframe
      // Может быть widgetId или slug
      const isOurWidget = event.data.type === 'WIDGET_RESIZE' && (
        event.data.widgetId === widgetId || 
        event.data.widgetId === slug ||
        event.data.widgetId === manifest?.name ||
        (slug && event.data.widgetId?.includes(slug))
      );
      
      if (isOurWidget) {
        const height = event.data.height;
        if (height && height > 0) {
          setIframeHeight(height);
          if (process.env.NODE_ENV === 'development') {
            console.log('[PluginWidget] Resize received:', { widgetId, slug, height });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [widgetId, slug, manifest]);

  return (
    <div
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, widgetId)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver?.(e, widgetId)}
      onDrop={(e) => onDrop?.(e, widgetId)}
    >
      {/* Insert position indicator */}
      {dragOverPosition === 'before' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-full -translate-y-2 z-10"></div>
      )}
      {dragOverPosition === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full translate-y-2 z-10"></div>
      )}

      <div className={`${themeClasses.card.rounded} ${themeClasses.border.default} ${themeClasses.background.surface} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {onDragStart && (
              <button
                className="cursor-grab active:cursor-grabbing touch-none"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Icon name="grip-vertical" size="sm" className={themeClasses.text.secondary} />
              </button>
            )}
            {icon && <Icon name={icon} size="md" className="text-primary" />}
            <h3 className={`text-lg font-medium ${themeClasses.text.primary}`}>{title}</h3>
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(widgetId)}
              className={`p-2 rounded-lg ${themeClasses.list.itemHover} transition-colors`}
              aria-label={t('common.remove', 'Удалить')}
            >
              <Icon name="close" size="sm" className={themeClasses.text.secondary} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {(() => {
            // Формируем правильный URL для виджета
            const getWidgetUrl = () => {
              // Если есть полный URL в manifest.ui.entryFile, используем его
              if (manifest?.ui?.entryFile && manifest.ui.entryFile.startsWith('http')) {
                return manifest.ui.entryFile;
              }
              
              // Используем baseUrl из config, если есть
              const baseUrl = config?.baseUrl || manifest?.config?.baseUrl || `/uploads/plugins/${slug}`;
              const entrypoint = manifest?.ui?.entryFile || manifest?.config?.entrypoint || 'index.html';
              
              // Если entrypoint уже содержит полный путь, используем его
              if (entrypoint.startsWith('http')) {
                return entrypoint;
              }
              
              // Если baseUrl уже содержит entrypoint, используем baseUrl
              if (baseUrl.includes(entrypoint)) {
                return baseUrl;
              }
              
              // Формируем путь: baseUrl/entrypoint
              return `${baseUrl}/${entrypoint}`.replace(/\/+/g, '/');
            };
            
            const widgetUrl = getWidgetUrl();
            
            return (uiType === 'iframe' || uiType === 'embedded') && widgetUrl ? (
              <iframe
                ref={iframeRef}
                src={widgetUrl}
                className="w-full border-0 rounded-lg"
                style={{ 
                  height: iframeHeight ? `${iframeHeight}px` : 'auto',
                  minHeight: '200px',
                  maxHeight: '600px',
                  overflow: 'hidden'
                }}
                title={title}
                sandbox="allow-scripts allow-same-origin"
                scrolling="no"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <Icon name="package" size="xl" className="text-primary mx-auto mb-2" />
                  <p className={themeClasses.text.primary}>{title}</p>
                  {description && (
                    <p className={`text-sm ${themeClasses.text.secondary} mt-2 max-w-md`}>
                      {description}
                    </p>
                  )}
                  <p className={`text-xs ${themeClasses.text.secondary} mt-4`}>
                    {t('admin.widgets.plugin.noUI', 'UI не настроен')}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

