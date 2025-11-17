import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Icon } from '../../primitives';
import { useTheme } from '../../contexts';
import { getInitials } from '@/utils/stringUtils';

export interface HeaderProps {
  /**
   * Имя пользователя
   */
  userName?: string;
  
  /**
   * Avatar URL
   */
  userAvatar?: string;
  
  /**
   * Callback выхода
   */
  onLogout?: () => void;
  
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
   * Callback смены темы (deprecated - используется useTheme автоматически)
   */
  onThemeChange?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  userAvatar,
  onLogout,
  onLanguageChange,
  currentLanguage = 'ru',
  showThemeSwitcher = true,
}) => {
  const navigate = useNavigate();
  const { isDark, setThemeMode, themeMode } = useTheme();

  const handleThemeToggle = () => {
    if (themeMode === 'system') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  const getThemeLabel = () => {
    if (themeMode === 'system') return 'Авто';
    if (themeMode === 'dark') return 'Темная';
    return 'Светлая';
  };

  return (
    <header className="bg-white dark:bg-dark-2 border-b border-secondary-200 dark:border-dark-3 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-semibold text-secondary-900 dark:text-white">
              Loginus ID
            </span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            {onLanguageChange && (
              <Button variant="ghost" size="sm" onClick={onLanguageChange}>
                {currentLanguage === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
              </Button>
            )}

            {/* Theme Switcher */}
            {showThemeSwitcher && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                leftIcon={<Icon name={isDark ? 'moon' : 'sun'} size="sm" />}
                title={`Текущая тема: ${getThemeLabel()}. Нажмите для переключения`}
              >
                <span className="hidden sm:inline">{getThemeLabel()}</span>
              </Button>
            )}

            {/* User Profile */}
            {userName && (
              <div className="flex items-center gap-3">
                <Avatar
                  src={userAvatar}
                  initials={getInitials(userName)}
                  size="sm"
                  rounded
                />
                <span className="text-sm font-medium text-secondary-700 dark:text-dark-6">
                  {userName}
                </span>
              </div>
            )}

            {/* Logout */}
            {onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Выйти
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

