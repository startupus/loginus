import React, { useState, useRef, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// Прямые импорты для tree-shaking
import { Icon } from '../../primitives/Icon';
import { Input } from '../../primitives/Input';
import { ProfileMenu } from './ProfileMenu';
// Lazy load ProfilePopup - загружается только при открытии (оптимизация первой загрузки)
const ProfilePopup = lazy(() => import('../../composites/ProfilePopup').then(m => ({ default: m.ProfilePopup })));
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { useAuthStore } from '@/store';
import { useTheme } from '../../contexts/ThemeContext';
import { themeClasses } from '../../utils/themeClasses';
import { LanguageSwitcher } from '../../composites/LanguageSwitcher';

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
    navigate(buildPathWithLang('/data', currentLang));
  };
  
  return (
    <header className={`bg-background/95 dark:bg-dark-2/95 backdrop-blur-lg ${themeClasses.border.bottom} sticky xl:static top-0 z-30`}>
      <div className="w-full">
        <div className="relative flex items-center justify-between py-4 px-4 xl:px-6">
          <div className="flex items-center gap-4">
            {showMobileMenuButton && (
              <button
                onClick={onMobileMenuClick}
                className={`${themeClasses.border.default} ${themeClasses.text.primary} hover:bg-gray-1 dark:hover:bg-dark-3 flex h-[46px] w-[46px] items-center justify-center rounded-lg border ${themeClasses.background.surface} xl:hidden`}
              >
                <Icon name="menu" size="md" />
              </button>
            )}
            
            {title && (
              <h1 className={`text-xl sm:text-2xl font-bold ${themeClasses.text.primary}`}>
                {title}
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Поиск скрыт на мобильных (xl), отображается на десктопе */}
            {showSearch && (
              <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="relative w-[200px] sm:w-[300px] m-0 p-0 hidden xl:block">
                {/* Скрытое поле-обманка для браузера */}
                <input type="text" name="fake-email" autoComplete="off" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} tabIndex={-1} />
                <Input
                  type="search"
                  name="q"
                  id="header-search-input"
                  placeholder={t('common.search', { defaultValue: 'Search...' })}
                  rightIcon={<Icon name="search" size="sm" className={themeClasses.text.secondary} />}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-dashlane-ignore="true"
                  data-bitwarden-ignore="true"
                  role="searchbox"
                  aria-label="Search"
                  onFocus={(e) => {
                    // Очищаем поле при фокусе, если там что-то автозаполнилось
                    const target = e.target as HTMLInputElement;
                    if (target.value && (target.value.includes('@') || target.value.includes('mail'))) {
                      target.value = '';
                    }
                  }}
                  onInput={(e) => {
                    // Очищаем поле при вводе, если там что-то автозаполнилось
                    const target = e.target as HTMLInputElement;
                    if (target.value && (target.value.includes('@') || target.value.includes('mail'))) {
                      target.value = '';
                    }
                  }}
                />
              </form>
            )}
            
            {actions}
            
            {/* Переключатель языка - видим на десктопе */}
            {/* <div className="hidden xl:block">
              <LanguageSwitcher variant="compact" />
            </div> */}
            
            {/* Колокольчик с событиями - скрыт на мобильных, показан на десктопе */}
            {userData && (
              <button
                onClick={() => {
                  // TODO: открыть панель уведомлений
                }}
                className="relative p-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors duration-200 group hidden xl:block"
                aria-label={t('header.notifications', { defaultValue: 'Notifications' })}
              >
                <Icon name="bell" size="md" className={`${themeClasses.text.secondary} group-hover:text-primary transition-colors`} />
                {/* Индикатор непрочитанных */}
                <span className={`absolute top-1 right-1 w-2 h-2 bg-error rounded-full border-2 ${themeClasses.background.default} dark:border-dark-2`}></span>
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
                  aria-label={t('profile.menu', { defaultValue: 'Profile menu' })}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Popup - lazy loaded для оптимизации первой загрузки */}
      {userData && isProfilePopupOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}
    </header>
  );
};


