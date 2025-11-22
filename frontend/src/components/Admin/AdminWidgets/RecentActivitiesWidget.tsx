import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../design-system/primitives';
import { WidgetCard } from '../../../design-system/composites/WidgetCard';
import { Avatar } from '../../../design-system/primitives/Avatar';
import { themeClasses } from '../../../design-system/utils/themeClasses';

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
  const { t } = useTranslation();

  const displayedActivities = activities.slice(0, 4);

  return (
    <WidgetCard
      title={t('admin.widgets.activities.title', 'Activities')}
      icon={<Icon name="activity" size="lg" className="text-primary" />}
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
          aria-label={t('admin.widgets.activities.viewAll', 'View All')}
        >
          {t('admin.widgets.activities.viewAll', 'View All')}
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
                  {activity.action}
                </span>
                <span className={`font-medium ${themeClasses.text.primary}`}>
                  {activity.details}
                </span>
              </div>
              <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
                {activity.relativeTime}
              </p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

