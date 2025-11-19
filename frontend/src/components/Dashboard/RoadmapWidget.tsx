import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

export interface RoadmapStep {
  id: string;
  title: string;
  courseTitle?: string;
  date?: string;
  completed: boolean;
  icon?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface RoadmapWidgetProps {
  steps: RoadmapStep[];
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
 * RoadmapWidget - виджет персональной дорожной карты
 * Показывает ближайшие шаги с возможностью перейти к полной версии
 */
export const RoadmapWidget: React.FC<RoadmapWidgetProps> = ({ 
  steps = [],
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
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();

  const displayedSteps = steps.filter(s => !s.completed).slice(0, 5);

  const handleViewFull = () => {
    // TODO: перейти на страницу полной дорожной карты
    navigate(buildPathWithLang('/roadmap', currentLang));
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-info';
      default:
        return 'text-primary';
    }
  };

  return (
    <WidgetCard
      title={t('dashboard.roadmap.title', 'Моя дорожная карта')}
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
          onClick={handleViewFull}
          className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors duration-200 group"
          aria-label={t('dashboard.roadmap.viewFull', 'Полная версия')}
        >
          <span className="text-sm text-body-color dark:text-dark-6 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200">
            {t('dashboard.roadmap.viewFull', 'Все данные')}
          </span>
          <Icon name="arrow-right" size="sm" className="text-body-color dark:text-dark-6 group-hover:text-primary dark:group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </button>
      }
    >
      {displayedSteps.length > 0 ? (
        <div className="space-y-2">
          {displayedSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-1 dark:bg-dark-3 hover:bg-gray-2 dark:hover:bg-dark-4 transition-all duration-200 group"
            >
              {/* Иконка */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 dark:bg-primary/20 ${getPriorityColor(step.priority)}`}>
                {step.icon ? (
                  <Icon name={step.icon} size="xs" />
                ) : (
                  <span className="text-[10px] font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Контент */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-dark dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-1">
                  {step.title}
                </p>
                {step.courseTitle && (
                  <p className="text-[10px] text-body-color dark:text-dark-6 mt-0.5 line-clamp-1">
                    {step.courseTitle}
                  </p>
                )}
              </div>
              
              {/* Дата */}
              {step.date && (
                <div className="flex-shrink-0 text-[10px] text-body-color dark:text-dark-6">
                  {new Date(step.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </div>
              )}
              
              {/* Статус */}
              {step.completed ? (
                <Icon name="check" size="xs" className="text-success flex-shrink-0" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-body-color dark:bg-dark-6 flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-1 dark:bg-dark-3 flex items-center justify-center">
            <Icon name="flag" size="lg" className="text-body-color dark:text-dark-6" />
          </div>
          <p className="text-sm text-body-color dark:text-dark-6 mb-2">
            {t('dashboard.roadmap.empty', 'Все шаги выполнены!')}
          </p>
          <p className="text-xs text-body-color dark:text-dark-6">
            {t('dashboard.roadmap.emptyDescription', 'Отличная работа!')}
          </p>
        </div>
      )}
    </WidgetCard>
  );
};

