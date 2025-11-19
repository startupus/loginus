import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';

export interface MailWidgetProps {
  unreadCount: number;
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
 * MailWidget - виджет почты
 */
export const MailWidget: React.FC<MailWidgetProps> = ({
  unreadCount,
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
  
  const getUnreadText = () => {
    if (unreadCount === 0) {
      return t('dashboard.mail.noUnread', 'Нет непрочитанных');
    } else if (unreadCount === 1) {
      return t('dashboard.mail.unreadOne', 'непрочитанное письмо');
    } else if (unreadCount < 5) {
      return t('dashboard.mail.unreadFew', 'непрочитанных письма');
    } else {
      return t('dashboard.mail.unreadMany', 'непрочитанных писем');
    }
  };
  
  return (
    <WidgetCard
      title={t('dashboard.mail.title', 'Почта')}
      icon={<Icon name="mail" size="lg" className="text-primary" />}
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
        <Link to="/mail">
          <Button variant="ghost" size="sm">
            <Icon name="arrow-right" size="sm" />
          </Button>
        </Link>
      }
    >
      <div className="flex items-center justify-between">
        <div className="transition-transform duration-300 group-hover:scale-105">
          <p className="text-3xl font-bold text-dark dark:text-white mb-1 transition-colors duration-200 group-hover:text-primary">
            {unreadCount > 0 ? unreadCount.toLocaleString('ru-RU') : '0'}
          </p>
          <p className="text-sm text-body-color dark:text-dark-6">
            {getUnreadText()}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-125">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
          </div>
        )}
      </div>
    </WidgetCard>
  );
};

