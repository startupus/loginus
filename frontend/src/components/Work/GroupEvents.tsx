import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface GroupEvent {
  id: string;
  type: 'member_joined' | 'member_left' | 'role_changed' | 'task_created' | 'task_completed' | 'other';
  title: string;
  description?: string;
  date: string;
  groupId: string;
  groupName?: string;
}

export interface GroupEventsProps {
  events: GroupEvent[];
  groupId?: string;
}

/**
 * GroupEvents - компонент для отображения событий и уведомлений группы
 */
export const GroupEvents: React.FC<GroupEventsProps> = ({
  events = [],
  groupId,
}) => {
  const { t } = useTranslation();

  const filteredEvents = groupId 
    ? events.filter(e => e.groupId === groupId)
    : events;

  const displayedEvents = filteredEvents.slice(0, 10);

  const getEventIcon = (type: GroupEvent['type']) => {
    const icons: Record<GroupEvent['type'], string> = {
      member_joined: 'user-plus',
      member_left: 'user-minus',
      role_changed: 'settings',
      task_created: 'file-plus',
      task_completed: 'check-circle',
      other: 'bell',
    };
    return icons[type] || 'bell';
  };

  const getEventColor = (type: GroupEvent['type']) => {
    const colors: Record<GroupEvent['type'], string> = {
      member_joined: 'text-success',
      member_left: 'text-error',
      role_changed: 'text-warning',
      task_created: 'text-primary',
      task_completed: 'text-success',
      other: 'text-text-secondary',
    };
    return colors[type] || 'text-text-secondary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return t('common.today', 'Сегодня');
    } else if (days === 1) {
      return t('common.yesterday', 'Вчера');
    } else if (days < 7) {
      return t('common.daysAgo', `${days} дн. назад`, { count: days });
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <DataSection
      id="group-events"
      title={t('work.events.title', 'События и уведомления')}
      description={t('work.events.description', 'Последние события в ваших группах')}
    >
      {displayedEvents.length > 0 ? (
        <div className="space-y-2">
          {displayedEvents.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${themeClasses.card.gridItem} ${themeClasses.card.gridItemHover} transition-all duration-200 group`}
            >
              {/* Иконка события */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 ${getEventColor(event.type)}`}>
                <Icon 
                  name={getEventIcon(event.type)} 
                  size="sm"
                />
              </div>
              
              {/* Контент */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                        {event.description}
                      </p>
                    )}
                    {event.groupName && (
                      <p className="text-xs text-text-secondary mt-1">
                        {event.groupName}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                    {formatDate(event.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${themeClasses.card.gridItemIcon} flex items-center justify-center`}>
            <Icon name="bell" size="lg" className="text-text-secondary" />
          </div>
          <p className="text-sm text-text-secondary">
            {t('work.events.empty', 'Нет новых событий')}
          </p>
        </div>
      )}
    </DataSection>
  );
};

