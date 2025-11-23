import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../design-system/primitives';
import { WidgetCard } from '../../../design-system/composites/WidgetCard';
import { Badge } from '../../../design-system/primitives/Badge';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { formatCurrency, formatNumber } from '../../../utils/intl/formatters';
import { useCurrentLanguage } from '../../../utils/routing';

export interface OverviewMetricsWidgetProps {
  metrics?: {
    totalRevenue?: number;
    activeUsers?: number;
    customerLifetimeValue?: number;
    customerAcquisitionCost?: number;
  };
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
 * OverviewMetricsWidget - виджет с основными метриками админки
 * Структура данных из TailAdmin SaaS Dashboard
 */
export const OverviewMetricsWidget: React.FC<OverviewMetricsWidgetProps> = ({
  metrics = {
    totalRevenue: 20045.87,
    activeUsers: 9528,
    customerLifetimeValue: 849.54,
    customerAcquisitionCost: 9528,
  },
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
  const locale = currentLang === 'en' ? 'en' : 'ru';

  const metricsList = [
    {
      label: t('admin.metrics.totalRevenue', 'Total Revenue'),
      value: formatCurrency(metrics.totalRevenue || 0, 'USD', locale),
      change: '+2.5%',
      changePositive: true,
      icon: 'dollar-sign' as const,
    },
    {
      label: t('admin.metrics.activeUsers', 'Active Users'),
      value: formatNumber(metrics.activeUsers || 0, locale),
      change: '+9.5%',
      changePositive: true,
      icon: 'users' as const,
    },
    {
      label: t('admin.metrics.customerLifetimeValue', 'Customer Lifetime Value'),
      value: formatCurrency(metrics.customerLifetimeValue || 0, 'USD', locale),
      change: '-1.6%',
      changePositive: false,
      icon: 'trending-up' as const,
    },
    {
      label: t('admin.metrics.customerAcquisitionCost', 'Customer Acquisition Cost'),
      value: formatNumber(metrics.customerAcquisitionCost || 0, locale),
      change: '+3.5%',
      changePositive: true,
      icon: 'target' as const,
    },
  ];

  return (
    <WidgetCard
      title={t('admin.widgets.overview.title', 'Overview')}
      icon={<Icon name="bar-chart" size="lg" className="text-primary" />}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metricsList.map((metric, index) => (
          <div key={index} className={`p-4 rounded-lg ${themeClasses.background.gray2}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${themeClasses.text.secondary}`}>{metric.label}</span>
              <Icon name={metric.icon} size="sm" className={themeClasses.text.secondary} />
            </div>
            <div className="flex items-baseline gap-2">
              <h4 className={`text-2xl font-bold ${themeClasses.text.primary}`}>{metric.value}</h4>
              <Badge
                variant={metric.changePositive ? 'success' : 'danger'}
                size="sm"
              >
                {metric.change}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

