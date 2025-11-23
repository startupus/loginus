import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { ErrorState, LoadingState } from '../design-system/composites';
import { profileApi } from '../services/api/profile';
import { workApi } from '../services/api/work';
import { useAuthStore } from '../store';

const WorkGroups = lazy(() => import('../components/Dashboard/WorkGroups').then(m => ({ default: m.WorkGroups })));
const InviteMemberModal = lazy(() => import('../components/Work/InviteMemberModal').then(m => ({ default: m.InviteMemberModal })));
const GroupEvents = lazy(() => import('../components/Work/GroupEvents').then(m => ({ default: m.GroupEvents })));

/**
 * WorkPage - страница рабочих групп и команд
 */
const WorkPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
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
      // Техническая ошибка - не показывается пользователю напрямую
      throw new Error('Group not selected');
    }
    await workApi.inviteMember(selectedGroup.id, { email, role });
  };

  // Показываем loading state только при первой загрузке без данных
  const showSkeleton = isLoading && !data;
  
  if (showSkeleton) {
    return (
      <PageTemplate title={t('sidebar.work')} showSidebar={true}>
        <LoadingState text={t('common.loading')} />
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title={t('sidebar.work')} showSidebar={true}>
        <ErrorState
          title={t('common.error')}
          action={{
            label: t('common.retry'),
            onClick: () => queryClient.invalidateQueries({ queryKey: ['work-groups'] })
          }}
        />
      </PageTemplate>
    );
  }

  const workGroups = data?.workGroups || [];
  const groupEvents = data?.groupEvents || [];

  return (
    <PageTemplate title={t('sidebar.work')} showSidebar={true}>
      <div className="space-y-6">
        {/* Секция с группами */}
        <Suspense fallback={<LoadingState text={t('common.loading')} />}>
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
        <Suspense fallback={<LoadingState text={t('common.loading')} />}>
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

