import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../primitives/Icon';
import { AdminLogo } from '../../primitives/Logo';
import { Input } from '../../primitives/Input';
import { useSidebar } from '../../hooks/useSidebar';
import { useTheme, useClientSafe } from '../../contexts';
import { useLanguageStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { LanguageSwitcher } from '../../composites/LanguageSwitcher';
import { themeClasses } from '../../utils/themeClasses';
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
  const { setThemeMode, isDark } = useTheme();
  const { isOpen, toggleSidebar, openDropdown, toggleDropdown } = useSidebar();
  const { client } = useClientSafe();
  
  // Клиентский брендинг - фирменный логотип
  const customLogo = client?.branding?.logo;
  const logoText = client?.name || 'Loginus';
  
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
        className={`${themeClasses.admin.sidebarBackground} shadow-[0_2px_8px_rgba(0,0,0,0.2)] fixed top-0 left-0 z-40 flex h-screen w-full max-w-[300px] flex-col justify-between overflow-hidden duration-200 xl:translate-x-0 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        } ${className}`}
      >
        <div className="flex-1 overflow-y-auto">
          {showLogo && (
            <div className="px-10 pt-10 pb-6">
              <button 
                onClick={() => navigate(buildPathWithLang('/admin', currentLang))}
                className="cursor-pointer"
              >
                <AdminLogo 
                  size="md" 
                  showText={true} 
                  customLogo={customLogo}
                  customLogoAlt={logoText}
                  text={logoText}
                />
              </button>
              <div className="mt-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${themeClasses.admin.sidebarTextActive}`}>
                  {t('admin.sidebar.title')}
                </span>
              </div>
            </div>
          )}
          
          {/* Поиск - видим только на мобильных устройствах (< xl) */}
          <div className={`px-6 pb-4 xl:hidden border-b ${themeClasses.admin.sidebarBorder}`}>
            <Input
              type="text"
              placeholder={t('common.search')}
              rightIcon={<Icon name="search" size="sm" className={themeClasses.admin.sidebarText} />}
            />
          </div>
          
          <nav className="mt-4">
            <ul>
              {items.map((item, index) => (
                <li key={item.path || index} className={item.children ? 'relative' : ''}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        // Для пунктов с children только открываем/закрываем дропдаун
                        // Переход происходит только при клике на дочерний пункт
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
                    className={`${themeClasses.admin.sidebarText} ${themeClasses.admin.sidebarHover} relative flex w-full items-center border-l-4 border-transparent py-[10px] pr-4 pl-9 text-base font-medium duration-200 transition-all text-left ${
                      item.active ? `${themeClasses.admin.sidebarActive} border-l-4 ${themeClasses.admin.sidebarActiveBorder} ${themeClasses.admin.sidebarTextActive}` : ''
                    } ${
                      item.children && openDropdown === item.path && !item.active ? themeClasses.admin.sidebarHover : ''
                    } ${
                      item.children && openDropdown === item.path && item.active ? `${themeClasses.admin.sidebarActive} border-l-4 ${themeClasses.admin.sidebarActiveBorder}` : ''
                    }`}
                  >
                    {item.icon && (
                      <Icon 
                        name={item.icon} 
                        size="sm" 
                        className={`mr-3 flex-shrink-0 ${item.active ? themeClasses.admin.sidebarTextActive : themeClasses.admin.sidebarText}`}
                      />
                    )}
                    <span className={`flex-1 text-left ${item.active ? themeClasses.admin.sidebarTextActive : ''}`}>{item.label}</span>
                    {item.children && (
                      <span
                        className={`flex-shrink-0 ml-2 transition-transform duration-200 ${
                          openDropdown === item.path ? 'rotate-0' : 'rotate-180'
                        }`}
                      >
                        <Icon 
                          name="chevron-down" 
                          size="sm" 
                          className={openDropdown === item.path ? themeClasses.admin.sidebarTextActive : themeClasses.admin.sidebarText}
                        />
                      </span>
                    )}
                  </button>
                  {item.children && openDropdown === item.path && (
                    <ul className={`py-[6px] pr-10 pl-[50px] ${themeClasses.admin.sidebarDropdown} border-l-2 ml-2`}>
                      {item.children.map((child, childIndex) => (
                        <li key={child.path || childIndex}>
                          <button
                            onClick={() => onNavigate ? onNavigate(child.path) : navigate(child.path)}
                            className={`${themeClasses.admin.sidebarText} ${themeClasses.admin.sidebarHover} flex w-full items-center border-l-4 border-transparent py-[9px] pl-2 pr-2 text-base font-medium duration-200 transition-all rounded-r-lg text-left ${
                              child.active ? `${themeClasses.admin.sidebarActive} border-l-4 ${themeClasses.admin.sidebarActiveBorder} ${themeClasses.admin.sidebarTextActive}` : ''
                            }`}
                          >
                            {child.icon && (
                              <Icon 
                                name={child.icon} 
                                size="sm" 
                                className={`mr-3 flex-shrink-0 ${child.active ? themeClasses.admin.sidebarTextActive : themeClasses.admin.sidebarText}`}
                              />
                            )}
                            <span className={child.active ? themeClasses.admin.sidebarTextActive : ''}>{child.label}</span>
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

        <div className={`p-6 space-y-1 border-t ${themeClasses.admin.sidebarBorder}`}>
          <button
            onClick={() => navigate(buildPathWithLang('/help', currentLang))}
            className={`${themeClasses.admin.sidebarText} ${themeClasses.admin.sidebarTextHover} flex w-full items-center py-1.5 text-sm font-medium duration-200`}
          >
            <Icon name="help-circle" size="sm" className="mr-3" />
            <span>{t('sidebar.help')}</span>
          </button>
          
          <button
            onClick={() => navigate(buildPathWithLang('/dashboard', currentLang))}
            className={`${themeClasses.admin.sidebarText} ${themeClasses.admin.sidebarTextHover} flex w-full items-center py-1.5 text-sm font-medium duration-200`}
          >
            <Icon name="user" size="sm" className="mr-3" />
            <span>{t('admin.sidebar.backToProfile')}</span>
          </button>
          
          <div className={`${themeClasses.admin.sidebarBorder} my-3 h-px`}></div>
          
          <div className="flex items-center justify-between py-2">
            {showLanguageSwitcher && (
              <LanguageSwitcher 
                variant="compact" 
                className={`text-slate-200 dark:text-slate-300 ${themeClasses.admin.sidebarHover}`}
              />
            )}

            {showThemeSwitcher && (
              <button
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 dark:text-slate-300 ${themeClasses.admin.sidebarHover} transition-all`}
                title={t('common.theme.toggle', {
                  mode: isDark
                    ? t('common.theme.mode.dark', { defaultValue: 'dark' })
                    : t('common.theme.mode.light', { defaultValue: 'light' }),
                  defaultValue: `Current theme: ${isDark ? 'dark' : 'light'}. Click to switch`,
                })}
              >
                {isDark ? (
                  <Icon name="sun" size="sm" className="text-yellow-400" />
                ) : (
                  <Icon name="moon" size="sm" className={themeClasses.admin.sidebarTextActive} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        onClick={toggleSidebar}
        className={`${themeClasses.admin.sidebarOverlay} fixed top-0 left-0 z-30 h-screen w-full xl:hidden transition-transform duration-200 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      />
    </>
  );
};

