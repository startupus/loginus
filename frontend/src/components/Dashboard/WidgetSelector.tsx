import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives';

export interface AvailableWidget {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: AvailableWidget[];
  onToggleWidget: (widgetId: string) => void;
}

/**
 * WidgetSelector - правая панель для выбора виджетов
 */
export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  isOpen,
  onClose,
  availableWidgets,
  onToggleWidget,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleToggle = (widgetId: string) => {
    onToggleWidget(widgetId);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-[400px] bg-white dark:bg-dark-2 shadow-card-2 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-3">
            <h2 className="text-xl font-bold text-text-primary">
              {t('dashboard.widgets.title', 'Добавить виджет')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-1 dark:hover:bg-gray-2 transition-colors"
              aria-label={t('common.close', 'Закрыть')}
            >
              <Icon name="close" size="md" className="text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {availableWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border dark:border-dark-3 bg-background dark:bg-dark-3 hover:border-primary dark:hover:border-primary/50 transition-colors"
                >
                  {/* Иконка */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <Icon name={widget.icon} size="md" className="text-primary" />
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary mb-1">
                      {widget.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {widget.description}
                    </p>
                  </div>

                  {/* Переключатель */}
                  <button
                    onClick={() => handleToggle(widget.id)}
                    className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                      widget.enabled
                        ? 'bg-primary'
                        : 'bg-gray-3 dark:bg-gray-2'
                    }`}
                    aria-label={widget.enabled ? t('common.disable', 'Отключить') : t('common.enable', 'Включить')}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        widget.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

