import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { profileApi } from '../services/api/profile';
import { workApi } from '../services/api/work';
import { useAuthStore } from '../store';

const WorkGroups = lazy(() => import('../components/Dashboard/WorkGroups').then(m => ({ default: m.WorkGroups })));
const InviteMemberModal = lazy(() => import('../components/Work/InviteMemberModal').then(m => ({ default: m.InviteMemberModal })));
const GroupEvents = lazy(() => import('../components/Work/GroupEvents').then(m => ({ default: m.GroupEvents })));

const SectionSkeleton: React.FC = () => (
  <div className="w-full animate-pulse mb-6">
    <div className="bg-background dark:bg-surface rounded-xl p-6 sm:p-8 border border-border">
      <div className="h-6 bg-gray-2 dark:bg-gray-3 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-2 dark:bg-gray-3 rounded w-2/3 mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-2 dark:bg-gray-3 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * WorkPage - страница рабочих групп и команд
 */
const WorkPage: React.FC = () => {
  const { t } = useTranslation();
  const { updateUser } = useAuthStore();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  // Оптимизация: используем placeholderData для мгновенного отображения контента
  const { data, isLoading, error } = useQuery({
    queryKey: ['work-groups'],
    queryFn: async () => {
      const response = await profileApi.getDashboard();
      return response.data;
    },
    placeholderData: (previousData) => previousData,
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

  const handleInviteClick = (group: { id: string; name: string }) => {
    setSelectedGroup(group);
    setInviteModalOpen(true);
  };

  const handleInvite = async (email: string, role?: 'admin' | 'member') => {
    if (!selectedGroup?.id) {
      throw new Error('Группа не выбрана');
    }
    await workApi.inviteMember(selectedGroup.id, { email, role });
  };

  // Показываем skeleton только при первой загрузке без данных
  const showSkeleton = isLoading && !data;
  
  if (showSkeleton) {
    return (
      <PageTemplate title={t('sidebar.work', 'Работа')} showSidebar={true}>
        <div className="space-y-6">
          <SectionSkeleton />
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title={t('sidebar.work', 'Работа')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-text-secondary mb-4">
              {t('common.error', 'Произошла ошибка при загрузке данных')}
            </p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  const workGroups = data?.workGroups || [];
  const groupEvents = data?.groupEvents || [];

  return (
    <PageTemplate title={t('sidebar.work', 'Работа')} showSidebar={true}>
      <div className="space-y-6">
        {/* Секция с группами */}
        <Suspense fallback={<SectionSkeleton />}>
          <WorkGroups
            groups={workGroups}
            onGroupClick={(group) => {
              // TODO: открыть страницу группы
              console.log('Open group:', group);
            }}
            onAddGroup={() => {
              // TODO: открыть модалку создания группы
              console.log('Add group');
            }}
            onInviteMember={handleInviteClick}
          />
        </Suspense>

        {/* Секция с событиями и уведомлениями */}
        <Suspense fallback={<SectionSkeleton />}>
          <GroupEvents events={groupEvents} />
        </Suspense>
      </div>

      {/* Модальное окно приглашения участника */}
      <Suspense fallback={null}>
        <InviteMemberModal
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedGroup(null);
          }}
          onInvite={handleInvite}
          groupName={selectedGroup?.name}
        />
      </Suspense>
    </PageTemplate>
  );
};

export default WorkPage;

