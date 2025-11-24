import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { formatCurrency, formatNumber } from '../../utils/intl/formatters';

export interface PayWidgetProps {
  balance: number;
  limit: number;
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
 * PayWidget - виджет Яндекс Пэй
 */
export const PayWidget: React.FC<PayWidgetProps> = ({
  limit,
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
  
  return (
    <WidgetCard
      title={t('dashboard.pay.title', 'Яндекс Пэй')}
      icon={<Icon name="device" size="lg" className="text-primary" />}
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
      <div className="space-y-4">
        <div 
          className={`flex items-center justify-between p-4 rounded-lg ${themeClasses.background.primarySemiTransparent} cursor-pointer ${themeClasses.background.primarySemiTransparentHover} transition-colors`}
          onClick={() => navigate(buildPathWithLang('/pay', currentLang))}
        >
          <div className="flex items-center gap-3">
            <Icon name="device" size="lg" className="text-primary" />
            <div>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {t('dashboard.pay.openCard', 'Открыть карту Пэй')}
              </p>
            </div>
          </div>
          <button 
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${themeClasses.background.primarySemiTransparentHover} transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: открыть модалку добавления карты
            }}
          >
            +
          </button>
        </div>
        
        <div className={`flex items-center justify-between p-4 rounded-lg ${themeClasses.card.gridItem}`}>
          <div>
            <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
              {t('dashboard.pay.spendUpTo', 'Тратьте до')}
            </p>
            <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
              {formatCurrency(limit, 'RUB', currentLang)}
            </p>
          </div>
          <button 
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${themeClasses.background.hoverGrayDark} transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: открыть модалку увеличения лимита
            }}
          >
            +
          </button>
        </div>
      </div>
    </WidgetCard>
  );
};

