import React, { useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { ErrorState, LoadingState, EmptyState, DataSection, SeparatedList } from '../design-system/composites';
import { Separator } from '../design-system/primitives/Separator';
import { Button } from '../design-system/primitives/Button';
import { Icon } from '../design-system/primitives/Icon';
import { Avatar } from '../design-system/primitives/Avatar';
import { Badge } from '../design-system/primitives/Badge';
import { teamsApi, Team, TeamMember } from '../services/api/teams';
import { getInitials } from '../utils/stringUtils';
import { themeClasses } from '../design-system/utils/themeClasses';

// Lazy loading для модальных окон
const CreateTeamModal = lazy(() => 
  import('../components/Modals/CreateTeamModal').then(m => ({ default: m.CreateTeamModal }))
);
const EditTeamModal = lazy(() => 
  import('../components/Modals/EditTeamModal').then(m => ({ default: m.EditTeamModal }))
);
const InviteTeamMemberModal = lazy(() => 
  import('../components/Modals/InviteTeamMemberModal').then(m => ({ default: m.InviteTeamMemberModal }))
);

/**
 * Константы для стилей
 */
const LIST_CONTAINER_CLASSES = themeClasses.list.containerDark;

/**
 * Компонент для отображения элемента списка команды
 */
interface TeamItemProps {
  team: Team & { members?: TeamMember[]; myRole?: string };
  t: (key: string, defaultValue?: string) => string;
  onEdit?: (team: Team) => void;
  onInvite?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

const TeamItem: React.FC<TeamItemProps> = React.memo(({ team, t, onEdit, onInvite, onDelete }) => {
  const membersCount = team.members?.length || 0;
  // Определяем роль: для команд без организации создатель получает роль admin
  // Для команд с организацией - owner
  const isOwner = team.myRole === 'owner';
  const isAdmin = team.myRole === 'admin' || (!team.myRole && team.createdBy && !team.organizationId);
  const canManage = isOwner || isAdmin;
  const [isHovered, setIsHovered] = useState(false);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[TeamItem] Team:', team.name, 'myRole:', team.myRole, 'createdBy:', team.createdBy, 'isOwner:', isOwner, 'canManage:', canManage);
  }
  
  return (
    <div 
      className={`${themeClasses.list.item} w-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${themeClasses.background.gray} dark:bg-dark-3 flex items-center justify-center`}>
            <Icon name="briefcase" size="md" className="text-primary" />
          </div>
          {(isOwner || isAdmin) && (
            <div className={`absolute -bottom-1 -right-1 ${themeClasses.background.surfaceElevated} rounded-full p-0.5`}>
              <Icon 
                name={isOwner ? 'crown' : 'shield'} 
                size="xs" 
                className={themeClasses.text.secondary}
              />
            </div>
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className={`font-medium ${themeClasses.text.primary} flex items-center gap-2`}>
            {team.name}
            {isOwner && (
              <Badge variant="primary" size="sm">
                {t('work.team.owner', 'Владелец')}
              </Badge>
            )}
            {isAdmin && (
              <Badge variant="success" size="sm">
                {t('work.team.admin', 'Админ')}
              </Badge>
            )}
          </div>
          {team.description && (
            <div className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              {team.description}
            </div>
          )}
          <div className={`text-sm ${themeClasses.text.secondary} mt-1`}>
            {membersCount} {membersCount === 1 ? t('work.team.member', 'участник') : membersCount < 5 ? t('work.team.membersFew', 'участника') : t('work.team.membersMany', 'участников')}
          </div>
        </div>
        {/* Кнопки действий - максимально справа */}
        {canManage && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(team);
                }}
                className="p-3 rounded-lg hover:bg-gray-2 dark:hover:bg-dark-2 transition-colors"
                title={t('work.team.edit', 'Редактировать')}
              >
                <Icon name="edit" size="md" className={themeClasses.text.secondary} />
              </button>
            )}
            {onInvite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInvite(team);
                }}
                className="p-3 rounded-lg hover:bg-gray-2 dark:hover:bg-dark-2 transition-colors"
                title={t('work.team.invite', 'Пригласить')}
              >
                <Icon name="user-plus" size="md" className={themeClasses.text.secondary} />
              </button>
            )}
            {onDelete && (isOwner || isAdmin) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(team);
                }}
                className="p-3 rounded-lg hover:bg-error/10 transition-colors"
                title={t('work.team.delete', 'Удалить')}
              >
                <Icon name="trash" size="md" className="text-error" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

TeamItem.displayName = 'TeamItem';

/**
 * WorkPage - страница рабочих групп и команд
 */
const WorkPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Загружаем команды пользователя
  const { data, isLoading, error } = useQuery({
    queryKey: ['work-teams'],
    queryFn: async () => {
      const response = await teamsApi.getAccessibleTeams();
      if (process.env.NODE_ENV === 'development') {
        console.log('[WorkPage] API response:', response);
        console.log('[WorkPage] Response data:', response.data);
      }
      const teams = (Array.isArray(response.data) ? response.data : (response.data?.data || [])) as Team[];
      
      // Загружаем участников для каждой команды
      const teamsWithMembers = await Promise.all(
        teams.map(async (team) => {
          try {
            const membersResponse = await teamsApi.getTeamMembers(team.id);
            const members = membersResponse.data?.data?.members || [];
            return { ...team, members };
          } catch (err) {
            console.error(`[WorkPage] Failed to load members for team ${team.id}:`, err);
            return { ...team, members: [] };
          }
        })
      );
      
      return teamsWithMembers;
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Получаем команды без организации (для раздела "Работа")
  const workTeams = useMemo(() => {
    // data уже содержит команды с участниками
    const teams = (Array.isArray(data) ? data : []) as (Team & { members?: TeamMember[] })[];
    // Фильтруем только команды без организации
    const filtered = teams.filter(team => !team.organizationId);
    if (process.env.NODE_ENV === 'development') {
      console.log('[WorkPage] All teams:', teams);
      console.log('[WorkPage] Filtered teams (without organization):', filtered);
    }
    return filtered;
  }, [data]);

  // Мемоизированные обработчики
  const handleOpenModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreateModalOpen(true);
  }, []);
  
  const handleCreateSuccess = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['work-teams'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
    await queryClient.refetchQueries({ queryKey: ['work-teams'] });
    setIsCreateModalOpen(false);
  }, [queryClient]);

  const handleEdit = useCallback((team: Team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  }, []);

  const handleInvite = useCallback((team: Team) => {
    setSelectedTeam(team);
    setIsInviteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (team: Team) => {
    if (!window.confirm(t('work.team.deleteConfirm', `Вы уверены, что хотите удалить группу "${team.name}"? Это действие нельзя отменить.`))) {
      return;
    }

    try {
      await teamsApi.deleteTeam(team.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['work-teams'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ['work-teams'] });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete team:', error);
      }
      // TODO: Показать уведомление об ошибке
    }
  }, [t, queryClient]);

  const handleEditSuccess = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['work-teams'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
    await queryClient.refetchQueries({ queryKey: ['work-teams'] });
    setIsEditModalOpen(false);
    setSelectedTeam(null);
  }, [queryClient]);

  const handleInviteSuccess = useCallback(() => {
    // Приглашение не требует обновления списка команд
    setIsInviteModalOpen(false);
    setSelectedTeam(null);
  }, []);

  if (isLoading) {
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
          description={t('common.error')}
          action={{
            label: t('common.retry'),
            onClick: () => queryClient.invalidateQueries({ queryKey: ['work-teams'] }),
          }}
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('sidebar.work')} 
      showSidebar={true}
      contentClassName="space-y-8 max-w-4xl mx-auto"
    >
      {/* Work Groups Section */}
      <DataSection
        id="groups"
        title={t('work.groups.title', 'Рабочие группы')}
      >
        <div className={LIST_CONTAINER_CLASSES}>
          {workTeams.length > 0 ? (
            <div className="p-4">
              <SeparatedList>
                {workTeams.map((team) => (
                  <TeamItem 
                    key={team.id} 
                    team={team} 
                    t={t}
                    onEdit={handleEdit}
                    onInvite={handleInvite}
                    onDelete={handleDelete}
                  />
                ))}
              </SeparatedList>
              
              {/* Разделитель между группами и действиями */}
              <Separator className="my-3" />
              
              {/* Действия в конце списка */}
              <div className="space-y-0">
                <button
                  onClick={handleOpenModal}
                  className={`${themeClasses.list.item} w-full`}
                >
                  <div className="flex items-center gap-3">
                    <div className={themeClasses.iconContainer.gray}>
                      <Icon name="plus" size="md" />
                    </div>
                    <div className={`font-medium ${themeClasses.text.primary}`}>
                      {t('work.groups.create', 'Создать группу')}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="briefcase"
              title={t('work.groups.empty.title', 'Пока нет рабочих групп')}
              description={t('work.groups.empty.description', 'Создайте рабочую группу для совместной работы.')}
              action={{
                label: t('work.groups.create', 'Создать группу'),
                onClick: handleOpenModal,
                variant: 'primary',
              }}
              variant="info"
            />
          )}
        </div>
      </DataSection>

      {/* Модальные окна */}
      <Suspense fallback={null}>
        <CreateTeamModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
        <EditTeamModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTeam(null);
          }}
          onSuccess={handleEditSuccess}
          team={selectedTeam}
        />
        {selectedTeam && (
          <InviteTeamMemberModal
            isOpen={isInviteModalOpen}
            onClose={() => {
              setIsInviteModalOpen(false);
              setSelectedTeam(null);
            }}
            onSuccess={handleInviteSuccess}
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
          />
        )}
      </Suspense>
    </PageTemplate>
  );
};

export default WorkPage;
