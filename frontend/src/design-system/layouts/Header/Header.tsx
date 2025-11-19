import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// Прямые импорты для tree-shaking
import { Icon } from '../../primitives/Icon';
import { Input } from '../../primitives/Input';
import { ProfileMenu } from './ProfileMenu';
import { ProfilePopup } from '../../composites/ProfilePopup';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { useAuthStore } from '@/store';

export interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  showMobileMenuButton?: boolean;
  onMobileMenuClick?: () => void;
  userData?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    login?: string;
    avatar?: string | null;
    unreadMail?: number;
    plusActive?: boolean;
    plusPoints?: number;
    gamePoints?: number; // Количество морковок (игровых баллов)
  };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  actions,
  showSearch = true,
  showMobileMenuButton = false,
  onMobileMenuClick,
  userData,
  onLogout,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  const { logout } = useAuthStore();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  
  const handleLogout = () => {
    logout();
    onLogout?.();
    setIsProfilePopupOpen(false);
  };

  const handleEdit = () => {
    navigate(buildPathWithLang('/personal', currentLang));
  };
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-2 dark:bg-dark/80 dark:border-dark-3 sticky xl:static top-0 z-30">
      <div className="w-full">
        <div className="relative flex items-center justify-between py-4 px-4 xl:px-6">
          <div className="flex items-center gap-4">
            {showMobileMenuButton && (
              <button
                onClick={onMobileMenuClick}
                className="border-stroke text-dark hover:bg-gray dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-dark-3 flex h-[46px] w-[46px] items-center justify-center rounded-lg border bg-white xl:hidden dark:text-white"
              >
                <Icon name="menu" size="md" />
              </button>
            )}
            
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
                {title}
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {showSearch && (
              <div className="relative w-[200px] sm:w-[300px]">
                <Input
                  type="text"
                  placeholder={t('common.search', 'Поиск...')}
                  className="!py-2"
                  rightIcon={<Icon name="search" size="sm" className="text-body-color dark:text-dark-6" />}
                />
              </div>
            )}
            
            {actions}
            
            {/* Колокольчик с событиями */}
            {userData && (
              <button
                onClick={() => {
                  // TODO: открыть панель уведомлений
                }}
                className="relative p-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors duration-200 group"
                aria-label={t('header.notifications', 'Уведомления')}
              >
                <Icon name="bell" size="md" className="text-body-color dark:text-dark-6 group-hover:text-primary dark:group-hover:text-primary transition-colors" />
                {/* Индикатор непрочитанных */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border-2 border-white dark:border-dark-2"></span>
              </button>
            )}
            
            {userData && (
              <>
                <ProfileMenu 
                  userData={{
                    id: userData.id,
                    name: userData.name,
                    phone: userData.phone,
                    email: userData.email,
                    login: userData.login,
                    avatar: userData.avatar,
                    unreadMail: userData.unreadMail,
                    plusActive: userData.plusActive,
                    plusPoints: userData.plusPoints,
                    gamePoints: userData.gamePoints,
                  }} 
                  onLogout={onLogout}
                  onSwitchAccount={() => {
                    handleLogout();
                  }}
                />
                <button
                  ref={avatarButtonRef}
                  onClick={() => setIsProfilePopupOpen(true)}
                  className="hidden"
                  aria-label={t('profile.menu', 'Меню профиля')}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Popup */}
      {userData && (
        <ProfilePopup
          isOpen={isProfilePopupOpen}
          onClose={() => setIsProfilePopupOpen(false)}
          user={{
            id: userData.id,
            name: userData.name,
            phone: userData.phone || '',
            email: userData.email,
            login: userData.login,
            avatar: userData.avatar,
            unreadMail: userData.unreadMail,
            plusActive: userData.plusActive,
            plusPoints: userData.plusPoints,
          }}
          onSwitchAccount={handleLogout}
          onEdit={handleEdit}
          anchorRef={avatarButtonRef}
        />
      )}
    </header>
  );
};


