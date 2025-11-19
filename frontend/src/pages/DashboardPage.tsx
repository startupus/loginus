import React, { Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { profileApi } from '../services/api/profile';
import { Icon } from '../design-system/primitives';

// Lazy loading компонентов Dashboard для оптимизации производительности
const ProfileCard = lazy(() => import('../components/Dashboard/ProfileCard').then(m => ({ default: m.ProfileCard })));
const MailWidget = lazy(() => import('../components/Dashboard/MailWidget').then(m => ({ default: m.MailWidget })));
const PlusWidget = lazy(() => import('../components/Dashboard/PlusWidget').then(m => ({ default: m.PlusWidget })));
const PayWidget = lazy(() => import('../components/Dashboard/PayWidget').then(m => ({ default: m.PayWidget })));
const DocumentsGrid = lazy(() => import('../components/Dashboard/DocumentsGrid').then(m => ({ default: m.DocumentsGrid })));
const AddressesGrid = lazy(() => import('../components/Dashboard/AddressesGrid').then(m => ({ default: m.AddressesGrid })));
const FamilyMembers = lazy(() => import('../components/Dashboard/FamilyMembers').then(m => ({ default: m.FamilyMembers })));
const SubscriptionsList = lazy(() => import('../components/Dashboard/SubscriptionsList').then(m => ({ default: m.SubscriptionsList })));
const WorkGroups = lazy(() => import('../components/Dashboard/WorkGroups').then(m => ({ default: m.WorkGroups })));

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
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await profileApi.getDashboard();
      return response.data;
    },
    staleTime: Infinity, // Данные всегда свежие до явного обновления
    gcTime: 30 * 60 * 1000, // 30 минут в кэше
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Использовать кэш при монтировании
    refetchOnReconnect: false, // Не перезагружать при переподключении
  });

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
              }}
              onEdit={() => {
                // TODO: открыть модалку редактирования
              }}
            />
          </Suspense>
        </div>

        {/* Widgets Grid - адаптивная сетка */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Mail Widget */}
          <div className="w-full animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Suspense fallback={<WidgetSkeleton />}>
              <MailWidget unreadCount={dashboard.unreadMail || 0} />
            </Suspense>
          </div>

          {/* Plus Widget */}
          <div className="w-full animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Suspense fallback={<WidgetSkeleton />}>
              <PlusWidget
                active={dashboard.plusActive || false}
                points={dashboard.plusPoints || 0}
                tasks={dashboard.plusTasks || 0}
              />
            </Suspense>
          </div>

          {/* Pay Widget */}
          <div className="w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Suspense fallback={<WidgetSkeleton />}>
              <PayWidget
                balance={dashboard.payBalance || 0}
                limit={dashboard.payLimit || 0}
              />
            </Suspense>
          </div>
        </div>

        {/* Documents Section - полная ширина */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Suspense fallback={<SectionSkeleton />}>
            <DocumentsGrid
              documents={dashboard.documents || []}
              onAddDocument={() => {
                // TODO: открыть модалку добавления документа
              }}
            />
          </Suspense>
        </div>

        {/* Addresses Section - полная ширина */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '500ms' }}>
          <Suspense fallback={<SectionSkeleton />}>
            <AddressesGrid
              addresses={dashboard.addresses || []}
              onAddAddress={() => {
                // TODO: открыть модалку добавления адреса
              }}
            />
          </Suspense>
        </div>

        {/* Family Section - полная ширина */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '600ms' }}>
          <Suspense fallback={<SectionSkeleton />}>
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
          </Suspense>
        </div>

        {/* Work Groups Section - полная ширина */}
        {dashboard.workGroups && dashboard.workGroups.length > 0 && (
          <div className="w-full animate-fade-in" style={{ animationDelay: '650ms' }}>
            <Suspense fallback={<SectionSkeleton />}>
              <WorkGroups
                groups={dashboard.workGroups}
                onGroupClick={(group) => {
                  // TODO: открыть страницу группы
                  console.log('Open group:', group);
                }}
                onAddGroup={() => {
                  // TODO: открыть модалку создания группы
                }}
              />
            </Suspense>
          </div>
        )}

        {/* Subscriptions Section - полная ширина */}
        {dashboard.subscriptions && dashboard.subscriptions.length > 0 && (
          <div className="w-full animate-fade-in" style={{ animationDelay: '700ms' }}>
            <Suspense fallback={<SectionSkeleton />}>
              <SubscriptionsList
                subscriptions={dashboard.subscriptions}
                onSubscriptionClick={(subscription) => {
                  // TODO: открыть страницу подписки
                  console.log('Open subscription:', subscription);
                }}
              />
            </Suspense>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default DashboardPage;

