import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Прямые импорты для tree-shaking
import { Icon } from '../../primitives/Icon';
import { Logo } from '../../primitives/Logo';
import { Input } from '../../primitives/Input';
import { useSidebar } from '../../hooks/useSidebar';
import { useTheme } from '../../contexts';
import { useLanguageStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { themeClasses } from '../../utils/themeClasses';
import { LanguageSwitcher } from '../../composites/LanguageSwitcher';

export interface SidebarItem {
  label: string;
  path: string;
  navigationPath?: string; // Путь для фактической навигации (если отличается от path для иерархии)
  icon?: string;
  active?: boolean;
  children?: SidebarItem[];
  // Кастомные типы пунктов меню
  type?: 'default' | 'external' | 'iframe' | 'embedded';
  // Для external
  externalUrl?: string;
  openInNewTab?: boolean;
  // Для iframe
  iframeUrl?: string;
  iframeCode?: string;
  // Для embedded
  embeddedAppUrl?: string;
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
  const { setThemeMode, isDark } = useTheme();
  const { isOpen, toggleSidebar, openDropdown, toggleDropdown } = useSidebar();
  
  // Автоматическое открытие дропдауна, если один из дочерних пунктов активен
  useEffect(() => {
    const activeParentItem = items.find(item => 
      item.children && item.children.some(child => child.active)
    );
    if (activeParentItem && activeParentItem.path && openDropdown !== activeParentItem.path) {
      // Используем setTimeout чтобы избежать конфликта с инициализацией
      setTimeout(() => {
        toggleDropdown(activeParentItem.path);
      }, 0);
    }
  }, [items, openDropdown, toggleDropdown]);
  
  // Блокировка скролла body когда сайдбар открыт на мобильных
  useEffect(() => {
    if (!isOpen) {
      // Сайдбар открыт на мобильных (isOpen = false означает открыт)
      // Блокируем скролл body только на мобильных устройствах (< xl)
      if (window.innerWidth < 1280) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Сайдбар закрыт - разблокируем скролл
      document.body.style.overflow = '';
    }
    
    // Cleanup при размонтировании компонента
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <>
      <div
        className={`${themeClasses.card.shadow} shadow-[0_2px_8px_rgba(0,0,0,0.08)] fixed top-0 left-0 z-40 flex h-screen w-full max-w-[300px] flex-col justify-between overflow-hidden duration-200 xl:translate-x-0 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        } ${className}`}
      >
        <div className="flex-1 overflow-y-auto">
          {showLogo && (
            <div className="px-10 pt-10 pb-6">
              <button 
                onClick={() => navigate(buildPathWithLang('/', currentLang))}
                className="cursor-pointer"
              >
                <Logo size="md" showText={true} />
              </button>
            </div>
          )}
          
          {/* Поиск - видим только на мобильных устройствах (< xl) */}
          <div className="px-6 pb-4 xl:hidden">
            <Input
              type="text"
              placeholder={t('common.search', { defaultValue: 'Search...' })}
              rightIcon={<Icon name="search" size="sm" className={themeClasses.text.secondary} />}
            />
          </div>
          
          <nav>
            <ul>
              {items.map((item, index) => (
                <li key={item.path || index} className={item.children ? 'relative' : ''}>
                  <div className={`flex w-full items-center group hover:border-primary hover:bg-primary/5 border-r-4 border-transparent transition-all duration-200 ${
                    // Активный пункт - синяя полоска справа
                    item.active ? '!border-primary bg-primary/5' : ''
                  } ${
                    // Развернутый пункт (с подменю) - только фон, без синей полоски если не активный
                    item.children && openDropdown === item.path && !item.active ? '!bg-primary/10 dark:!bg-primary/20' : ''
                  } ${
                    // Развернутый И активный - и фон, и синяя полоска
                    item.children && openDropdown === item.path && item.active ? '!bg-primary/10 dark:!bg-primary/20' : ''
                  }`}>
                    <button
                      onClick={() => {
                        // При клике на кнопку всегда делаем переход (если есть path)
                        // Дропдаун открывается только при клике на стрелочку
                        if (item.type === 'external' && item.externalUrl) {
                          if (item.openInNewTab) {
                            window.open(item.externalUrl, '_blank');
                          } else {
                            window.location.href = item.externalUrl;
                          }
                        } else {
                          // Обычный переход - используем navigationPath, если есть, иначе path
                          const targetPath = item.navigationPath || item.path;
                          if (targetPath) {
                            onNavigate ? onNavigate(targetPath) : navigate(targetPath);
                          }
                        }
                      }}
                      className={`${themeClasses.text.secondary} dark:text-dark-6 group-hover:text-primary relative flex flex-1 items-center py-[10px] pr-2 pl-9 text-base font-medium duration-200 transition-all text-left`}
                    >
                      {item.icon && (
                        <Icon 
                          name={item.icon} 
                          size="sm" 
                          className="mr-3 flex-shrink-0"
                        />
                      )}
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                    {item.children && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Клик на стрелочку - только раскрытие/закрытие подменю
                          toggleDropdown(item.path);
                        }}
                        className={`flex-shrink-0 ml-1 mr-2 p-1 rounded transition-colors duration-200 group-hover:text-primary ${
                          openDropdown === item.path 
                            ? 'text-primary bg-primary/10' 
                            : `${themeClasses.text.secondary} dark:text-dark-6`
                        }`}
                      >
                        <Icon 
                          name="chevron-down" 
                          size="sm" 
                          className={`transition-transform duration-200 ${
                            openDropdown === item.path ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {item.children && openDropdown === item.path && (
                    <ul className={`py-[6px] pr-0 pl-0 ml-0 ${themeClasses.background.gray2}`}>
                      {item.children.map((child, childIndex) => (
                        <li key={child.path || childIndex} className="w-full">
                          <button
                            onClick={() => {
                              // Используем navigationPath, если есть, иначе path
                              const targetPath = child.navigationPath || child.path;
                              onNavigate ? onNavigate(targetPath) : navigate(targetPath);
                            }}
                            className={`${themeClasses.text.secondary} dark:text-dark-6 hover:border-primary hover:bg-primary/5 hover:text-primary flex w-full items-center border-r-4 border-transparent py-[10px] pl-9 pr-2 text-base font-medium duration-200 transition-all text-left ${
                              child.active ? '!border-primary bg-primary/5' : ''
                            }`}
                          >
                            {child.icon && (
                              <Icon 
                                name={child.icon} 
                                size="sm" 
                                className="mr-3 flex-shrink-0"
                              />
                            )}
                            <span className="flex-1 text-left">{child.label}</span>
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

        <div className="p-6 space-y-1">
          <button
            onClick={() => navigate(buildPathWithLang('/help', currentLang))}
            className={`${themeClasses.text.secondary} dark:text-dark-6 hover:text-primary flex w-full items-center py-1.5 text-sm font-medium duration-200`}
          >
            <Icon name="help-circle" size="sm" className="mr-3" />
            <span>{t('sidebar.help')}</span>
          </button>
          
          <button
            onClick={() => window.open('https://loginus.ru', '_blank')}
            className={`${themeClasses.text.secondary} dark:text-dark-6 hover:text-primary flex w-full items-center py-1.5 text-sm font-medium duration-200`}
          >
            <Icon name="globe" size="sm" className="mr-3" />
            <span>{t('sidebar.loginusIdSite')}</span>
          </button>
          
          <div className={`${themeClasses.background.gray2} my-3 h-px`}></div>
          
          <div className="flex items-center justify-between py-2">
            {showLanguageSwitcher && (
              <LanguageSwitcher variant="compact" />
            )}

            {showThemeSwitcher && (
              <button
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.text.primary} hover:bg-gray-2 dark:hover:bg-dark-3 transition-all`}
                title={t('common.theme.toggle', {
                  mode: isDark
                    ? t('common.theme.mode.dark', { defaultValue: 'dark' })
                    : t('common.theme.mode.light', { defaultValue: 'light' }),
                  defaultValue: `Current theme: ${isDark ? 'dark' : 'light'}. Click to switch`,
                })}
              >
                {isDark ? (
                  <Icon name="sun" size="sm" className="text-warning" />
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
        className={`bg-text-primary/80 fixed top-0 left-0 z-30 h-screen w-full xl:hidden transition-transform duration-200 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      />
    </>
  );
};
