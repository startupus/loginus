import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, Icon, Badge } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';
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
}

/**
 * WorkGroups - рабочие группы с несколькими аватарками
 */
export const WorkGroups: React.FC<WorkGroupsProps> = ({
  groups,
  onGroupClick,
  onAddGroup,
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
          <button
            key={group.id}
            onClick={() => onGroupClick?.(group)}
            className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-gray-3 dark:hover:border-dark-4 transition-all duration-200 animate-fade-in text-left"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Название группы и роль */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-dark dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200 truncate">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-xs text-body-color dark:text-dark-6 mt-1 line-clamp-2">
                    {group.description}
                  </p>
                )}
              </div>
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
          </button>
        ))}
        
        {/* Кнопка добавить группу */}
        <button
          onClick={onAddGroup}
          className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border-2 border-dashed border-stroke dark:border-dark-3 hover:border-primary dark:hover:border-primary transition-all duration-200 min-h-[120px]"
        >
          <div className="w-12 h-12 rounded-full bg-gray-1 dark:bg-dark-3 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/10">
            <Icon 
              name="plus" 
              size="md" 
              className="text-body-color dark:text-dark-6 group-hover:text-primary transition-colors duration-200"
            />
          </div>
          <span className="text-sm text-body-color dark:text-dark-6 group-hover:text-primary transition-colors duration-200">
            {t('dashboard.work.addGroup', 'Добавить группу')}
          </span>
        </button>
      </div>
    </DataSection>
  );
};
