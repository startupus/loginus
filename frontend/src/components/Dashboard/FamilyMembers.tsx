import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, Icon, Badge } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';
import { getInitials } from '../../utils/stringUtils';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
}

export interface FamilyMembersProps {
  members: FamilyMember[];
  onAddMember?: () => void;
  onMemberClick?: (member: FamilyMember) => void;
}

/**
 * FamilyMembers - компактные горизонтальные карточки членов семьи
 */
export const FamilyMembers: React.FC<FamilyMembersProps> = ({
  members,
  onAddMember,
  onMemberClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  
  const handleViewAll = () => {
    navigate(buildPathWithLang('/family', currentLang));
  };
  
  const getRoleBadge = (role: string) => {
    if (role === 'owner') {
      return <Badge variant="primary" size="sm">{t('dashboard.family.owner', 'Владелец')}</Badge>;
    }
    return null;
  };
  
  return (
    <DataSection
      id="family"
      title={t('dashboard.family.title', 'Семья')}
      action={
        <button
          onClick={handleViewAll}
          className="text-sm text-body-color dark:text-dark-6 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1"
        >
          <span>{t('dashboard.family.manage', 'Управление')}</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((member, index) => (
          <button
            key={member.id}
            onClick={() => onMemberClick?.(member)}
            className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-gray-3 dark:hover:border-dark-4 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Аватар */}
            <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Avatar
                src={member.avatar || undefined}
                initials={getInitials(member.name)}
                size="md"
                rounded
                showStatus
                status={(member as any).isOnline ? 'online' : 'offline'}
              />
            </div>
            
            {/* Имя и роль */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-dark dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200 truncate">
                {member.name}
              </p>
              {member.role === 'owner' && (
                <div className="mt-1">
                  {getRoleBadge(member.role)}
                </div>
              )}
            </div>
            
            {/* Стрелка */}
            <Icon 
              name="chevron-right" 
              size="sm" 
              className="text-body-color dark:text-dark-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
            />
          </button>
        ))}
        
        {/* Кнопка добавить */}
        <button
          onClick={onAddMember}
          className="group flex items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-dark-2 border-2 border-dashed border-stroke dark:border-dark-3 hover:border-primary dark:hover:border-primary transition-all duration-200"
        >
          <Icon 
            name="plus" 
            size="sm" 
            className="text-body-color dark:text-dark-6 group-hover:text-primary transition-colors duration-200"
          />
          <span className="text-sm text-body-color dark:text-dark-6 group-hover:text-primary transition-colors duration-200">
            {t('dashboard.family.add', 'Добавить')}
          </span>
        </button>
      </div>
    </DataSection>
  );
};
