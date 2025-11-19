import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon, Logo } from '../../primitives';
import { useSidebar } from '../../hooks/useSidebar';
import { useTheme } from '../../contexts';
import { useLanguageStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';

export interface SidebarItem {
  label: string;
  path: string;
  icon?: string;
  active?: boolean;
  children?: SidebarItem[];
}

export interface SidebarProps {
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
 * Sidebar - боковое меню в стилях дизайн-системы
 * Адаптивный дизайн для мобильных и десктопных устройств
 */
export const Sidebar: React.FC<SidebarProps> = ({
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
  
  return (
    <>
      <div
        className={`dark:bg-dark-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] fixed top-0 left-0 z-40 flex h-screen w-full max-w-[300px] flex-col justify-between overflow-y-scroll bg-white duration-200 xl:translate-x-0 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        } ${className}`}
      >
        <div>
          {showLogo && (
            <div className="px-10 pt-10 pb-9">
              <button 
                onClick={() => navigate(buildPathWithLang('/', currentLang))}
                className="cursor-pointer"
              >
                <Logo size="md" showText={true} />
              </button>
            </div>
          )}
          
          <nav>
            <ul>
              {items.map((item, index) => (
                <li key={item.path || index} className={item.children ? 'relative' : ''}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        toggleDropdown(item.path);
                      } else {
                        onNavigate ? onNavigate(item.path) : navigate(item.path);
                      }
                    }}
                    className={`text-body-color dark:text-dark-6 hover:border-primary hover:bg-primary/5 relative flex w-full items-center border-r-4 border-transparent py-[10px] pr-4 pl-9 text-base font-medium duration-200 transition-all hover:translate-x-1 text-left ${
                      // Активный пункт - синяя полоска справа
                      item.active ? '!border-primary bg-primary/5' : ''
                    } ${
                      // Развернутый пункт (с подменю) - только фон, без синей полоски если не активный
                      item.children && openDropdown === item.path && !item.active ? '!bg-primary/10 dark:!bg-primary/20' : ''
                    } ${
                      // Развернутый И активный - и фон, и синяя полоска
                      item.children && openDropdown === item.path && item.active ? '!bg-primary/10 dark:!bg-primary/20' : ''
                    }`}
                  >
                    {item.icon && (
                      <Icon 
                        name={item.icon} 
                        size="sm" 
                        className="mr-3 flex-shrink-0"
                      />
                    )}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.children && (
                      <span
                        className={`flex-shrink-0 ml-2 transition-transform duration-200 ${
                          openDropdown === item.path ? 'rotate-0' : 'rotate-180'
                        }`}
                      >
                        <Icon 
                          name="chevron-down" 
                          size="sm" 
                          className={`${
                            openDropdown === item.path ? 'text-primary' : 'text-body-color dark:text-dark-6'
                          }`}
                        />
                      </span>
                    )}
                  </button>
                  {item.children && openDropdown === item.path && (
                    <ul className="py-[6px] pr-10 pl-[50px] bg-gray-1 dark:bg-dark-3 border-l-2 border-primary/30 dark:border-primary/40 ml-2">
                      {item.children.map((child, childIndex) => (
                        <li key={child.path || childIndex}>
                          <button
                            onClick={() => onNavigate ? onNavigate(child.path) : navigate(child.path)}
                            className={`text-body-color dark:text-dark-6 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 flex w-full items-center border-r-4 border-transparent py-[9px] pl-2 pr-2 text-base font-medium duration-200 transition-all rounded-r-lg text-left ${
                              child.active ? '!border-primary bg-primary/10 dark:bg-primary/20' : ''
                            }`}
                          >
                            <span className="text-left">{child.label}</span>
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

        <div className="p-6 space-y-3">
          <button
            onClick={() => navigate(buildPathWithLang('/support', currentLang))}
            className="text-body-color dark:text-dark-6 hover:text-primary flex w-full items-center py-2 text-sm font-medium duration-200"
          >
            <Icon name="help-circle" size="sm" className="mr-3" />
            <span>{t('sidebar.help', 'Справка')}</span>
          </button>
          
          <button
            onClick={() => window.open('https://loginus.ru', '_blank')}
            className="text-body-color dark:text-dark-6 hover:text-primary flex w-full items-center py-2 text-sm font-medium duration-200"
          >
            <Icon name="external-link" size="sm" className="mr-3" />
            <span>{t('sidebar.loginusIdSite', 'Loginus ID для сайта')}</span>
          </button>
          
          <div className="bg-stroke dark:bg-dark-3 my-3 h-px"></div>
          
          <div className="flex items-center justify-between py-2">
            {showLanguageSwitcher && (
              <button
                onClick={() => {
                  const newLang = language === 'ru' ? 'en' : 'ru';
                  setLanguage(newLang);
                  const newPath = buildPathWithLang(window.location.pathname.replace(/^\/(ru|en)/, ''), newLang);
                  navigate(newPath);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3 transition-all"
              >
                {language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
              </button>
            )}

            {showThemeSwitcher && (
              <button
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3 transition-all"
                title={`Текущая тема: ${isDark ? 'dark' : 'light'}. Кликните для переключения`}
              >
                {isDark ? (
                  <Icon name="sun" size="sm" className="text-yellow-400" />
                ) : (
                  <Icon name="moon" size="sm" className="text-primary" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        onClick={toggleSidebar}
        className={`bg-dark/80 fixed top-0 left-0 z-30 h-screen w-full xl:hidden transition-transform duration-200 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      />
    </>
  );
};
