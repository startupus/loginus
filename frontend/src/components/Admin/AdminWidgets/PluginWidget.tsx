import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../design-system/primitives/Icon';
import { themeClasses } from '../../../design-system/utils/themeClasses';

export interface PluginWidgetProps {
  widgetId: string;
  title: string;
  description?: string;
  uiType?: string;
  manifest?: any;
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
  title,
  description,
  uiType,
  manifest,
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
          {uiType === 'iframe' && manifest?.ui?.entryFile ? (
            <iframe
              src={manifest.ui.entryFile}
              className="w-full h-64 border-0 rounded-lg"
              title={title}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : uiType === 'embedded' && manifest?.ui?.entryFile ? (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <Icon name="package" size="xl" className="text-primary mx-auto mb-2" />
                <p className={themeClasses.text.secondary}>
                  {t('admin.widgets.plugin.embedded', 'Встроенное приложение')}
                </p>
                <p className={`text-xs ${themeClasses.text.secondary} mt-1`}>
                  {manifest.ui.entryFile}
                </p>
              </div>
            </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

