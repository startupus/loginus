import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Прямые импорты для tree-shaking
import { Button } from '../../primitives/Button';
import { Avatar } from '../../primitives/Avatar';
import { Icon } from '../../primitives/Icon';
import { Logo } from '../../primitives/Logo';
// Lazy load ProfilePopup - загружается только при открытии (оптимизация первой загрузки)
const ProfilePopup = lazy(() => import('../../composites/ProfilePopup').then(m => ({ default: m.ProfilePopup })));
import { useTheme } from '../../contexts';
import { getInitials } from '@/utils/stringUtils';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';

export interface LandingHeaderProps {
  /**
   * Callback смены языка
   */
  onLanguageChange?: () => void;
  
  /**
   * Текущий язык
   */
  currentLanguage?: 'ru' | 'en';
  
  /**
   * Показать переключатель темы
   */
  showThemeSwitcher?: boolean;
  
  /**
   * Показать кнопку входа (для неавторизованных)
   */
  showLoginButton?: boolean;
  
  /**
   * Callback при клике на кнопку входа
   */
  onLoginClick?: () => void;
  
  /**
   * Имя пользователя (для авторизованных)
   */
  userName?: string;
  
  /**
   * Avatar URL (для авторизованных)
   */
  userAvatar?: string;
  
  /**
   * Callback выхода
   */
  onLogout?: () => void;
  
  /**
   * Данные пользователя для ProfilePopup
   */
  userData?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    login?: string;
    avatar?: string | null;
    unreadMail?: number;
    plusActive?: boolean;
    plusPoints?: number;
  };
  
  /**
   * Навигационные ссылки
   */
  navItems?: Array<{
    label: string;
    href: string;
  }>;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * LandingHeader - компонент хедера для публичных страниц (landing page)
 * Используется на главной странице и других публичных страницах
 */
export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onLanguageChange,
  currentLanguage = 'ru',
  showThemeSwitcher = true,
  showLoginButton = true,
  onLoginClick,
  userName,
  userAvatar,
  onLogout,
  userData,
  navItems = [
    { label: 'О Loginus ID', href: '/#about' },
    { label: 'Возможности', href: '/#features' },
    { label: 'FAQ', href: '/#faq' },
  ],
  className = '',
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const currentLang = useCurrentLanguage();

  const handleThemeToggle = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate(buildPathWithLang('/auth', currentLang));
    }
  };

  const isAuthenticated = !!userName;

  return (
    <>
    <header className={`fixed left-0 top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-2 dark:bg-dark/80 dark:border-dark-3 ${className}`}>
        <div className="container mx-auto">
          <div className="relative flex items-center justify-between py-4 px-4">
            {/* Logo - используем компонент из дизайн-системы */}
            <Logo size="md" showText={true} />
          
          {/* Nav + Actions */}
          <div className="flex items-center gap-8">
            {/* Navigation */}
            {navItems.length > 0 && (
              <nav className="hidden lg:block">
                <ul className="flex items-center gap-8">
                  {navItems.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        className="text-base font-medium text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              {onLanguageChange && (
                <Button variant="ghost" size="sm" onClick={onLanguageChange}>
                  {currentLanguage === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
                </Button>
              )}

              {/* Theme Switcher */}
              {showThemeSwitcher && (
                <button
                  onClick={handleThemeToggle}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3 transition-all"
                  title={`Текущая тема: ${themeMode}. Кликните для переключения`}
                >
                  {isDark ? (
                    <Icon name="sun" size="sm" className="text-yellow-400" />
                  ) : (
                    <Icon name="moon" size="sm" className="text-primary" />
                  )}
                </button>
              )}
              
              {/* User Avatar (авторизованный) или Login Button (неавторизованный) */}
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfilePopupOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Avatar
                    src={userAvatar}
                    initials={getInitials(userName)}
                    size="sm"
                    rounded
                  />
                  <span className="hidden sm:inline text-sm font-medium text-dark dark:text-white">
                    {userName}
                  </span>
                </Button>
              ) : (
                showLoginButton && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleLogin}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    }
                  >
                    {t('common.login', 'Войти')}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Profile Popup для авторизованных пользователей - lazy loaded для оптимизации */}
    {isAuthenticated && userData && isProfilePopupOpen && (
      <Suspense fallback={null}>
        <ProfilePopup
          isOpen={isProfilePopupOpen}
          onClose={() => setIsProfilePopupOpen(false)}
          user={userData}
          onSwitchAccount={() => {
            onLogout?.();
            navigate(buildPathWithLang('/auth', currentLang));
          }}
        />
      </Suspense>
    )}
    </>
  );
};

