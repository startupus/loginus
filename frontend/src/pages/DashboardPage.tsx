import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { preloadModule } from '../services/i18n/config';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { profileApi } from '../services/api/profile';
import { Icon } from '../design-system/primitives';
// Lazy loading для MasonryGrid
const MasonryGrid = lazy(() => import('../design-system/composites/MasonryGrid').then(m => ({ default: m.MasonryGrid })));
import { useAuthStore } from '../store';
import { useWidgetPreferences } from '../hooks/useWidgetPreferences';

// Lazy loading для компонентов, которые не нужны сразу
const WidgetSelector = lazy(() => import('../components/Dashboard/WidgetSelector').then(m => ({ default: m.WidgetSelector })));
const AddWidgetCard = lazy(() => import('../components/Dashboard/AddWidgetCard').then(m => ({ default: m.AddWidgetCard })));

// Тип для доступных виджетов
export type AvailableWidget = {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
};

// Lazy loading компонентов Dashboard для оптимизации производительности
const ProfileCard = lazy(() => import('../components/Dashboard/ProfileCard').then(m => ({ default: m.ProfileCard })));
const CoursesWidget = lazy(() => import('../components/Dashboard/CoursesWidget').then(m => ({ default: m.CoursesWidget })));
const EventsWidget = lazy(() => import('../components/Dashboard/EventsWidget').then(m => ({ default: m.EventsWidget })));
const RoadmapWidget = lazy(() => import('../components/Dashboard/RoadmapWidget').then(m => ({ default: m.RoadmapWidget })));
const MailWidget = lazy(() => import('../components/Dashboard/MailWidget').then(m => ({ default: m.MailWidget })));
const PlusWidget = lazy(() => import('../components/Dashboard/PlusWidget').then(m => ({ default: m.PlusWidget })));
const PayWidget = lazy(() => import('../components/Dashboard/PayWidget').then(m => ({ default: m.PayWidget })));
const DocumentsGrid = lazy(() => import('../components/Dashboard/DocumentsGrid').then(module => ({ default: module.DocumentsGrid })));
const AddressesGrid = lazy(() => import('../components/Dashboard/AddressesGrid').then(module => ({ default: module.AddressesGrid })));
const FamilyMembers = lazy(() => import('../components/Dashboard/FamilyMembers').then(m => ({ default: m.FamilyMembers })));
const SubscriptionsList = lazy(() => import('../components/Dashboard/SubscriptionsList').then(m => ({ default: m.SubscriptionsList })));

// Компонент скелетона для Suspense fallback
const WidgetSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <div className="bg-white dark:bg-dark-2 rounded-xl p-6 border border-stroke dark:border-dark-3 h-32">
      <div className="h-4 bg-gray-2 dark:bg-dark-3 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-2 dark:bg-dark-3 rounded w-1/3"></div>
    </div>
  </div>
);

const SectionSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <div className="bg-white dark:bg-dark-2 rounded-xl p-6 border border-stroke dark:border-dark-3">
      <div className="h-4 bg-gray-2 dark:bg-dark-3 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-2 dark:bg-dark-3 rounded w-full"></div>
        <div className="h-3 bg-gray-2 dark:bg-dark-3 rounded w-5/6"></div>
        <div className="h-3 bg-gray-2 dark:bg-dark-3 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

/**
 * DashboardPage - главная страница дашборда пользователя
 * Адаптивный дизайн для мобильных и десктопных устройств
 */
