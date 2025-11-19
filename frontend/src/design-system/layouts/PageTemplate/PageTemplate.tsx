import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type SidebarItem } from '../Sidebar';
import { Footer } from '../Footer';
import { useAuthStore } from '@/store';
import { useLanguageStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { Icon, Logo, Avatar, Button } from '../../primitives';
import { useTheme } from '../../contexts';
import { getInitials } from '@/utils/stringUtils';

export interface PageTemplateProps {
  /**
   * Содержимое страницы
   */
  children: React.ReactNode;
  
  /**
   * Заголовок страницы (альтернатива headerProps)
   */
  title?: string;
  
  /**
   * Подзаголовок страницы
   */
  subtitle?: string;
  
  /**
   * Дополнительные действия в header (альтернатива headerProps)
   */
  headerActions?: React.ReactNode;
  
  /**
   * Sidebar items (если нужен sidebar)
   */
  sidebarItems?: SidebarItem[];
  
  /**
   * Показать навигацию в хедере
   */
  showHeaderNav?: boolean;
  
  /**
   * Данные пользователя для ProfilePopup (если нужны дополнительные данные)
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
   * Показать sidebar (по умолчанию определяется автоматически)
   */
  showSidebar?: boolean;
  
  /**
   * Дополнительные классы для main
   */
  contentClassName?: string;
  
  /**
   * Показать footer (по умолчанию true)
   */
  showFooter?: boolean;
}

/**
 * PageTemplate - шаблон страницы с хедером и сайдбаром по примеру mega
 * Структура из tailgrids-bank/mega/src/index.html
 */
export const PageTemplate: React.FC<PageTemplateProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  sidebarItems,
  userData: customUserData,
  showSidebar,
  contentClassName = '',
  showFooter = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage();
  const { setThemeMode, isDark } = useTheme();
  
  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };
  
  // State для sidebar (аналог Alpine.js x-data)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profilePopupRef = useRef<HTMLDivElement>(null);

  // Закрытие попапа при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target as Node)) {
        setShowProfilePopup(false);
      }
    };

    if (showProfilePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfilePopup]);
  
  // Автоматически определяем, нужен ли sidebar
  const shouldShowSidebar = showSidebar !== undefined 
    ? showSidebar 
    : sidebarItems !== undefined && sidebarItems.length > 0;
  
  // Автоматически создаем стандартные sidebarItems, если не переданы
  const defaultSidebarItems: SidebarItem[] = [
    { 
      label: 'Главная', 
      path: buildPathWithLang('/dashboard', currentLang), 
      icon: 'home', 
      active: location.pathname.includes('/dashboard') || location.pathname === `/${currentLang}` 
    },
    { 
      label: 'Данные', 
      path: buildPathWithLang('/personal/documents', currentLang), 
      icon: 'document', 
      active: location.pathname.includes('/personal') 
    },
    { 
      label: 'Безопасность', 
      path: buildPathWithLang('/security', currentLang), 
      icon: 'shield', 
      active: location.pathname.includes('/security') 
    },
    { 
      label: 'Семья', 
      path: buildPathWithLang('/family', currentLang), 
      icon: 'users', 
      active: location.pathname.includes('/family') 
    },
    { 
      label: 'Платежи', 
      path: buildPathWithLang('/pay', currentLang), 
      icon: 'credit-card', 
      active: location.pathname.includes('/pay') 
    },
    { 
      label: 'Поддержка', 
      path: buildPathWithLang('/support', currentLang), 
      icon: 'help-circle', 
      active: location.pathname.includes('/support') 
    },
  ];
  
  const finalSidebarItems = sidebarItems || (shouldShowSidebar ? defaultSidebarItems : undefined);
  
  const dashboardUser = customUserData || (user ? {
          id: user.id || '1',
          name: user.name || '',
          phone: user.phone || '',
          email: user.email,
          avatar: user.avatar,
  } : undefined);

  return (
    <section className="bg-[#f7f8fa] dark:bg-dark relative flex min-h-screen w-full items-start">
      {/* Sidebar - по примеру mega */}
      {shouldShowSidebar && finalSidebarItems && (
        <>
          <div
            className={`dark:bg-dark-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] fixed top-0 left-0 z-40 flex h-screen w-full max-w-[300px] flex-col justify-between overflow-y-scroll bg-white duration-200 xl:translate-x-0 ${
              sidebarOpen ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div>
              {/* Logo */}
              <div className="px-10 pt-10 pb-9">
                <button 
                  onClick={() => navigate(buildPathWithLang('/', currentLang))}
                  className="cursor-pointer"
                >
                  <Logo size="md" showText={true} />
                </button>
              </div>
              
              {/* Navigation */}
              <nav>
                <ul>
                  {finalSidebarItems.map((item, index) => {
                    // Проверяем, есть ли подменю (для "Данные")
                    const hasSubmenu = item.label === 'Данные';
                    
                    return (
                      <li key={item.path || index} className={hasSubmenu ? 'relative' : ''}>
                        <button
                          onClick={() => {
                            if (hasSubmenu) {
                              setOpenDropDown(!openDropDown);
                            } else {
                              navigate(item.path);
                            }
                          }}
                          className={`text-body-color dark:text-dark-6 hover:border-primary hover:bg-primary/5 relative flex w-full items-center border-r-4 border-transparent py-[10px] pr-10 pl-9 text-base font-medium duration-200 transition-all hover:translate-x-1 ${
                            item.active 
                              ? '!border-primary bg-primary/5' 
                              : ''
                          }`}
                        >
                          {item.icon && (
                            <Icon 
                              name={item.icon} 
                              size="sm" 
                              className="mr-3"
                            />
                          )}
                          <span>{item.label}</span>
                          {hasSubmenu && (
                            <span
                              className={`absolute top-1/2 right-10 -translate-y-1/2 transition-transform duration-200 ${
                                openDropDown ? 'rotate-0' : 'rotate-180'
                              }`}
                            >
                              <Icon name="chevron-down" size="sm" />
                            </span>
                          )}
                        </button>
                        {hasSubmenu && openDropDown && (
                          <ul className="py-[6px] pr-10 pl-[50px]">
                            <li>
                              <button
                                onClick={() => navigate(buildPathWithLang('/personal/documents', currentLang))}
                                className="text-body-color dark:text-dark-6 hover:text-primary flex w-full items-center border-r-4 border-transparent py-[9px] text-base font-medium duration-200"
                              >
                                Документы
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => navigate(buildPathWithLang('/personal/addresses', currentLang))}
                                className="text-body-color dark:text-dark-6 hover:text-primary flex w-full items-center border-r-4 border-transparent py-[9px] text-base font-medium duration-200"
                              >
                                Адреса
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>
                    );
                  })}
                  
                  {/* Разделитель */}
                  <li>
                    <div className="bg-stroke dark:bg-dark-3 mx-9 my-5 h-px"></div>
                  </li>
                  
                  {/* Выход */}
                  <li>
                    <button
                      onClick={logout}
                      className="text-body-color dark:text-dark-6 hover:border-primary hover:bg-primary/5 relative flex w-full items-center border-r-4 border-transparent py-[10px] pr-10 pl-9 text-base font-medium duration-200 transition-all hover:translate-x-1"
                    >
                      <Icon name="log-out" size="sm" className="mr-3" />
                      <span>Выйти</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Profile внизу sidebar */}
            {dashboardUser && (
              <div className="p-10">
                <div className="flex items-center">
                  <div className="mr-4 h-[50px] w-full max-w-[50px] rounded-full">
                    <Avatar
                      src={dashboardUser.avatar || undefined}
                      initials={getInitials(dashboardUser.name)}
                      size="lg"
                      rounded
                    />
                  </div>
                  <div>
                    <h6 className="text-dark text-base font-medium dark:text-white">
                      {dashboardUser.name}
                    </h6>
                    <p className="text-body-color dark:text-dark-6 text-sm">
                      {dashboardUser.email || dashboardUser.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Overlay для мобильных */}
          <div
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`bg-dark/80 fixed top-0 left-0 z-30 h-screen w-full xl:hidden transition-transform duration-200 ${
              sidebarOpen ? '-translate-x-full' : 'translate-x-0'
            }`}
          ></div>
        </>
        )}

        {/* Main Content */}
      <div className={`w-full flex flex-col min-h-screen ${shouldShowSidebar ? 'xl:pl-[300px]' : 'pl-0'}`}>
        {/* Header - в стиле LandingHeader, без лого (лого в сайдбаре), ниже сайдбара */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-2 dark:bg-dark/80 dark:border-dark-3">
          <div className="w-full">
            <div className="relative flex items-center justify-between py-4 px-4 xl:px-6">
              {/* Левая часть - поиск */}
              <div className="flex items-center flex-1">
                {/* Кнопка меню для мобильных */}
                {shouldShowSidebar && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="border-stroke text-dark hover:bg-gray dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-dark-3 flex h-[46px] w-[46px] items-center justify-center rounded-lg border bg-white xl:hidden dark:text-white mr-4"
                  >
                    <Icon name="menu" size="md" />
                  </button>
                )}
                
                {/* Поиск */}
                <div className="relative w-full max-w-[400px]">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    className="border-stroke dark:border-dark-3 bg-gray-2 dark:bg-dark text-secondary-color dark:text-dark-6 focus:border-primary w-full rounded-lg border py-[10px] pr-10 pl-5 outline-none"
                  />
                  <span className="text-body-color dark:text-dark-6 absolute top-1/2 right-4 -translate-y-1/2">
                    <Icon name="search" size="sm" />
                  </span>
                </div>
              </div>
              
              {/* Actions справа - как в LandingHeader */}
              <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}>
                  {language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
                </Button>

                {/* Theme Switcher */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3 transition-all"
                  title={`Текущая тема: ${isDark ? 'dark' : 'light'}. Кликните для переключения`}
                >
                  {isDark ? (
                    <Icon name="sun" size="sm" className="text-yellow-400" />
                  ) : (
                    <Icon name="moon" size="sm" className="text-primary" />
                  )}
                </button>
                
                {/* User Avatar с попапом */}
                {dashboardUser && (
                  <div className="relative" ref={profilePopupRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProfilePopup(!showProfilePopup)}
                      className="!p-2"
                    >
                      <Avatar
                        src={dashboardUser.avatar || undefined}
                        initials={getInitials(dashboardUser.name)}
                        size="sm"
                        rounded
                      />
                    </Button>

                    {/* Profile Popup */}
                    {showProfilePopup && (
                      <div className="dark:bg-dark-2 shadow-card-2 absolute top-full right-0 mt-2 w-[200px] space-y-2 rounded bg-white p-3 opacity-100 z-50">
                        <button
                          onClick={() => {
                            navigate(buildPathWithLang('/dashboard', currentLang));
                            setShowProfilePopup(false);
                          }}
                          className="text-body-color dark:text-dark-6 hover:bg-gray-2 dark:hover:bg-dark hover:text-primary block w-full rounded px-4 py-2 text-sm font-medium text-left transition-colors duration-200"
                        >
                          Профиль
                        </button>
                        <button
                          onClick={() => {
                            navigate(buildPathWithLang('/personal/documents', currentLang));
                            setShowProfilePopup(false);
                          }}
                          className="text-body-color dark:text-dark-6 hover:bg-gray-2 dark:hover:bg-dark hover:text-primary block w-full rounded px-4 py-2 text-sm font-medium text-left transition-colors duration-200"
                        >
                          Настройки
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setShowProfilePopup(false);
                          }}
                          className="text-body-color dark:text-dark-6 hover:bg-gray-2 dark:hover:bg-dark hover:text-primary block w-full rounded px-4 py-2 text-sm font-medium text-left transition-colors duration-200"
                        >
                          Выйти
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="bg-[#f7f8fa] dark:bg-dark p-[30px] flex-1">
          {/* Title и Subtitle, если переданы */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-secondary-600 dark:text-dark-6">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          {/* Header Actions, если переданы */}
          {headerActions && (
            <div className="mb-4 flex justify-end">
              {headerActions}
            </div>
          )}
          
          {/* Main Content */}
          <div className={contentClassName}>
          {children}
          </div>
      </div>
      
        {/* Footer - внизу контента, не на уровне хедера */}
        {showFooter && (
          <div className="flex-shrink-0">
            <Footer />
          </div>
        )}
    </div>
    </section>
  );
};
