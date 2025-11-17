import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header, type HeaderProps } from '../Header';
import { Sidebar, type SidebarItem } from '../Sidebar';
import { Footer } from '../Footer';
import { useAuthStore } from '@/store';
import { useLanguageStore } from '@/store';

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
   * Header props (если нужен полный контроль)
   */
  headerProps?: HeaderProps;
  
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

export const PageTemplate: React.FC<PageTemplateProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  sidebarItems,
  headerProps,
  showSidebar,
  contentClassName = '',
  showFooter = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  
  // Автоматически определяем, нужен ли sidebar
  const shouldShowSidebar = showSidebar !== undefined 
    ? showSidebar 
    : sidebarItems !== undefined && sidebarItems.length > 0;
  
  // Создаем headerProps автоматически, если не переданы
  const finalHeaderProps: HeaderProps = headerProps || {
    userName: user?.name,
    userAvatar: user?.avatar,
    onLogout: logout,
    onLanguageChange: () => setLanguage(language === 'ru' ? 'en' : 'ru'),
    currentLanguage: language,
  };
  
  // Автоматически создаем стандартные sidebarItems, если не переданы
  const defaultSidebarItems: SidebarItem[] = [
    { label: 'Главная', path: '/', active: location.pathname === '/' },
    { label: 'Данные', path: '/personal', active: location.pathname.startsWith('/personal') },
    { label: 'Безопасность', path: '/profile/security', active: location.pathname.startsWith('/profile/security') },
    { label: 'Семья', path: '/family', active: location.pathname === '/family' },
    { label: 'Платежи', path: '/pay', active: location.pathname === '/pay' },
    { label: 'Поддержка', path: '/support', active: location.pathname === '/support' },
  ];
  
  const finalSidebarItems = sidebarItems || (shouldShowSidebar ? defaultSidebarItems : undefined);

  return (
    <div className="min-h-screen bg-gray-1 dark:bg-dark flex flex-col">
      {/* Header - всегда показываем */}
      <Header {...finalHeaderProps} />

      {/* Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {shouldShowSidebar && finalSidebarItems && (
          <Sidebar items={finalSidebarItems} onNavigate={navigate} />
        )}

        {/* Main Content */}
        <main className={`flex-1 ${shouldShowSidebar ? 'p-8' : 'p-8'} ${contentClassName}`}>
          {/* Title и Subtitle, если переданы */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
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
          
          {children}
        </main>
      </div>
      
      {/* Footer - показываем по умолчанию */}
      {showFooter && <Footer />}
    </div>
  );
};

