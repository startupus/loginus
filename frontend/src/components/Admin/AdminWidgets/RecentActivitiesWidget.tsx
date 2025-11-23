import React, { useMemo, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { preloadModule } from '../../../services/i18n/config';
import { Icon } from '../../../design-system/primitives';
import { WidgetCard } from '../../../design-system/composites/WidgetCard';
import { Avatar } from '../../../design-system/primitives/Avatar';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { useCurrentLanguage } from '../../../utils/routing';
import { formatRelativeTimeWithT } from '../../../utils/intl/formatters';

export interface Activity {
  id: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  relativeTime: string;
}

export interface RecentActivitiesWidgetProps {
  activities?: Activity[];
  widgetId?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, widgetId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, widgetId: string) => void;
  onRemove?: (widgetId: string) => void;
  isDragOver?: boolean;
  insertPosition?: 'before' | 'after' | null;
  isDragging?: boolean;
}

/**
 * RecentActivitiesWidget - виджет последних активностей
 * Структура данных из TailAdmin SaaS Dashboard
 */
export const RecentActivitiesWidget: React.FC<RecentActivitiesWidgetProps> = ({
  activities = [
    {
      id: '1',
      userName: 'Francisco Grbbs',
      action: 'created invoice',
      details: 'PQ-4491C',
      timestamp: new Date().toISOString(),
      relativeTime: 'Just Now',
    },
    {
      id: '2',
      userName: 'Courtney Henry',
      action: 'created invoice',
      details: 'HK-234G',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      relativeTime: '15 minutes ago',
    },
    {
      id: '3',
      userName: 'Bessie Cooper',
      action: 'created invoice',
      details: 'LH-2891C',
      timestamp: new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      relativeTime: '5 months ago',
    },
    {
      id: '4',
      userName: 'Theresa Web',
      action: 'created invoice',
      details: 'CK-125NH',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      relativeTime: '2 weeks ago',
    },
  ],
  widgetId,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  isDragOver,
  insertPosition,
  isDragging,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = useCurrentLanguage();
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Предзагружаем модуль admin для переводов - как в AdminSidebar
  // Модуль должен быть уже загружен в AdminPageTemplate, но на всякий случай предзагружаем
  useEffect(() => {
    preloadModule('admin').then(() => {
      // Принудительно перерисовываем после загрузки модуля
      forceUpdate();
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[i18n] Failed to preload admin module in RecentActivitiesWidget:', error);
      }
    });
  }, []);

  // Перезагружаем модуль при смене языка - как в OverviewMetricsWidget
  useEffect(() => {
    const handleLanguageChanged = async () => {
      try {
        await preloadModule('admin');
        forceUpdate();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[i18n] Failed to reload admin module on language change:', error);
        }
      }
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const displayedActivities = activities.slice(0, 4);

  // Используем useMemo для реактивности переводов при смене языка
  // С fallback значениями как в OverviewMetricsWidget для надежности
  // Пересчитываем при изменении языка
  const widgetTitle = useMemo(() => t('admin.widgets.activities.title', currentLang === 'ru' ? 'Активности' : 'Activities'), [t, i18n.language, currentLang]);
  const viewAllLabel = useMemo(() => t('admin.widgets.activities.viewAll', currentLang === 'ru' ? 'Показать все' : 'View All'), [t, i18n.language, currentLang]);

  // Функция для перевода действия
  const getActionLabel = (action: string) => {
    // Маппинг действий на ключи переводов
    const actionMap: Record<string, string> = {
      'created invoice': 'admin.widgets.activities.actions.createdInvoice',
      'updated invoice': 'admin.widgets.activities.actions.updatedInvoice',
      'deleted invoice': 'admin.widgets.activities.actions.deletedInvoice',
      'created user': 'admin.widgets.activities.actions.createdUser',
      'updated user': 'admin.widgets.activities.actions.updatedUser',
      'deleted user': 'admin.widgets.activities.actions.deletedUser',
      'created company': 'admin.widgets.activities.actions.createdCompany',
      'updated company': 'admin.widgets.activities.actions.updatedCompany',
      'deleted company': 'admin.widgets.activities.actions.deletedCompany',
    };
    
    const translationKey = actionMap[action.toLowerCase()];
    if (translationKey) {
      // Без fallback значения - перевод должен быть в файлах локализации
      return t(translationKey);
    }
    // Если действие не найдено в маппинге, возвращаем как есть (должно быть редко)
    return action;
  };

  // Функция для форматирования относительного времени
  const formatActivityTime = (timestamp: string, relativeTime: string) => {
    try {
      return formatRelativeTimeWithT(timestamp, t, currentLang, 'admin.widgets.activities');
    } catch {
      // Fallback на переведенный relativeTime если есть (без хардкода)
      const relativeTimeMap: Record<string, string> = {
        'Just Now': t('admin.widgets.activities.relativeTime.justNow'),
        '15 minutes ago': t('admin.widgets.activities.relativeTime.minutesAgo', { count: 15 }),
        '5 months ago': t('admin.widgets.activities.relativeTime.monthsAgo', { count: 5 }),
        '2 weeks ago': t('admin.widgets.activities.relativeTime.weeksAgo', { count: 2 }),
      };
      return relativeTimeMap[relativeTime] || relativeTime;
    }
  };

  return (
    <WidgetCard
      title={widgetTitle}
      icon={<Icon name="activity" size="lg" color="rgb(var(--color-primary))" />}
      widgetId={widgetId}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onRemove={onRemove}
      isDragOver={isDragOver}
      insertPosition={insertPosition}
      isDragging={isDragging}
      actions={
        <button
          className="text-sm text-primary hover:underline"
          aria-label={viewAllLabel}
        >
          {viewAllLabel}
        </button>
      }
    >
      <div className="space-y-4">
        {displayedActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar
              name={activity.userName}
              size="sm"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium ${themeClasses.text.primary}`}>
                  {activity.userName}
                </span>
                <span className={themeClasses.text.secondary}>
                  {getActionLabel(activity.action)}
                </span>
                <span className={`font-medium ${themeClasses.text.primary}`}>
                  {activity.details}
                </span>
              </div>
              <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
                {formatActivityTime(activity.timestamp, activity.relativeTime)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

