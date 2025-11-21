import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface Course {
  id: string;
  title: string;
  progress: number;
  icon?: string;
  color?: string;
}

export interface CoursesWidgetProps {
  courses: Course[];
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
 * CoursesWidget - виджет с курсами обучения
 * Показывает 5-7 курсов с прогрессом и ссылкой "смотреть все"
 */
export const CoursesWidget: React.FC<CoursesWidgetProps> = ({ 
  courses = [],
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

  const displayedCourses = courses.slice(0, 3);

  const handleViewAll = () => {
    // TODO: перейти на страницу всех курсов
    navigate(buildPathWithLang('/courses', currentLang));
  };

  return (
    <WidgetCard
      title={t('dashboard.courses.title', 'Мои курсы обучения')}
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
          onClick={handleViewAll}
          className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-gray-2 transition-colors duration-200 group"
          aria-label={t('dashboard.courses.viewAll', 'Смотреть все')}
        >
          <span className="text-sm text-text-secondary group-hover:text-primary transition-colors duration-200">
            {t('dashboard.courses.viewAll', 'Все данные')}
          </span>
          <Icon name="arrow-right" size="sm" className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </button>
      }
    >
      {displayedCourses.length > 0 ? (
        <div className="space-y-3">
          {displayedCourses.map((course) => (
            <button
              key={course.id}
              className={`w-full group flex items-center gap-3 p-3 rounded-lg ${themeClasses.card.gridItem} ${themeClasses.card.gridItemHover} transition-all duration-200 text-left`}
            >
              {/* Иконка курса */}
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: course.color ? `${course.color}20` : undefined,
                  color: course.color || undefined
                }}
              >
                <Icon 
                  name={course.icon || 'book'} 
                  size="md"
                  className={course.color ? '' : 'text-primary'}
                />
              </div>
              
              {/* Название и прогресс */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                  {course.title}
                </p>
                <div className="mt-1.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-text-secondary">
                      {t('dashboard.courses.progress', 'Прогресс')}: {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-2 dark:bg-gray-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Стрелка */}
              <Icon 
                name="arrow-right" 
                size="xs" 
                className="text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${themeClasses.card.gridItemIcon} flex items-center justify-center`}>
            <Icon name="book" size="lg" className="text-text-secondary" />
          </div>
          <p className="text-sm text-text-secondary mb-2">
            {t('dashboard.courses.empty', 'У вас пока нет активных курсов')}
          </p>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            {t('dashboard.courses.browse', 'Найти курсы')}
          </button>
        </div>
      )}
    </WidgetCard>
  );
};

