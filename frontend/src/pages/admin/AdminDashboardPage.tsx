import React, { Suspense, lazy, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { adminApi } from '../../services/api/admin';
import { Icon } from '../../design-system/primitives/Icon';
import { useAdminWidgets } from '../../hooks/useAdminWidgets';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';

// Lazy loading для тяжелых компонентов
const MasonryGrid = lazy(() => import('../../design-system/composites/MasonryGrid').then(m => ({ default: m.MasonryGrid })));

// Lazy loading для виджетов
const OverviewMetricsWidget = lazy(() => import('../../components/Admin/AdminWidgets/OverviewMetricsWidget').then(m => ({ default: m.OverviewMetricsWidget })));
const RecentActivitiesWidget = lazy(() => import('../../components/Admin/AdminWidgets/RecentActivitiesWidget').then(m => ({ default: m.RecentActivitiesWidget })));

// Lazy loading для компонентов
const WidgetSelector = lazy(() => import('../../components/Dashboard/WidgetSelector').then(m => ({ default: m.WidgetSelector })));
const AddWidgetCard = lazy(() => import('../../components/Dashboard/AddWidgetCard').then(m => ({ default: m.AddWidgetCard })));

// Тип для доступных виджетов
export type AvailableAdminWidget = {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  requiredRole?: 'super_admin' | 'company_admin';
};

// Компонент скелетона для Suspense fallback
const WidgetSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <div className="bg-background dark:bg-surface rounded-xl p-6 border border-border h-32">
      <div className="h-4 bg-gray-2 dark:bg-gray-3 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-2 dark:bg-gray-3 rounded w-1/3"></div>
    </div>
  </div>
);

const adminStatsQueryKey = ['admin-stats'] as const;

const fetchAdminStats = async () => {
  const response = await adminApi.getStats();
  return response.data;
};

/**
 * AdminDashboardPage - главная страница административной консоли
 * Использует структуру виджетов из DashboardPage и данные из TailAdmin SaaS Dashboard
 */