const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { updateUser } = useAuthStore();
  
  // Предзагружаем модули dashboard и profile асинхронно (не блокируя рендеринг)
  useEffect(() => {
    // Используем requestIdleCallback для загрузки в свободное время браузера
    const loadModules = () => {
      const startTime = performance.now();
      Promise.all([
        preloadModule('dashboard'),
        preloadModule('profile'),
      ]).then(() => {
        const endTime = performance.now();
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Dashboard] i18n modules loaded: ${(endTime - startTime).toFixed(2)}ms`);
        }
      }).catch(() => {
        // Игнорируем ошибки загрузки модулей
      });
    };
    
    // Используем requestIdleCallback если доступен, иначе setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(loadModules, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const timer = setTimeout(loadModules, 100);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Логирование времени рендеринга компонента (только в dev)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderStart = performance.now();
      // Используем requestIdleCallback для неблокирующего логирования
      const timer = setTimeout(() => {
        const renderEnd = performance.now();
        console.log(`[Dashboard] Component render: ${(renderEnd - renderStart).toFixed(2)}ms`);
      }, 0);
      return () => clearTimeout(timer);
    }
  });
  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after' | null>(null);
  
  // Используем оптимизированный хук для управления виджетами
  const {
    enabledWidgets,
    orderedWidgets,
    toggleWidget,
    removeWidget,
    reorderWidgets,
  } = useWidgetPreferences();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const startTime = performance.now();
      try {
        const response = await profileApi.getDashboard();
        const endTime = performance.now();
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Dashboard] API request: ${(endTime - startTime).toFixed(2)}ms`);
        }
        return response.data;
      } catch (err) {
        const endTime = performance.now();
        if (process.env.NODE_ENV === 'development') {
          console.error(`[Dashboard] API error after ${(endTime - startTime).toFixed(2)}ms:`, err);
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
    gcTime: 30 * 60 * 1000, // 30 минут в кэше
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Использовать кэш если данные свежие (staleTime не истек)
    refetchOnReconnect: false, // Не перезагружать при переподключении
    retry: 1, // Быстрая обработка ошибок
    retryDelay: 1000, // Задержка перед повтором
  });

  // Синхронизируем данные пользователя из API с authStore
  useEffect(() => {
    if (data?.data?.user) {
      const apiUser = data.data.user;
      updateUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone,
        avatar: apiUser.avatar,
      });
    }
  }, [data, updateUser]);

  if (isLoading) {
    return (
      <PageTemplate title={t('dashboard.title', 'Профиль')} showSidebar={true}>
        <div className="space-y-4 sm:space-y-6">
          {/* Skeleton для ProfileCard */}
          <div className="w-full animate-pulse">
            <div className="bg-white dark:bg-dark-2 rounded-xl p-6 border border-stroke dark:border-dark-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-2 dark:bg-dark-3"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-2 dark:bg-dark-3 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-2 dark:bg-dark-3 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Skeleton для виджетов */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full animate-pulse">
                <div className="bg-white dark:bg-dark-2 rounded-xl p-6 border border-stroke dark:border-dark-3 h-32">
                  <div className="h-4 bg-gray-2 dark:bg-dark-3 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-2 dark:bg-dark-3 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title={t('dashboard.title', 'Профиль')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Icon name="alert-circle" size="lg" className="text-error mx-auto mb-4" />
            <p className="text-body-color dark:text-dark-6">
              {t('errors.500Description', 'Что-то пошло не так. Мы уже работаем над исправлением.')}
            </p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  const dashboard = data?.data?.dashboard;
  const user = data?.data?.user;

  // Доступные виджеты
  const availableWidgets: AvailableWidget[] = [
    {
      id: 'courses',
      title: t('dashboard.courses.title', 'Мои курсы обучения'),
      description: t('dashboard.courses.description', 'Отслеживайте прогресс по вашим курсам'),
      icon: 'book',
      enabled: enabledWidgets.has('courses'),
    },
    {
      id: 'events',
      title: t('dashboard.events.title', 'События'),
      description: t('dashboard.events.description', 'Последние события и уведомления'),
      icon: 'bell',
      enabled: enabledWidgets.has('events'),
    },
    {
      id: 'roadmap',
      title: t('dashboard.roadmap.title', 'Моя дорожная карта'),
      description: t('dashboard.roadmap.description', 'Ближайшие шаги в обучении'),
      icon: 'flag',
      enabled: enabledWidgets.has('roadmap'),
    },
    {
      id: 'mail',
      title: t('dashboard.mail.title', 'Почта'),
      description: t('dashboard.mail.description', 'Непрочитанные письма'),
      icon: 'mail',
      enabled: enabledWidgets.has('mail'),
    },
    {
      id: 'plus',
      title: t('dashboard.plus.title', 'Яндекс Плюс'),
      description: t('dashboard.plus.description', 'Статус подписки и баллы'),
      icon: 'star',
      enabled: enabledWidgets.has('plus'),
    },
    {
      id: 'pay',
      title: t('dashboard.pay.title', 'Яндекс Пэй'),
      description: t('dashboard.pay.description', 'Баланс и лимиты'),
      icon: 'wallet',
      enabled: enabledWidgets.has('pay'),
    },
  ];

  // Используем метод из хука для переключения виджета
  const handleToggleWidget = toggleWidget;

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
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
    
    // Определяем позицию вставки на основе позиции курсора
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseY = e.clientY;
    const elementCenterY = rect.top + rect.height / 2;
    
    setInsertPosition(mouseY < elementCenterY ? 'before' : 'after');
  };

  const handleDragLeave = () => {
    // Не сбрасываем сразу, чтобы избежать мерцания при переходе между элементами
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

    // Используем метод из хука для переупорядочивания
    const position = insertPosition || 'after';
    reorderWidgets(draggedWidgetId, targetWidgetId, position);
    
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
    setInsertPosition(null);
  };

  // Используем метод из хука для удаления виджета
  const handleRemoveWidget = removeWidget;

  if (!dashboard || !user) {
    return (
      <PageTemplate title={t('dashboard.title', 'Профиль')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-body-color dark:text-dark-6">{t('common.noData', 'Нет данных')}</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('dashboard.title', 'Профиль')} 
      showSidebar={true}
      showHeaderNav={false}
      userData={{
        id: user.id || '1',
        name: user.name,
        phone: user.phone,
        email: user.email,
        login: user.login,
        avatar: user.avatar,
        unreadMail: dashboard.unreadMail,
        plusActive: dashboard.plusActive,
        plusPoints: dashboard.plusPoints,
      }}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Profile Card - полная ширина на всех устройствах */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '0ms' }}>
          <Suspense fallback={<SectionSkeleton />}>
            <ProfileCard
              user={{
                name: user.name,
                phone: user.phone,
                email: user.email,
                avatar: user.avatar,
                balance: dashboard.balance,
                gamePoints: dashboard.gamePoints,
                achievements: dashboard.achievements,
              }}
              onEdit={() => {
                // TODO: открыть модалку редактирования
              }}
            />
          </Suspense>
        </div>

        {/* Widgets Section - объединенный Suspense для всех виджетов */}
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
                case 'courses':
                  return (
                      <CoursesWidget 
                        key={widgetId}
                        courses={dashboard.courses || []}
                        {...commonProps}
                      />
                  );
                case 'events':
                  return (
                      <EventsWidget 
                        key={widgetId}
                        events={dashboard.events || []}
                        {...commonProps}
                      />
                  );
                case 'roadmap':
                  return (
                      <RoadmapWidget 
                        key={widgetId}
                        steps={dashboard.roadmap || []}
                        {...commonProps}
                      />
                  );
                case 'mail':
                  return (
                      <MailWidget 
                        key={widgetId}
                        unreadCount={dashboard.unreadMail || 0}
                        {...commonProps}
                      />
                  );
                case 'plus':
                  return (
                      <PlusWidget
                        key={widgetId}
                        active={dashboard.plusActive || false}
                        points={dashboard.plusPoints || 0}
                        tasks={dashboard.plusTasks || 0}
                        {...commonProps}
                      />
                  );
                case 'pay':
                  return (
                      <PayWidget
                        key={widgetId}
                        balance={dashboard.payBalance || 0}
                        limit={dashboard.payLimit || 0}
                        {...commonProps}
                      />
                  );
                default:
                  return null;
              }
            })}
            
            {/* Карточка добавления виджета - всегда в конце */}
            <AddWidgetCard onClick={() => setIsWidgetSelectorOpen(true)} />
          </MasonryGrid>
          </Suspense>
        </div>

        {/* Documents, Addresses, Family, Subscriptions - объединенный Suspense */}
        <Suspense fallback={
          <div className="space-y-6">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        }>
        {/* Documents Section - полная ширина */}
          <div className="w-full mb-6">
            <DocumentsGrid
              documents={dashboard?.documents || []}
              onAddDocument={() => {
                // TODO: открыть модалку добавления документа
              }}
            />
        </div>

        {/* Addresses Section - полная ширина */}
          <div className="w-full mb-6">
            <AddressesGrid
              addresses={dashboard?.addresses || []}
              onAddAddress={() => {
                // TODO: открыть модалку добавления адреса
              }}
            />
        </div>

        {/* Family Section - полная ширина */}
          <div className="w-full mb-6">
            <FamilyMembers
              members={dashboard.family || []}
              onAddMember={() => {
                // TODO: открыть модалку добавления члена семьи
              }}
              onMemberClick={(member) => {
                // TODO: открыть профиль члена семьи
                console.log('Open member:', member);
              }}
            />
        </div>

        {/* Subscriptions Section - полная ширина */}
        {dashboard.subscriptions && dashboard.subscriptions.length > 0 && (
            <div className="w-full">
              <SubscriptionsList
                subscriptions={dashboard.subscriptions}
                onSubscriptionClick={(subscription) => {
                  // TODO: открыть страницу подписки
                  console.log('Open subscription:', subscription);
                }}
              />
          </div>
        )}
        </Suspense>
      </div>

      {/* Widget Selector Panel - lazy loaded */}
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
    </PageTemplate>
  );
};

export default DashboardPage;

