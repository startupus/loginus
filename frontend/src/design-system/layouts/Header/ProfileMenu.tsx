import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Icon } from '../../primitives';
import { useProfileMenu } from '../../hooks/useProfileMenu';
import { getInitials } from '@/utils/stringUtils';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';

export interface ProfileMenuProps {
  userData: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  onLogout?: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ userData, onLogout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  const { isOpen, toggleMenu, closeMenu, menuRef } = useProfileMenu();

  // Получаем инициалы из имени, если имя валидное
  const initials = userData.name && userData.name.trim() !== '' 
    ? getInitials(userData.name) 
    : '';

  // Определяем, есть ли валидный src для аватара
  const avatarSrc = userData.avatar && userData.avatar !== null && userData.avatar.trim() !== '' 
    ? userData.avatar 
    : undefined;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="group !p-1 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-dark"
        aria-label={t('profile.menu', 'Меню профиля')}
      >
        <Avatar
          src={avatarSrc}
          initials={initials}
          size="lg"
          rounded
          showStatus
          status="online"
          className="ring-2 ring-transparent group-hover:ring-primary dark:group-hover:ring-primary transition-all duration-300 group-hover:shadow-lg"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-[220px] bg-white dark:bg-dark-2 rounded-xl shadow-card-2 border border-gray-2 dark:border-dark-3 z-50 overflow-hidden animate-in">
          {/* Градиентный фон для меню */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-1/50 dark:from-dark-2 dark:via-dark-2 dark:to-dark-3/30 pointer-events-none"></div>
          
          <div className="relative p-1.5 space-y-0.5">
            <button
              onClick={() => {
                navigate(buildPathWithLang('/dashboard', currentLang));
                closeMenu();
              }}
              className="group relative w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-body-color dark:text-dark-6 transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary dark:hover:from-primary/20 dark:hover:to-primary/10"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-200">
                <Icon name="user" size="sm" className="text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
              <span className="flex-1 text-left">{t('profile.profile', 'Профиль')}</span>
              <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-primary" />
            </button>
            
            <button
              onClick={() => {
                navigate(buildPathWithLang('/personal/documents', currentLang));
                closeMenu();
              }}
              className="group relative w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-body-color dark:text-dark-6 transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary dark:hover:from-primary/20 dark:hover:to-primary/10"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-200">
                <Icon name="settings" size="sm" className="text-primary group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className="flex-1 text-left">{t('profile.settings', 'Настройки')}</span>
              <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-primary" />
            </button>
            
            <div className="bg-stroke dark:bg-dark-3 my-2 h-px mx-2"></div>
            
            <button
              onClick={() => {
                onLogout?.();
                closeMenu();
              }}
              className="group relative w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-body-color dark:text-dark-6 transition-all duration-200 hover:bg-gradient-to-r hover:from-error/10 hover:to-error/5 hover:text-error dark:hover:from-error/20 dark:hover:to-error/10"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-error/10 dark:bg-error/20 group-hover:bg-error/20 dark:group-hover:bg-error/30 transition-colors duration-200">
                <Icon name="log-out" size="sm" className="text-error group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>
              <span className="flex-1 text-left">{t('auth.logout', 'Выйти')}</span>
              <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-error" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