const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { isSuperAdmin, isCompanyAdmin } = useAdminPermissions();
  
  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after' | null>(null);
  
  // Используем хук для управления виджетами админки
  const {
    enabledWidgets,
    orderedWidgets,
    toggleWidget,
    removeWidget,
    reorderWidgets,
  } = useAdminWidgets();
  
  // Загружаем статистику админки
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: adminStatsQueryKey,
    queryFn: fetchAdminStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Доступные виджеты админки
  const availableWidgets: AvailableAdminWidget[] = [
    {
      id: 'overview',
      title: t('admin.widgets.overview.title', 'Overview'),
      description: t('admin.widgets.overview.description', 'Основные метрики системы'),
      icon: 'bar-chart',
      enabled: enabledWidgets.has('overview'),
    },
    {
      id: 'activities',
      title: t('admin.widgets.activities.title', 'Activities'),
      description: t('admin.widgets.activities.description', 'Последние активности пользователей'),
      icon: 'activity',
      enabled: enabledWidgets.has('activities'),
    },
    {
      id: 'churn',
      title: t('admin.widgets.churn.title', 'Churn Rate'),
      description: t('admin.widgets.churn.description', 'Процент оттока пользователей'),
      icon: 'trending-down',
      enabled: enabledWidgets.has('churn'),
      requiredRole: 'super_admin',
    },
    {
      id: 'growth',
      title: t('admin.widgets.growth.title', 'User Growth'),
      description: t('admin.widgets.growth.description', 'Рост регистраций'),
      icon: 'trending-up',
      enabled: enabledWidgets.has('growth'),
    },
    {
      id: 'companies',
      title: t('admin.widgets.companies.title', 'Companies'),
      description: t('admin.widgets.companies.description', 'Список компаний'),
      icon: 'building',
      enabled: enabledWidgets.has('companies'),
      requiredRole: 'super_admin',
    },
  ].filter(widget => {
    // Фильтруем виджеты по роли
    if (widget.requiredRole === 'super_admin' && !isSuperAdmin) {
      return false;
    }
    return true;
  });

  // Drag & Drop handlers
  const handleDragStart = (_e: React.DragEvent, widgetId: string) => {
    setDraggedWidgetId(widgetId);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
    setInsertPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, widgetId: string) => {
    e.preventDefault();
    
    if (!draggedWidgetId || draggedWidgetId === widgetId) {
      return;
    }

    setDragOverWidgetId(widgetId);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseY = e.clientY;
    const elementCenterY = rect.top + rect.height / 2;
    
    setInsertPosition(mouseY < elementCenterY ? 'before' : 'after');
  };

  const handleDragLeave = () => {
    setTimeout(() => {
      setDragOverWidgetId(null);
      setInsertPosition(null);
    }, 100);
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    
    if (!draggedWidgetId || draggedWidgetId === targetWidgetId) {
      return;
    }

    const position = insertPosition || 'after';
    reorderWidgets(draggedWidgetId, targetWidgetId, position);
    
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
    setInsertPosition(null);
  };

  const handleToggleWidget = toggleWidget;
  const handleRemoveWidget = removeWidget;

  if (error) {
    return (
      <AdminPageTemplate title={t('admin.dashboard.title', 'Админ-панель')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Icon name="alert-circle" size="lg" color="rgb(var(--color-error))" className="mx-auto mb-4" />
            <p className="text-text-secondary">
              {t('errors.500Description', 'Что-то пошло не так. Мы уже работаем над исправлением.')}
            </p>
          </div>
        </div>
      </AdminPageTemplate>
    );
  }

  const stats = statsData?.data;

  // Показываем skeleton при загрузке
  if (isLoading) {
    return (
      <AdminPageTemplate title={t('admin.dashboard.title', 'Админ-панель')} showSidebar={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <WidgetSkeleton key={i} />
          ))}
        </div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate 
      title={t('admin.dashboard.title', 'Админ-панель')} 
      showSidebar={true}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Widgets Section */}
        <div className="w-full">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[1, 2, 3].map((i) => (
                <WidgetSkeleton key={i} />
              ))}
            </div>
          }>
          <MasonryGrid
            columns={{ sm: 1, md: 2, lg: 3 }}
            gap={24}
            className="lg:gap-6"
          >
              {orderedWidgets.map((widgetId) => {
              const commonProps = {
                widgetId,
                draggable: true,
                onDragStart: handleDragStart,
                onDragEnd: handleDragEnd,
                onDragOver: (e: React.DragEvent) => handleDragOver(e, widgetId),
                onDragLeave: handleDragLeave,
                onDrop: handleDrop,
                onRemove: handleRemoveWidget,
                isDragOver: dragOverWidgetId === widgetId,
                insertPosition: dragOverWidgetId === widgetId ? insertPosition : null,
                isDragging: draggedWidgetId === widgetId,
              };

              switch (widgetId) {
                case 'overview':
                  return (
                      <OverviewMetricsWidget 
                        key={widgetId}
                        metrics={{
                          totalRevenue: 20045.87,
                          activeUsers: stats?.activeUsers || 9528,
                          customerLifetimeValue: 849.54,
                          customerAcquisitionCost: 9528,
                        }}
                        {...commonProps}
                      />
                  );
                case 'activities':
                  return (
                      <RecentActivitiesWidget 
                        key={widgetId}
                        {...commonProps}
                      />
                  );
                default:
                  return null;
              }
            })}
            
            {/* Карточка добавления виджета */}
            <AddWidgetCard onClick={() => setIsWidgetSelectorOpen(true)} />
          </MasonryGrid>
          </Suspense>
        </div>
      </div>

      {/* Widget Selector Panel */}
      {isWidgetSelectorOpen && (
        <Suspense fallback={null}>
      <WidgetSelector
        isOpen={isWidgetSelectorOpen}
        onClose={() => setIsWidgetSelectorOpen(false)}
        availableWidgets={availableWidgets}
        onToggleWidget={handleToggleWidget}
      />
        </Suspense>
      )}
    </AdminPageTemplate>
  );
};

export default AdminDashboardPage;

