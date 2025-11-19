import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Icon } from '../../design-system/primitives';
import { getInitials } from '../../utils/stringUtils';

export interface ProfileCardProps {
  user: {
    name: string;
    phone: string;
    email?: string;
    avatar?: string | null;
  };
  onEdit?: () => void;
}

/**
 * ProfileCard - карточка профиля пользователя на Dashboard
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onEdit,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-dark-2 rounded-xl shadow-1 dark:shadow-card p-4 sm:p-6 mb-6 transition-all duration-300 hover:shadow-3 hover:-translate-y-1 dark:hover:shadow-3">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="transition-transform duration-300 hover:scale-110">
        <Avatar
          src={user.avatar || undefined}
          initials={getInitials(user.name)}
          size="lg"
          rounded
          showStatus
          status="online"
        />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              {user.name}
            </h2>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="!p-1"
              >
                <Icon name="edit" size="sm" />
              </Button>
            )}
          </div>
          
          <div className="space-y-1 mb-4">
            <p className="text-sm text-body-color dark:text-dark-6">
              {user.phone}
            </p>
            {user.email && (
              <p className="text-sm text-body-color dark:text-dark-6">
                {user.email}
              </p>
            )}
          </div>
          
          <Link to="/promo/profiles" className="inline-block">
            <Button variant="primary" size="sm" className="transition-all duration-200 hover:scale-105">
              {t('dashboard.mergeAccounts', 'Объединить аккаунты')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

