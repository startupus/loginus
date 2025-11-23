import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { formatDate } from '../../utils/intl/formatters';

export interface RoadmapStep {
  id: string;
  title: string;
  courseTitle?: string;
  date?: string;
  completed: boolean;
  icon?: string;
  priority?: 'high' | 'medium' | 'low';
  titleKey?: string;
  courseTitleKey?: string;
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

  const stepTitleMap: Record<string, string> = {
    '1': 'dashboard.roadmap.items.reactHooks',
    '2': 'dashboard.roadmap.items.responsiveDesign',
    '3': 'dashboard.roadmap.items.presentPerfect',
    '4': 'dashboard.roadmap.items.competitorAnalysis',
    '5': 'dashboard.roadmap.items.riskManagement',
  };

  const courseTitleMap: Record<string, string> = {
    '1': 'dashboard.courses.items.programmingBasics',
    '2': 'dashboard.courses.items.interfaceDesign',
    '3': 'dashboard.courses.items.englishLanguage',
    '4': 'dashboard.courses.items.marketing',
    '5': 'dashboard.courses.items.projectManagement',
  };

  const getStepTitle = (step: RoadmapStep) => {
    const key = (step as any).titleKey || stepTitleMap[step.id];
    if (key) {
      return t(key, { defaultValue: step.title });
    }
    return step.title;
  };

  const getCourseTitle = (step: RoadmapStep) => {
    const key = (step as any).courseTitleKey || courseTitleMap[step.id];
    if (key) {
      return t(key, { defaultValue: step.courseTitle });
    }
    return step.courseTitle;
  };

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
      title={t('dashboard.roadmap.title', { defaultValue: 'My roadmap' })}
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
          className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-gray-2 transition-colors duration-200 group"
          aria-label={t('dashboard.roadmap.viewFull', { defaultValue: 'Open full roadmap' })}
        >
          <span className="text-sm text-text-secondary group-hover:text-primary transition-colors duration-200">
            {t('dashboard.roadmap.viewFull', { defaultValue: 'Full Version' })}
          </span>
          <Icon name="arrow-right" size="sm" className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </button>
      }
    >
      {displayedSteps.length > 0 ? (
        <div className="space-y-2">
          {displayedSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 p-2 rounded-lg ${themeClasses.card.gridItem} ${themeClasses.card.gridItemHover} transition-all duration-200 group`}
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
                <p className="text-xs font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                  {getStepTitle(step)}
                </p>
                {step.courseTitle && (
                  <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-1">
                    {getCourseTitle(step)}
                  </p>
                )}
              </div>
              
              {/* Дата */}
              {step.date && (
                <div className="flex-shrink-0 text-[10px] text-text-secondary">
                  {formatDate(step.date, currentLang, { day: 'numeric', month: 'short' })}
                </div>
              )}
              
              {/* Статус */}
              {step.completed ? (
                <Icon name="check" size="xs" className="text-success flex-shrink-0" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-text-secondary flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${themeClasses.card.gridItemIcon} flex items-center justify-center`}>
            <Icon name="flag" size="lg" className="text-text-secondary" />
          </div>
          <p className="text-sm text-text-secondary mb-2">
            {t('dashboard.roadmap.empty', { defaultValue: 'All steps completed!' })}
          </p>
          <p className="text-xs text-text-secondary">
            {t('dashboard.roadmap.emptyDescription', { defaultValue: 'Great job!' })}
          </p>
        </div>
      )}
    </WidgetCard>
  );
};

