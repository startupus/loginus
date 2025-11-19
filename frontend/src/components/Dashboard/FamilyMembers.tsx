import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';
import { getInitials } from '../../utils/stringUtils';

export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
}

export interface FamilyMembersProps {
  members: FamilyMember[];
  onAddMember?: () => void;
}

/**
 * FamilyMembers - список членов семьи
 */
export const FamilyMembers: React.FC<FamilyMembersProps> = ({
  members,
  onAddMember,
}) => {
  const { t } = useTranslation();
  
  return (
    <DataSection
      id="family"
      title={t('dashboard.family.title', 'Семья')}
      viewAllLink="/family"
    >
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="group flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-gray-1 dark:bg-dark-3 cursor-pointer hover:bg-gray-2 dark:hover:bg-dark-4 transition-all duration-200 hover:scale-105 hover:shadow-md"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
            <Avatar
              src={member.avatar || undefined}
              initials={getInitials(member.name)}
              size="sm"
              rounded
            />
            </div>
            <span className="text-sm font-medium text-dark dark:text-white transition-colors duration-200 group-hover:text-primary">
              {member.name}
            </span>
          </div>
        ))}
        
        <Button
          variant="outline"
          className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary"
          onClick={onAddMember}
        >
          <Icon name="users" size="sm" className="transition-transform duration-200 group-hover:scale-110" />
          <span className="transition-colors duration-200 group-hover:text-primary">{t('dashboard.family.add', 'Добавить')}</span>
        </Button>
      </div>
    </DataSection>
  );
};

