import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, Icon, Badge } from '../../design-system/primitives';
import { DataSection, AddButton } from '../../design-system/composites';
import { getInitials } from '../../utils/stringUtils';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

export interface WorkGroupMember {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface WorkGroup {
  id: string;
  name: string;
  members: WorkGroupMember[];
  description?: string;
  myRole?: 'owner' | 'admin' | 'member';
}

export interface WorkGroupsProps {
  groups: WorkGroup[];
  onGroupClick?: (group: WorkGroup) => void;
  onAddGroup?: () => void;
  onInviteMember?: (group: { id: string; name: string }) => void;
}

/**
 * WorkGroups - рабочие группы с несколькими аватарками
 */
export const WorkGroups: React.FC<WorkGroupsProps> = ({
  groups,
  onGroupClick,
  onAddGroup,
  onInviteMember,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  
  const handleViewAll = () => {
    navigate(buildPathWithLang('/work', currentLang));
  };
  
  const MAX_VISIBLE_AVATARS = 5;
  
  const getRoleBadge = (role?: string) => {
    if (role === 'owner') {
      return <Badge variant="primary" size="sm">{t('dashboard.work.owner', 'Владелец')}</Badge>;
    }
    if (role === 'admin') {
      return <Badge variant="success" size="sm">{t('dashboard.work.admin', 'Админ')}</Badge>;
    }
    return null;
  };
  
  return (
    <DataSection
      id="work"
      title={t('dashboard.work.title', 'Работа')}
      description={t('dashboard.work.description', 'Ваши рабочие группы и команды')}
      action={
        <button
          onClick={handleViewAll}
          className="text-sm text-body-color dark:text-dark-6 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1"
        >
          <span>{t('dashboard.work.allGroups', 'Все группы')}</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group, index) => (
          <div
            key={group.id}
            className="group flex flex-col gap-3 p-4 rounded-lg bg-gray-1/50 dark:bg-dark-3/50 border border-stroke dark:border-dark-3 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-gray-1 dark:hover:bg-dark-3 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Название группы и роль */}
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onGroupClick?.(group)}
                className="flex-1 min-w-0 text-left"
              >
                <h3 className="text-base font-semibold text-dark dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200 truncate">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-xs text-body-color dark:text-dark-6 mt-1 line-clamp-2">
                    {group.description}
                  </p>
                )}
              </button>
              <div className="flex flex-col items-end gap-1">
                {getRoleBadge(group.myRole)}
                <Icon 
                  name="briefcase" 
                  size="sm" 
                  className="text-body-color dark:text-dark-6"
                />
              </div>
            </div>
            
            {/* Участники - стопка аватаров */}
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-2">
                {group.members.slice(0, MAX_VISIBLE_AVATARS).map((member, idx) => (
                  <div
                    key={member.id}
                    className="relative transition-transform duration-200 hover:z-10 hover:scale-110"
                    style={{ zIndex: MAX_VISIBLE_AVATARS - idx }}
                  >
                    <Avatar
                      src={member.avatar || undefined}
                      initials={getInitials(member.name)}
                      name={member.name}
                      size="sm"
                      rounded
                      showStatus
                      status={(member as any).isOnline ? 'online' : 'offline'}
                      className="ring-2 ring-white dark:ring-dark-2"
                    />
                  </div>
                ))}
                {group.members.length > MAX_VISIBLE_AVATARS && (
                  <div className="relative w-8 h-8 rounded-full bg-gray-1 dark:bg-dark-3 border-2 border-white dark:border-dark-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-body-color dark:text-dark-6">
                      +{group.members.length - MAX_VISIBLE_AVATARS}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-body-color dark:text-dark-6">
                {group.members.length} {group.members.length === 1 ? 'участник' : group.members.length < 5 ? 'участника' : 'участников'}
              </span>
            </div>

            {/* Кнопка пригласить участника */}
            {(group.myRole === 'owner' || group.myRole === 'admin') && onInviteMember && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInviteMember({ id: group.id, name: group.name });
                }}
                className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary text-sm font-medium transition-all duration-200"
              >
                <Icon name="user-plus" size="sm" />
                <span>{t('work.invite.invite', 'Пригласить участника')}</span>
              </button>
            )}
          </div>
        ))}
        
        {/* Кнопка добавить группу */}
        <div className="flex items-center">
          <AddButton
            label={t('dashboard.work.addGroup', 'Добавить группу')}
            onClick={onAddGroup || (() => {})}
            variant="compact"
            size="sm"
            borderStyle="solid"
            background="default"
            className="w-full"
          />
        </div>
      </div>
    </DataSection>
  );
};
