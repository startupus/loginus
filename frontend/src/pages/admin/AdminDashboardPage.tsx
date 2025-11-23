import React, { Suspense, lazy, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { adminApi } from '../../services/api/admin';
import { Icon } from '../../design-system/primitives/Icon';
import { useAdminWidgets } from '../../hooks/useAdminWidgets';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useCurrentLanguage } from '../../utils/routing';

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
    <div className={`${themeClasses.card.rounded} p-6 ${themeClasses.border.default} h-32`}>
      <div className={`h-4 ${themeClasses.background.gray2} rounded w-1/2 mb-4`}></div>
      <div className={`h-8 ${themeClasses.background.gray2} rounded w-1/3`}></div>
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
  const { t, i18n } = useTranslation();
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

  // Доступные виджеты админки с реактивностью к смене языка
  const currentLang = useCurrentLanguage();
  const availableWidgets: AvailableAdminWidget[] = useMemo(() => [
    {
      id: 'overview',
      title: t('admin.widgets.overview.title', currentLang === 'ru' ? 'Обзор' : 'Overview'),
      description: t('admin.widgets.overview.description', currentLang === 'ru' ? 'Основные метрики системы' : 'Key system metrics'),
      icon: 'bar-chart',
      enabled: enabledWidgets.has('overview'),
    },
    {
      id: 'activities',
      title: t('admin.widgets.activities.title', currentLang === 'ru' ? 'Активности' : 'Activities'),
      description: t('admin.widgets.activities.description', currentLang === 'ru' ? 'Последние активности пользователей' : 'Recent user activities'),
      icon: 'activity',
      enabled: enabledWidgets.has('activities'),
    },
    {
      id: 'churn',
      title: t('admin.widgets.churn.title', currentLang === 'ru' ? 'Отток пользователей' : 'Churn Rate'),
      description: t('admin.widgets.churn.description', currentLang === 'ru' ? 'Процент оттока пользователей' : 'User churn percentage'),
      icon: 'trending-down',
      enabled: enabledWidgets.has('churn'),
      requiredRole: 'super_admin',
    },
    {
      id: 'growth',
      title: t('admin.widgets.growth.title', currentLang === 'ru' ? 'Рост пользователей' : 'User Growth'),
      description: t('admin.widgets.growth.description', currentLang === 'ru' ? 'Рост регистраций' : 'Registration growth'),
      icon: 'trending-up',
      enabled: enabledWidgets.has('growth'),
    },
    {
      id: 'companies',
      title: t('admin.widgets.companies.title', currentLang === 'ru' ? 'Компании' : 'Companies'),
      description: t('admin.widgets.companies.description', currentLang === 'ru' ? 'Список компаний' : 'Company list'),
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
  }), [t, i18n.language, currentLang, enabledWidgets, isSuperAdmin]);

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
        <div className={themeClasses.state.error}>
          <div className={themeClasses.state.loadingSpinner}>
            <Icon name="alert-circle" size="lg" color="rgb(var(--color-error))" className="mx-auto mb-4" />
            <p className={themeClasses.text.secondary}>
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
                          // Используем данные из API где доступны, иначе дефолтные значения
                          totalRevenue: undefined, // Пока нет в API, будет использован дефолт из виджета
                          activeUsers: stats?.activeUsers,
                          customerLifetimeValue: undefined, // Пока нет в API, будет использован дефолт из виджета
                          customerAcquisitionCost: undefined, // Пока нет в API, будет использован дефолт из виджета
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

