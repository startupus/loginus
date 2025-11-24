import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Badge } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useCurrentLanguage } from '../../utils/routing';
import { formatRelativeTimeWithT } from '../../utils/intl/formatters';

export interface Event {
  id: string;
  type: 'course_paid' | 'achievement' | 'milestone' | 'reward' | 'other';
  title: string;
  description?: string;
  date: string;
  icon?: string;
  color?: string;
  titleKey?: string;
  descriptionKey?: string;
}

export interface EventsWidgetProps {
  events: Event[];
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
 * EventsWidget - виджет событий
 * Показывает последние события: оплачен курс, ребенок получил достижение и т.д.
 */
export const EventsWidget: React.FC<EventsWidgetProps> = ({ 
  events = [],
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
  const currentLang = useCurrentLanguage();

  const displayedEvents = events.slice(0, 5);

  const getEventTitle = (event: Event) => {
    const key =
      (event as any).titleKey ||
      (event.type ? `dashboard.events.items.${event.type}` : undefined);

    if (key) {
      return t(key, { defaultValue: event.title });
    }
    return event.title;
  };

  return (
    <WidgetCard
      title={
        <div className="flex items-center gap-2">
          <span className={`text-xl font-semibold ${themeClasses.text.primary} sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]`}>
            {t('dashboard.events.title', { defaultValue: 'Events' })}
          </span>
          {displayedEvents.length > 0 && (
            <Badge variant="primary" size="sm">
              {events.length}
            </Badge>
          )}
        </div>
      }
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
    >
      {displayedEvents.length > 0 ? (
        <div className="space-y-2">
          {displayedEvents.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-2 p-2 rounded-lg ${themeClasses.card.gridItem} ${themeClasses.card.gridItemHover} transition-all duration-200 group`}
            >
              {/* Дата */}
              <div className={`flex-shrink-0 w-12 text-xs ${themeClasses.text.secondary} text-center pt-0.5`}>
                {formatRelativeTimeWithT(event.date, t, currentLang)}
              </div>
              
              {/* Контент */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${themeClasses.text.primary} group-hover:text-primary transition-colors line-clamp-2`}>
                  {getEventTitle(event)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${themeClasses.card.gridItemIcon} flex items-center justify-center`}>
            <Icon name="bell" size="lg" className={themeClasses.text.secondary} />
          </div>
          <p className={`text-sm ${themeClasses.text.secondary}`}>
            {t('dashboard.events.empty', { defaultValue: 'No new events' })}
          </p>
        </div>
      )}
    </WidgetCard>
  );
};

