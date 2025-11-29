import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { preloadModule } from '../services/i18n/config';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { profileApi } from '../services/api/profile';
import { apiClient } from '../services/api/client';
import { LoadingState, ErrorState, EmptyState } from '../design-system/composites';
import { themeClasses } from '../design-system/utils/themeClasses';
import { useAuthStore } from '../store';
import { useWidgetPreferences } from '../hooks/useWidgetPreferences';
import { useModal } from '../hooks/useModal';
import type { DocumentType, AddressType } from '../components/Modals';
import { ProfileCard } from '../components/Dashboard/ProfileCard';
import { DocumentsGrid } from '../components/Dashboard/DocumentsGrid';
import { AddressesGrid } from '../components/Dashboard/AddressesGrid';
import { FamilyMembers } from '../components/Dashboard/FamilyMembers';
import { appQueryClient } from '../providers/RootProvider';
import { familyApi } from '../services/api/family';
import { useNavigate } from 'react-router-dom';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';

// Lazy loading для тяжелых компонентов
const MasonryGrid = lazy(() => import('../design-system/composites/MasonryGrid').then(m => ({ default: m.MasonryGrid })));

// Lazy loading для модалок - загружаются только при открытии (оптимизация первой загрузки)
const AddDocumentModal = lazy(() => import('../components/Modals/AddDocumentModal').then(m => ({ default: m.AddDocumentModal })));
const AddAddressModal = lazy(() => import('../components/Modals/AddAddressModal').then(m => ({ default: m.AddAddressModal })));
const InviteFamilyMemberModal = lazy(() => import('../components/Modals/InviteFamilyMemberModal').then(m => ({ default: m.InviteFamilyMemberModal })));
const EditProfileModal = lazy(() => import('../components/Modals/EditProfileModal').then(m => ({ default: m.EditProfileModal })));
const EditAvatarModal = lazy(() => import('../components/Modals/EditAvatarModal').then(m => ({ default: m.EditAvatarModal })));

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
  isPlugin?: boolean; // Новое: флаг что это виджет из расширения
  uiType?: string; // Новое: тип UI (iframe/embedded)
  manifest?: any; // Новое: манифест расширения
};

// Интерфейс расширения
interface Extension {
  id: string;
  slug: string;
  name: string;
  description?: string;
  version: string;
  extensionType: string;
  uiType?: string;
  icon?: string;
  enabled: boolean;
  manifest?: any;
}

// Lazy loading для виджетов - загружаются по мере необходимости
const CoursesWidget = lazy(() => import('../components/Dashboard/CoursesWidget').then(m => ({ default: m.CoursesWidget })));
const EventsWidget = lazy(() => import('../components/Dashboard/EventsWidget').then(m => ({ default: m.EventsWidget })));
const RoadmapWidget = lazy(() => import('../components/Dashboard/RoadmapWidget').then(m => ({ default: m.RoadmapWidget })));
const MailWidget = lazy(() => import('../components/Dashboard/MailWidget').then(m => ({ default: m.MailWidget })));
const PlusWidget = lazy(() => import('../components/Dashboard/PlusWidget').then(m => ({ default: m.PlusWidget })));
const PayWidget = lazy(() => import('../components/Dashboard/PayWidget').then(m => ({ default: m.PayWidget })));
const SubscriptionsList = lazy(() => import('../components/Dashboard/SubscriptionsList').then(m => ({ default: m.SubscriptionsList })));
const PluginWidget = lazy(() => import('../components/Admin/AdminWidgets/PluginWidget').then(m => ({ default: m.PluginWidget })));

// Компонент скелетона для Suspense fallback - используем themeClasses для единообразия
const WidgetSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <div className={`${themeClasses.card.default} rounded-xl p-6 ${themeClasses.border.default} h-32`}>
      <div className={`h-4 ${themeClasses.background.gray2} rounded w-1/2 mb-4`}></div>
      <div className={`h-8 ${themeClasses.background.gray2} rounded w-1/3`}></div>
    </div>
  </div>
);

const SectionSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <div className={`${themeClasses.card.default} rounded-xl p-6 ${themeClasses.border.default}`}>
      <div className={`h-4 ${themeClasses.background.gray2} rounded w-1/4 mb-4`}></div>
      <div className="space-y-3">
        <div className={`h-3 ${themeClasses.background.gray2} rounded w-full`}></div>
        <div className={`h-3 ${themeClasses.background.gray2} rounded w-5/6`}></div>
        <div className={`h-3 ${themeClasses.background.gray2} rounded w-4/6`}></div>
      </div>
    </div>
  </div>
);

const dashboardQueryKey = ['dashboard'] as const;

