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
import { changeLanguage } from '@/services/i18n/config';

export interface SidebarItem {
  label: string;
  path: string;
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
  const { language, setLanguage } = useLanguageStore();
  const { setThemeMode, isDark } = useTheme();
  const { isOpen, toggleSidebar, openDropdown, toggleDropdown } = useSidebar();
  
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
        className={`${themeClasses.card.shadow} shadow-[0_2px_8px_rgba(0,0,0,0.08)] fixed top-0 left-0 z-40 flex h-screen w-full max-w-[300px] flex-col justify-between overflow-y-scroll duration-200 xl:translate-x-0 ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        } ${className}`}
      >
        <div>
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
              placeholder={t('common.search', 'Поиск...')}
              rightIcon={<Icon name="search" size="sm" className={themeClasses.text.secondary} />}
            />
          </div>
          
          <nav>
            <ul>
              {items.map((item, index) => (
                <li key={item.path || index} className={item.children ? 'relative' : ''}>
                  <button
                    onClick={() => {
                      // Если есть children, сначала делаем переход, потом раскрываем подменю
                      if (item.children) {
                        // Переход на страницу родительского элемента
                        if (item.path) {
                          onNavigate ? onNavigate(item.path) : navigate(item.path);
                        }
                        // Раскрытие/закрытие подменю
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
                    className={`${themeClasses.text.secondary} dark:text-dark-6 hover:border-primary hover:bg-primary/5 relative flex w-full items-center border-r-4 border-transparent py-[10px] pr-4 pl-9 text-base font-medium duration-200 transition-all hover:translate-x-1 text-left ${
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
                            openDropdown === item.path ? 'text-primary' : `${themeClasses.text.secondary} dark:text-dark-6`
                          }`}
                        />
                      </span>
                    )}
                  </button>
                  {item.children && openDropdown === item.path && (
                    <ul className={`py-[6px] pr-10 pl-[50px] ${themeClasses.background.gray2} border-l-2 border-primary/30 dark:border-primary/40 ml-2`}>
                      {item.children.map((child, childIndex) => (
                        <li key={child.path || childIndex}>
                          <button
                            onClick={() => onNavigate ? onNavigate(child.path) : navigate(child.path)}
                            className={`${themeClasses.text.secondary} dark:text-dark-6 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 flex w-full items-center border-r-4 border-transparent py-[9px] pl-2 pr-2 text-base font-medium duration-200 transition-all rounded-r-lg text-left ${
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

        <div className="p-6 space-y-1">
          <button
            onClick={() => navigate(buildPathWithLang('/support', currentLang))}
            className={`${themeClasses.text.secondary} dark:text-dark-6 hover:text-primary flex w-full items-center py-1.5 text-sm font-medium duration-200`}
          >
            <Icon name="help-circle" size="sm" className="mr-3" />
            <span>{t('sidebar.help', 'Справка')}</span>
          </button>
          
          <button
            onClick={() => window.open('https://loginus.ru', '_blank')}
            className={`${themeClasses.text.secondary} dark:text-dark-6 hover:text-primary flex w-full items-center py-1.5 text-sm font-medium duration-200`}
          >
            <Icon name="globe" size="sm" className="mr-3" />
            <span>{t('sidebar.loginusIdSite', 'Loginus ID для сайта')}</span>
          </button>
          
          <div className={`${themeClasses.background.gray2} my-3 h-px`}></div>
          
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.text.primary} hover:bg-gray-2 dark:hover:bg-dark-3 transition-all`}
              >
                {language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
              </button>
            )}

            {showThemeSwitcher && (
              <button
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.text.primary} hover:bg-gray-2 dark:hover:bg-dark-3 transition-all`}
                title={`Текущая тема: ${isDark ? 'dark' : 'light'}. Кликните для переключения`}
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
