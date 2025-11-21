import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Icon } from '../../design-system/primitives';
import { getInitials } from '../../utils/stringUtils';
import { ProfileCardMenu } from './ProfileCardMenu';

export interface ProfileCardProps {
  user: {
    name: string;
    phone: string;
    email?: string;
    avatar?: string | null;
    balance?: number;
    gamePoints?: number;
    achievements?: number;
  };
  onEdit?: () => void;
  onPersonalData?: () => void;
  onEditAvatar?: () => void;
  onPhone?: () => void;
}

/**
 * ProfileCard - карточка профиля пользователя на Dashboard
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onEdit,
  onPersonalData,
  onEditAvatar,
  onPhone,
}) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  
  return (
    <div className="bg-white dark:bg-dark-2 rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="transition-transform duration-300 hover:scale-110">
        <Avatar
          src={user.avatar || undefined}
          initials={getInitials(user.name)}
          name={user.name}
          size="lg"
          rounded
          showStatus
          status="online"
        />
        </div>
        
        <div className="flex-1 relative">
          {/* ФИО, баланс, баллы в одну строчку */}
          <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                {user.name}
              </h2>
              <Button
                ref={editButtonRef}
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => setIsMenuOpen(true)}
                aria-label={t('profile.edit', 'Редактировать')}
              >
                <Icon name="edit" size="sm" />
              </Button>
            </div>
            
            {/* Баланс и баллы в строчку */}
            <div className="flex items-center gap-4">
              {/* Баланс */}
              <div className="flex items-center gap-2">
                <Icon name="wallet" size="sm" className="text-primary" />
                <span className="text-base font-semibold text-text-primary">
                  {user.balance !== undefined ? `${user.balance.toLocaleString('ru-RU')} ₽` : '—'}
                </span>
              </div>

              {/* Игровые баллы (морковки) */}
              <div className="flex items-center gap-2">
                <span className="text-lg">🥕</span>
                <span className="text-base font-semibold text-text-primary">
                  {user.gamePoints !== undefined ? user.gamePoints.toLocaleString('ru-RU') : '—'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">
                {user.phone}
              </p>
              {user.email && (
                <p className="text-sm text-text-secondary">
                  {user.email}
                </p>
              )}
            </div>
            <Link 
              to="/promo/profiles" 
              className="text-xs text-text-secondary hover:text-primary transition-colors duration-200"
            >
              {t('dashboard.mergeAccounts', 'Объединить аккаунты')}
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Card Menu */}
      <ProfileCardMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={editButtonRef}
        user={{ phone: user.phone }}
        onPersonalData={onPersonalData || onEdit}
        onEditAvatar={onEditAvatar}
        onPhone={onPhone}
      />
    </div>
  );
};

