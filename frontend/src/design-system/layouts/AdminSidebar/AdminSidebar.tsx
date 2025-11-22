import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../primitives/Icon';
import { Logo } from '../../primitives/Logo';
import { Input } from '../../primitives/Input';
import { useSidebar } from '../../hooks/useSidebar';
import { useTheme } from '../../contexts';
import { useLanguageStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { changeLanguage } from '@/services/i18n/config';
import type { SidebarItem } from '../Sidebar/Sidebar';

export interface AdminSidebarProps {
  /**
   * Пункты меню
   */
  items: SidebarItem[];
  
  /**
   * Callback клика на пункт
   */
  onNavigate?: (path: string) => void;
  
  /**
   * Дополнительные классы
   */
  className?: string;
  showLogo?: boolean;
  showThemeSwitcher?: boolean;
  showLanguageSwitcher?: boolean;
}

/**
 * AdminSidebar - боковое меню для административной консоли
 * Отличается от обычного Sidebar цветовой схемой (более темный фон, другой акцентный цвет)
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  items,
  onNavigate,
  className = '',
  showLogo = true,
  showThemeSwitcher = true,
  showLanguageSwitcher = true,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentLang = useCurrentLanguage();
  const { language, setLanguage } = useLanguageStore();
  const { setThemeMode, isDark } = useTheme();
  const { isOpen, toggleSidebar, openDropdown, toggleDropdown } = useSidebar();
  
  // Блокировка скролла body когда сайдбар открыт на мобильных
  useEffect(() => {
    if (!isOpen) {
      if (window.innerWidth < 1280) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Цветовая схема для админки - более темный фон (slate-900) и акцентный цвет purple вместо blue
  
  return (
    <>
      <div
        className={`bg-slate-900 dark:bg-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.2)] fixed top-0 left-0 z-40 flex h-screen w-full max-w-[300px] flex-col justify-between overflow-y-scroll duration-200 xl:translate-x-0 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        } ${className}`}
      >
        <div>
          {showLogo && (
            <div className="px-10 pt-10 pb-6 border-b border-slate-700 dark:border-slate-800">
              <button 
                onClick={() => navigate(buildPathWithLang('/admin', currentLang))}
                className="cursor-pointer"
              >
                <Logo size="md" showText={true} />
              </button>
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 dark:text-purple-300">
                  {t('admin.sidebar.title', 'Админ-панель')}
                </span>
              </div>
            </div>
          )}
          
          {/* Поиск - видим только на мобильных устройствах (< xl) */}
          <div className="px-6 pb-4 xl:hidden border-b border-slate-700 dark:border-slate-800">
            <Input
              type="text"
              placeholder={t('common.search', 'Поиск...')}
              rightIcon={<Icon name="search" size="sm" className="text-slate-400 dark:text-slate-500" />}
            />
          </div>
          
          <nav className="mt-4">
            <ul>
              {items.map((item, index) => (
                <li key={item.path || index} className={item.children ? 'relative' : ''}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        if (item.path) {
                          onNavigate ? onNavigate(item.path) : navigate(item.path);
                        }
                        toggleDropdown(item.path);
                      } else {
                        // Обработка кастомных типов
                        if (item.type === 'external' && item.externalUrl) {
                          if (item.openInNewTab) {
                            window.open(item.externalUrl, '_blank');
                          } else {
                            window.location.href = item.externalUrl;
                          }
                        } else {
                          // Обычный переход
                          onNavigate ? onNavigate(item.path) : navigate(item.path);
                        }
                      }
                    }}
                    className={`text-slate-400 dark:text-slate-500 hover:bg-slate-800 dark:hover:bg-slate-900 relative flex w-full items-center border-l-4 border-transparent py-[10px] pr-4 pl-9 text-base font-medium duration-200 transition-all hover:translate-x-1 text-left ${
                      item.active ? 'bg-slate-800 dark:bg-slate-900 border-l-4 border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 text-purple-400 dark:text-purple-300' : ''
                    } ${
                      item.children && openDropdown === item.path && !item.active ? 'hover:bg-slate-800 dark:hover:bg-slate-900' : ''
                    } ${
                      item.children && openDropdown === item.path && item.active ? 'bg-slate-800 dark:bg-slate-900 border-l-4 border-purple-500 bg-purple-500/10 dark:bg-purple-500/20' : ''
                    }`}
                  >
                    {item.icon && (
                      <Icon 
                        name={item.icon} 
                        size="sm" 
                        className={`mr-3 flex-shrink-0 ${item.active ? 'text-purple-400 dark:text-purple-300' : 'text-slate-400 dark:text-slate-500'}`}
                      />
                    )}
                    <span className={`flex-1 text-left ${item.active ? 'text-purple-400 dark:text-purple-300' : ''}`}>{item.label}</span>
                    {item.children && (
                      <span
                        className={`flex-shrink-0 ml-2 transition-transform duration-200 ${
                          openDropdown === item.path ? 'rotate-0' : 'rotate-180'
                        }`}
                      >
                        <Icon 
                          name="chevron-down" 
                          size="sm" 
                          className={openDropdown === item.path ? 'text-purple-400 dark:text-purple-300' : 'text-slate-400 dark:text-slate-500'}
                        />
                      </span>
                    )}
                  </button>
                  {item.children && openDropdown === item.path && (
                    <ul className="py-[6px] pr-10 pl-[50px] bg-slate-800/50 dark:bg-slate-900/50 border-l-2 border-purple-500/50 ml-2">
                      {item.children.map((child, childIndex) => (
                        <li key={child.path || childIndex}>
                          <button
                            onClick={() => onNavigate ? onNavigate(child.path) : navigate(child.path)}
                            className={`text-slate-400 dark:text-slate-500 hover:bg-slate-800 dark:hover:bg-slate-900 flex w-full items-center border-l-4 border-transparent py-[9px] pl-2 pr-2 text-base font-medium duration-200 transition-all rounded-r-lg text-left ${
                              child.active ? 'bg-slate-800 dark:bg-slate-900 border-l-4 border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 text-purple-400 dark:text-purple-300' : ''
                            }`}
                          >
                            <span className={child.active ? 'text-purple-400 dark:text-purple-300' : ''}>{child.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-6 space-y-1 border-t border-slate-700 dark:border-slate-800">
          <button
            onClick={() => navigate(buildPathWithLang('/support', currentLang))}
            className="text-slate-400 dark:text-slate-500 hover:text-purple-400 dark:hover:text-purple-300 flex w-full items-center py-1.5 text-sm font-medium duration-200"
          >
            <Icon name="help-circle" size="sm" className="mr-3" />
            <span>{t('sidebar.help', 'Справка')}</span>
          </button>
          
          <button
            onClick={() => navigate(buildPathWithLang('/dashboard', currentLang))}
            className="text-slate-400 dark:text-slate-500 hover:text-purple-400 dark:hover:text-purple-300 flex w-full items-center py-1.5 text-sm font-medium duration-200"
          >
            <Icon name="user" size="sm" className="mr-3" />
            <span>{t('admin.sidebar.backToProfile', 'Вернуться в профиль')}</span>
          </button>
          
          <div className="border-slate-700 dark:border-slate-800 my-3 h-px"></div>
          
          <div className="flex items-center justify-between py-2">
            {showLanguageSwitcher && (
              <button
                onClick={async () => {
                  const newLang = language === 'ru' ? 'en' : 'ru';
                  setLanguage(newLang);
                  await changeLanguage(newLang);
                  const newPath = buildPathWithLang(window.location.pathname.replace(/^\/(ru|en)/, ''), newLang);
                  navigate(newPath);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 dark:text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-900 transition-all"
              >
                {language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
              </button>
            )}

            {showThemeSwitcher && (
              <button
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 dark:text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-900 transition-all"
                title={`Текущая тема: ${isDark ? 'dark' : 'light'}. Кликните для переключения`}
              >
                {isDark ? (
                  <Icon name="sun" size="sm" className="text-yellow-400" />
                ) : (
                  <Icon name="moon" size="sm" className="text-purple-400 dark:text-purple-300" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        onClick={toggleSidebar}
        className={`bg-slate-900/80 dark:bg-slate-950/80 fixed top-0 left-0 z-30 h-screen w-full xl:hidden transition-transform duration-200 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      />
    </>
  );
};

