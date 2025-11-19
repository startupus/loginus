import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Input } from '../../primitives';
import { ProfileMenu } from './ProfileMenu';

export interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  showMobileMenuButton?: boolean;
  onMobileMenuClick?: () => void;
  userData?: {
    id: string;
    name: string;
    avatar?: string | null;
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
            
            {userData && <ProfileMenu userData={userData} onLogout={onLogout} />}
          </div>
        </div>
      </div>
    </header>
  );
};


