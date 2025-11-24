import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Badge } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { formatNumber } from '../../utils/intl/formatters';

export interface PlusWidgetProps {
  active: boolean;
  points: number;
  tasks: number;
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
 * PlusWidget - виджет Яндекс Плюс
 */
export const PlusWidget: React.FC<PlusWidgetProps> = ({
  active,
  points,
  tasks,
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
  
  return (
    <WidgetCard
      title={t('dashboard.plus.title', 'Яндекс Плюс')}
      icon={<Icon name="plus-coin" size="lg" className="text-primary" />}
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
        <Link to={buildPathWithLang('/plus', currentLang)}>
          <Button variant="ghost" size="sm">
            <Icon name="arrow-right" size="sm" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
              {t('dashboard.plus.status', 'Статус')}
            </p>
            {active ? (
              <Badge variant="success" size="sm" className="transition-all duration-200 group-hover:scale-105">
                {t('dashboard.plus.active', 'Активен')}
              </Badge>
            ) : (
              <Badge variant="secondary" size="sm" className="transition-all duration-200">
                {t('dashboard.plus.inactive', 'Неактивен')}
              </Badge>
            )}
          </div>
        </div>
        
        {active && (
          <>
            <div className={`flex items-center justify-between p-3 rounded-lg ${themeClasses.background.primarySemiTransparent} transition-all duration-200 ${themeClasses.background.primarySemiTransparentHover}`}>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                  {t('dashboard.plus.points', 'Баллы')}
                </p>
                <p className={`text-xl font-bold ${themeClasses.text.primary} transition-transform duration-200 group-hover:scale-105`}>
                  {formatNumber(points, currentLang)}
                </p>
              </div>
            </div>
            
            {tasks > 0 && (
              <div className={`flex items-center justify-between p-3 rounded-lg ${themeClasses.card.gridItem}`}>
                <div>
                  <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                    {t('dashboard.plus.tasks', 'Заданий')}
                  </p>
                  <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                    {tasks}
                  </p>
                </div>
                <Link to={buildPathWithLang('/plus/tasks', currentLang)} className="inline-block">
                  <Button variant="ghost" size="sm" className={`transition-all duration-200 hover:scale-105 ${themeClasses.background.primarySemiTransparentHover}`}>
                    {t('dashboard.plus.complete', 'Выполнить')}
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </WidgetCard>
  );
};

