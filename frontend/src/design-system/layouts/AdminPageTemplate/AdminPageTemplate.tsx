import React, { Suspense, lazy, useEffect, useReducer } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { preloadModule } from '@/services/i18n/config';
// Lazy load AdminSidebar
const AdminSidebar = lazy(() => import('../AdminSidebar').then(m => ({ default: m.AdminSidebar })));
import type { SidebarItem } from '../Sidebar/Sidebar';
// Lazy load Footer
const Footer = lazy(() => import('../Footer').then(m => ({ default: m.Footer })));
import { Header } from '../Header';
import { useAuthStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { SidebarProvider, useSidebar } from '../../hooks';
import { themeClasses } from '../../utils/themeClasses';

export interface AdminPageTemplateProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  sidebarItems?: SidebarItem[];
  showHeaderNav?: boolean;
  userData?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    login?: string;
    avatar?: string | null;
  };
  showSidebar?: boolean;
  contentClassName?: string;
  showFooter?: boolean;
}

export const AdminPageTemplate: React.FC<AdminPageTemplateProps> = (props) => {
  return (
    <SidebarProvider>
      <AdminTemplateBody {...props} />
    </SidebarProvider>
  );
};

const AdminTemplateBody: React.FC<AdminPageTemplateProps> = ({
  children,
  title,
  headerActions,
  sidebarItems,
  userData: customUserData,
  showSidebar = true,
  contentClassName = '',
  showFooter = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const currentLang = useCurrentLanguage();
  const { toggleSidebar } = useSidebar();
  
  // Принудительно перерисовываем компонент при смене языка
  // Используем i18n.language как зависимость для перерисовки
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  // Предзагружаем модуль admin для переводов админ-панели
  useEffect(() => {
    preloadModule('admin').then(() => {
      // Принудительно перерисовываем после загрузки модуля
      forceUpdate();
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[i18n] Failed to preload admin module:', error);
      }
    });
  }, []);
  
  useEffect(() => {
    const handleLanguageChanged = () => {
      forceUpdate();
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Пункты меню для админ-панели
  // Пересобираем при смене языка (i18n.language)
  const defaultAdminSidebarItems: SidebarItem[] = React.useMemo(() => [
    { 
      label: t('admin.sidebar.dashboard'), 
      path: buildPathWithLang('/admin', currentLang), 
      icon: 'chartBar', 
      active: location.pathname === buildPathWithLang('/admin', currentLang) || 
              (location.pathname === buildPathWithLang('/admin/', currentLang))
    },
    { 
      label: t('admin.sidebar.users'), 
      path: buildPathWithLang('/admin/users', currentLang), 
      icon: 'users', 
      active: location.pathname.includes('/admin/users')
    },
    { 
      label: t('admin.sidebar.companies'), 
      path: buildPathWithLang('/admin/companies', currentLang), 
      icon: 'briefcase', 
      active: location.pathname.includes('/admin/companies')
    },
    { 
      label: t('admin.sidebar.settings'), 
      path: buildPathWithLang('/admin/settings', currentLang), 
      icon: 'settings', 
      active: location.pathname.includes('/admin/auth-flow') || 
              location.pathname.includes('/admin/backup') || 
              location.pathname.includes('/admin/menu-settings'),
      children: [
        { 
          label: t('admin.sidebar.authFlow'), 
          path: buildPathWithLang('/admin/auth-flow', currentLang), 
          icon: 'shield', 
          active: location.pathname.includes('/admin/auth-flow')
        },
        { 
          label: t('admin.sidebar.backup'), 
          path: buildPathWithLang('/admin/backup', currentLang), 
          icon: 'server', 
          active: location.pathname.includes('/admin/backup')
        },
        { 
          label: t('admin.sidebar.menuSettings'), 
          path: buildPathWithLang('/admin/menu-settings', currentLang), 
          icon: 'menu', 
          active: location.pathname.includes('/admin/menu-settings')
        },
      ]
    },
  ], [t, currentLang, location.pathname, i18n.language]);

  const finalSidebarItems = sidebarItems || (showSidebar ? defaultAdminSidebarItems : undefined);

  const dashboardUser = customUserData || (user ? {
    id: user.id || '1',
    name: user.name || '',
    phone: user.phone || '',
    email: user.email,
    avatar: user.avatar,
  } : undefined);

  // Цветовая схема для админки - более темный фон контента
  const adminContentBg = 'bg-slate-50 dark:bg-slate-900';

  return (
    <section className={`${adminContentBg} relative flex min-h-screen w-full items-start`}>
      {showSidebar && finalSidebarItems && (
        <Suspense fallback={
          <div className="hidden xl:block fixed left-0 top-0 h-full w-[300px] bg-slate-900 dark:bg-slate-950 border-r border-slate-700 dark:border-slate-800 animate-pulse">
            <div className="p-6">
              <div className="h-8 bg-slate-800 dark:bg-slate-900 rounded w-32 mb-8"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-slate-800 dark:bg-slate-900 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        }>
        <AdminSidebar 
          items={finalSidebarItems}
          onNavigate={(path) => navigate(path)}
        />
        </Suspense>
      )}

      <div className={`w-full flex flex-col min-h-screen ${showSidebar ? 'xl:pl-[300px]' : 'pl-0'}`}>
        <Header
          title={title}
          actions={headerActions}
          showMobileMenuButton={!!showSidebar}
          onMobileMenuClick={toggleSidebar}
          userData={dashboardUser}
          onLogout={logout}
        />

        <div className={`${themeClasses.page.content}`}>
          <div className={contentClassName}>
            {children}
          </div>
        </div>
        
        {showFooter && (
          <div className="flex-shrink-0">
            <Suspense fallback={null}>
            <Footer />
            </Suspense>
          </div>
        )}
      </div>
    </section>
  );
};

