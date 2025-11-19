import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { profileApi } from '../services/api/profile';
import {
  ProfileCard,
  MailWidget,
  PlusWidget,
  PayWidget,
  DocumentsGrid,
  AddressesGrid,
  FamilyMembers,
  SubscriptionsList,
} from '../components/Dashboard';
import { Icon } from '../design-system/primitives';

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
      // Axios возвращает response.data, где data уже содержит { success: true, data: {...} }
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <PageTemplate title={t('dashboard.title', 'Главная')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-body-color dark:text-dark-6">{t('common.loading', 'Загрузка...')}</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title={t('dashboard.title', 'Главная')} showSidebar={true}>
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
      <PageTemplate title={t('dashboard.title', 'Главная')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-body-color dark:text-dark-6">{t('common.noData', 'Нет данных')}</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('dashboard.title', 'Главная')} 
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
        </div>

        {/* Widgets Grid - адаптивная сетка */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Mail Widget */}
          <div className="w-full animate-fade-in" style={{ animationDelay: '100ms' }}>
            <MailWidget unreadCount={dashboard.unreadMail || 0} />
          </div>

          {/* Plus Widget */}
          <div className="w-full animate-fade-in" style={{ animationDelay: '200ms' }}>
            <PlusWidget
              active={dashboard.plusActive || false}
              points={dashboard.plusPoints || 0}
              tasks={dashboard.plusTasks || 0}
            />
          </div>

          {/* Pay Widget */}
          <div className="w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
            <PayWidget
              balance={dashboard.payBalance || 0}
              limit={dashboard.payLimit || 0}
            />
          </div>
        </div>

        {/* Documents Section - полная ширина */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '400ms' }}>
          <DocumentsGrid
            documents={dashboard.documents || []}
            onAddDocument={(type) => {
              // TODO: открыть модалку добавления документа
            }}
          />
        </div>

        {/* Addresses Section - полная ширина */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '500ms' }}>
          <AddressesGrid
            addresses={dashboard.addresses || []}
            onAddAddress={(type) => {
              // TODO: открыть модалку добавления адреса
            }}
          />
        </div>

        {/* Family Section - полная ширина */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '600ms' }}>
          <FamilyMembers
            members={dashboard.family || []}
            onAddMember={() => {
              // TODO: открыть модалку добавления члена семьи
            }}
          />
        </div>

        {/* Subscriptions Section - полная ширина */}
        {dashboard.subscriptions && dashboard.subscriptions.length > 0 && (
          <div className="w-full animate-fade-in" style={{ animationDelay: '700ms' }}>
            <SubscriptionsList
              subscriptions={dashboard.subscriptions}
              onSubscriptionClick={(subscription) => {
                // TODO: открыть страницу подписки
                console.log('Open subscription:', subscription);
              }}
            />
          </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default DashboardPage;