const fetchDashboard = async () => {
  const startTime = typeof performance !== 'undefined' ? performance.now() : 0;
  try {
    const response = await profileApi.getDashboard();
    if (process.env.NODE_ENV === 'development' && startTime) {
      const endTime = performance.now();
      console.log(`[Dashboard] API request: ${(endTime - startTime).toFixed(2)}ms`);
    }
    return response.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development' && startTime) {
      const endTime = performance.now();
      console.error(`[Dashboard] API error after ${(endTime - startTime).toFixed(2)}ms:`, err);
    }
    throw err;
  }
};

if (typeof window !== 'undefined') {
  void appQueryClient.prefetchQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboard,
  });
  // Предзагрузка модулей убрана - модули загружаются в useEffect компонента
  // Критичные модули (dashboard, profile) уже загружаются при инициализации i18n
}

/**
 * DashboardPage - главная страница дашборда пользователя
 * Адаптивный дизайн для мобильных и десктопных устройств
 */
const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { updateUser, login } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  
  // Модалки
  const documentModal = useModal();
  const addressModal = useModal();
  const familyModal = useModal();
  const editProfileModal = useModal();
  const editAvatarModal = useModal();
  
  
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | undefined>();
  const [selectedAddressType, setSelectedAddressType] = useState<AddressType | undefined>();
  
  // Предзагрузка модулей переводов для страницы dashboard
  // Критичные модули (dashboard, profile) уже загружены при инициализации i18n
  // Загружаем только дополнительные модули, которые нужны для этой страницы
  useEffect(() => {
    const loadAdditionalModules = async () => {
      try {
        // Загружаем только не критичные модули, которые нужны для dashboard
        // dashboard и profile уже загружены как критичные модули
        await Promise.all([
          preloadModule('data'),
          preloadModule('modals'),
        ]);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[DashboardPage] Failed to load additional modules:', error);
        }
      }
    };

    loadAdditionalModules();

    // При смене языка changeLanguage уже загружает критичные модули (dashboard, profile)
    // Нужно загрузить только дополнительные модули для этой страницы
    const handleLanguageChanged = async () => {
      try {
        await Promise.all([
          preloadModule('data'),
          preloadModule('modals'),
        ]);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[DashboardPage] Failed to reload additional modules on language change:', error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
  
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
  
  // Оптимизация: используем initialData и placeholderData для мгновенного отображения контента
  // Показываем контент сразу, даже если данные еще загружаются
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboard,
    staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
    gcTime: 30 * 60 * 1000, // 30 минут в кэше
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Использовать кэш если данные свежие (staleTime не истек)
    refetchOnReconnect: false, // Не перезагружать при переподключении
    retry: 1, // Быстрая обработка ошибок
    retryDelay: 1000, // Задержка перед повтором
    // Используем placeholderData для мгновенного отображения (если есть кэш)
    placeholderData: (previousData) => previousData,
    // Используем initialData из кэша React Query для мгновенного отображения
    initialData: () => {
      // Пытаемся получить данные из кэша React Query
      const cachedData = queryClient.getQueryData(dashboardQueryKey);
      return cachedData || undefined;
    },
  });

  // Синхронизируем данные пользователя из API с authStore
  // ВАЖНО: Сохраняем роль и права при обновлении, чтобы не потерять их
  useEffect(() => {
    if (data?.data?.user) {
      const apiUser = data.data.user;
      const currentUser = useAuthStore.getState().user;
      updateUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone,
        avatar: apiUser.avatar,
        // Сохраняем роль и права из текущего состояния, если они не пришли из API
        role: apiUser.role || currentUser?.role,
        companyId: apiUser.companyId !== undefined ? apiUser.companyId : currentUser?.companyId,
        permissions: apiUser.permissions || currentUser?.permissions,
      });
    }
  }, [data, updateUser]);

  // Оптимизация: показываем skeleton сразу при первой загрузке для мгновенного отображения
  // Не дожидаемся isLoading, чтобы избежать задержки рендера
  // Если есть кэш (data) - показываем контент сразу
  const showSkeleton = !data && (isLoading || isFetching);

  if (error) {
    return (
      <PageTemplate title={t('dashboard.title')} showSidebar={true}>
        <ErrorState
          title={t('errors.500Title')}
          description={t('errors.500Description')}
          action={{
            label: t('common.retry'),
            onClick: () => queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
          }}
        />
      </PageTemplate>
    );
  }

  const dashboard = data?.data?.dashboard;
  const user = data?.data?.user;

  // Загружаем виджеты из расширений
  const { data: extensionWidgets = [] } = useQuery<Extension[]>({
    queryKey: ['extensions', 'widgets', 'enabled'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/extensions?extensionType=widget&enabled=true');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('[DashboardPage] Failed to fetch extension widgets:', error);
        return [];
      }
    },
  });

  // Доступные системные виджеты
  const systemWidgets: AvailableWidget[] = [
    {
      id: 'courses',
      title: t('dashboard.courses.title'),
      description: t('dashboard.courses.description'),
      icon: 'book',
      enabled: enabledWidgets.has('courses'),
    },
    {
      id: 'events',
      title: t('dashboard.events.title'),
      description: t('dashboard.events.description'),
      icon: 'bell',
      enabled: enabledWidgets.has('events'),
    },
    {
      id: 'roadmap',
      title: t('dashboard.roadmap.title'),
      description: t('dashboard.roadmap.description'),
      icon: 'flag',
      enabled: enabledWidgets.has('roadmap'),
    },
    {
      id: 'mail',
      title: t('dashboard.mail.title'),
      description: t('dashboard.mail.description'),
      icon: 'mail',
      enabled: enabledWidgets.has('mail'),
    },
    {
      id: 'plus',
      title: t('dashboard.plus.title'),
      description: t('dashboard.plus.description'),
      icon: 'star',
      enabled: enabledWidgets.has('plus'),
    },
    {
      id: 'pay',
      title: t('dashboard.pay.title'),
      description: t('dashboard.pay.description'),
      icon: 'wallet',
      enabled: enabledWidgets.has('pay'),
    },
  ];

  // Преобразуем виджеты-расширения в формат AvailableWidget
  const extensionWidgetsFormatted: AvailableWidget[] = extensionWidgets.map(widget => ({
    id: `extension-${widget.id}`,
    title: widget.name,
    description: widget.description || '',
    icon: widget.icon || 'package',
    enabled: enabledWidgets.has(`extension-${widget.id}`),
    isPlugin: true,
    uiType: widget.uiType,
    manifest: widget.manifest,
  }));

  // Объединяем системные и виджеты-расширения
  const availableWidgets: AvailableWidget[] = [...systemWidgets, ...extensionWidgetsFormatted];

  // Используем метод из хука для переключения виджета
  const handleToggleWidget = toggleWidget;

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

  // Обработчики для модалок
  const handleAddDocument = (type?: string | DocumentType) => {
    // Преобразуем string в DocumentType если нужно
    const docType = typeof type === 'string' ? type as DocumentType : type;
    setSelectedDocumentType(docType);
    documentModal.open();
  };

  const handleAddAddress = (type?: string | AddressType) => {
    // Преобразуем string в AddressType если нужно
    const addrType = typeof type === 'string' ? type as AddressType : type;
    setSelectedAddressType(addrType);
    addressModal.open();
  };

  const handleAddFamilyMember = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DashboardPage] handleAddFamilyMember called');
      console.log('[DashboardPage] familyModal:', familyModal);
      console.log('[DashboardPage] familyModal.isOpen before:', familyModal.isOpen);
    }
    familyModal.open();
    if (process.env.NODE_ENV === 'development') {
      console.log('[DashboardPage] familyModal.open() called');
      // Проверяем состояние после небольшой задержки
      setTimeout(() => {
        console.log('[DashboardPage] familyModal.isOpen after:', familyModal.isOpen);
      }, 100);
    }
  };

  const handleLoginAsFamilyMember = async (member: { id: string; name: string; avatar?: string | null }) => {
    try {
      // Вызываем API для входа под аккаунтом члена семьи
      const response = await familyApi.loginAs(member.id);
      const { user, tokens } = response.data.data;
      
      // Входим под аккаунтом члена семьи
      login(
        {
          id: user.id,
          name: user.name || member.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar || member.avatar || undefined,
          role: user.role || 'user',
          companyId: user.companyId || null,
          permissions: user.permissions || [],
        },
        tokens.accessToken,
        tokens.refreshToken
      );
      
      // Переходим на дашборд
      navigate(buildPathWithLang('/dashboard', currentLang));
      
      // Обновляем данные дашборда
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to login as family member:', error);
      }
      // TODO: Показать уведомление об ошибке
    }
  };

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  // Оптимизация: показываем loading state только при первой загрузке без данных
  if (showSkeleton) {
    return (
      <PageTemplate title={t('dashboard.title')} showSidebar={true}>
        <LoadingState text={t('common.loading')} />
      </PageTemplate>
    );
  }

  // Если нет данных после загрузки - показываем empty state
  if (!dashboard || !user) {
    return (
      <PageTemplate title={t('dashboard.title')} showSidebar={true}>
        <EmptyState
          icon="inbox"
          title={t('common.noData')}
          description={t('common.error')}
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('dashboard.title')} 
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
        gamePoints: dashboard.gamePoints,
      }}
    >
      {/* Индикатор обновления данных (не блокирует контент) */}
      {isFetching && !isLoading && (
        <div className={`fixed top-20 right-4 z-50 ${themeClasses.background.primarySemiTransparent10} ${themeClasses.border.primarySemi20} ${themeClasses.card.rounded} ${themeClasses.spacing.p3} ${themeClasses.typographySize.bodyXSmall} ${themeClasses.text.primary} animate-pulse`}>
          {t('common.loading')}
        </div>
      )}
      <div className="space-y-4 sm:space-y-6">
        <div className="w-full animate-fade-in" style={{ animationDelay: '0ms' }}>
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
            onEdit={editProfileModal.open}
            onEditAvatar={editAvatarModal.open}
          />
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
                  // Проверяем, является ли это виджетом-расширением
                  if (widgetId.startsWith('extension-')) {
                    const extensionWidget = extensionWidgets.find(w => `extension-${w.id}` === widgetId);
                    if (extensionWidget) {
                      return (
                        <PluginWidget
                          key={widgetId}
                          widgetId={widgetId}
                          title={extensionWidget.name}
                          description={extensionWidget.description}
                          uiType={extensionWidget.uiType}
                          manifest={extensionWidget.manifest}
                          icon={extensionWidget.icon}
                          {...commonProps}
                        />
                      );
                    }
                  }
                  return null;
              }
            })}
            
            {/* Карточка добавления виджета - всегда в конце */}
            <AddWidgetCard onClick={() => setIsWidgetSelectorOpen(true)} />
          </MasonryGrid>
          </Suspense>
        </div>

        {/* Documents Section - полная ширина */}
          <div className="w-full mb-6">
            <DocumentsGrid
              documents={dashboard?.documents || []}
              onAddDocument={handleAddDocument}
            />
        </div>

        {/* Addresses Section - полная ширина */}
          <div className="w-full mb-6">
            <AddressesGrid
              addresses={dashboard?.addresses || []}
              onAddAddress={handleAddAddress}
            />
        </div>

        {/* Family Section - полная ширина */}
          <div className="w-full mb-6">
            <FamilyMembers
              members={dashboard.family || []}
              onAddMember={dashboard.familyIsCreator ? handleAddFamilyMember : undefined}
              onMemberClick={(member) => {
                // TODO: открыть профиль члена семьи
                if (process.env.NODE_ENV === 'development') {
                  console.log('Open member:', member);
                }
              }}
              onLoginAs={handleLoginAsFamilyMember}
              isCreator={dashboard.familyIsCreator || false}
            />
        </div>

        {/* Subscriptions Section - полная ширина */}
        {dashboard.subscriptions && dashboard.subscriptions.length > 0 && (
            <Suspense fallback={<SectionSkeleton />}>
              <div className="w-full">
                <SubscriptionsList
                  subscriptions={dashboard.subscriptions}
                  onSubscriptionClick={(subscription) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Open subscription:', subscription);
                    }
                  }}
                />
            </div>
            </Suspense>
        )}
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

      {/* Модалки - lazy loaded для оптимизации первой загрузки */}
      <Suspense fallback={null}>
        <AddDocumentModal
          isOpen={documentModal.isOpen}
          onClose={documentModal.close}
          onSuccess={refreshDashboard}
          documentType={selectedDocumentType}
        />

        <AddAddressModal
          isOpen={addressModal.isOpen}
          onClose={addressModal.close}
          onSuccess={refreshDashboard}
          addressType={selectedAddressType}
        />

        <InviteFamilyMemberModal
          isOpen={familyModal.isOpen}
          onClose={() => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[DashboardPage] InviteFamilyMemberModal onClose called');
            }
            familyModal.close();
          }}
          onSuccess={() => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[DashboardPage] InviteFamilyMemberModal onSuccess called');
            }
            refreshDashboard();
          }}
        />

        <EditProfileModal
          isOpen={editProfileModal.isOpen}
          onClose={editProfileModal.close}
          onSuccess={refreshDashboard}
          initialData={{
            name: user.name,
            avatar: user.avatar,
          }}
        />

        <EditAvatarModal
          isOpen={editAvatarModal.isOpen}
          onClose={editAvatarModal.close}
          onSuccess={refreshDashboard}
          initialData={{
            name: user.name,
            avatar: user.avatar,
          }}
        />
      </Suspense>
    </PageTemplate>
  );
};

export default DashboardPage;

