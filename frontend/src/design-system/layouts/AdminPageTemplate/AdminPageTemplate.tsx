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
  const [adminModuleLoaded, setAdminModuleLoaded] = React.useState(false);
  
  // Предзагружаем модуль admin для переводов админ-панели
  useEffect(() => {
    preloadModule('admin').then(() => {
      // Помечаем модуль как загруженный и принудительно перерисовываем
      setAdminModuleLoaded(true);
      forceUpdate();
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[i18n] Failed to preload admin module:', error);
      }
      // Даже при ошибке помечаем как загруженный, чтобы использовать fallback
      setAdminModuleLoaded(true);
    });
  }, []);
  
  useEffect(() => {
    const handleLanguageChanged = async () => {
      // При смене языка перезагружаем модуль admin
      try {
        await preloadModule('admin');
        setAdminModuleLoaded(true);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[i18n] Failed to reload admin module on language change:', error);
        }
      }
      forceUpdate();
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Пункты меню для админ-панели
  // Пересобираем при смене языка (i18n.language) и после загрузки модуля admin
  // Используем готовые переводы с fallback значениями
  const defaultAdminSidebarItems: SidebarItem[] = React.useMemo(() => {
    // Убеждаемся, что переводы загружены, используя fallback значения
    return [
    { 
        label: t('admin.sidebar.dashboard', 'Дашборд'), 
      path: buildPathWithLang('/admin', currentLang), 
      icon: 'chartBar', 
      active: location.pathname === buildPathWithLang('/admin', currentLang) || 
              (location.pathname === buildPathWithLang('/admin/', currentLang))
    },
    { 
        label: t('admin.sidebar.users', 'Пользователи'), 
      path: buildPathWithLang('/admin/users', currentLang), 
      icon: 'users', 
      active: location.pathname.includes('/admin/users')
    },
    { 
        label: t('admin.sidebar.companies', 'Компании'), 
      path: buildPathWithLang('/admin/companies', currentLang), 
      icon: 'briefcase', 
      active: location.pathname.includes('/admin/companies')
    },
    { 
        label: t('admin.sidebar.settings', 'Настройки'), 
      path: buildPathWithLang('/admin/settings', currentLang), 
      icon: 'settings', 
      active: location.pathname.includes('/admin/auth-flow') || 
              location.pathname.includes('/admin/backup') || 
              location.pathname.includes('/admin/menu-settings'),
      children: [
        { 
            label: t('admin.sidebar.authFlow', 'Алгоритм авторизации'), 
          path: buildPathWithLang('/admin/auth-flow', currentLang), 
          icon: 'shield', 
          active: location.pathname.includes('/admin/auth-flow')
        },
        { 
            label: t('admin.sidebar.backup', 'Бекапы и синхронизация'), 
          path: buildPathWithLang('/admin/backup', currentLang), 
          icon: 'server', 
          active: location.pathname.includes('/admin/backup')
        },
        { 
            label: t('admin.sidebar.menuSettings', 'Настройки меню'), 
          path: buildPathWithLang('/admin/menu-settings', currentLang), 
          icon: 'menu', 
          active: location.pathname.includes('/admin/menu-settings')
        },
      ]
    },
    ];
  }, [t, currentLang, location.pathname, i18n.language, adminModuleLoaded]);

  const finalSidebarItems = sidebarItems || (showSidebar ? defaultAdminSidebarItems : undefined);

  const dashboardUser = customUserData || (user ? {
    id: user.id || '1',
    name: user.name || '',
    phone: user.phone || '',
    email: user.email,
    avatar: user.avatar,
  } : undefined);

  // Цветовая схема для админки - используем themeClasses для единообразия
  // Для админки используем более темный фон контента через themeClasses
  const adminContentBg = `${themeClasses.background.gray} relative flex min-h-screen w-full items-start`;

  return (
    <section className={adminContentBg}>
      {showSidebar && finalSidebarItems && (
        <Suspense fallback={
          <div className={`hidden xl:block fixed left-0 top-0 h-full w-[300px] ${themeClasses.background.gray2} ${themeClasses.border.right} animate-pulse`}>
            <div className="p-6">
              <div className={`h-8 ${themeClasses.background.gray2} rounded w-32 mb-8`}></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-10 ${themeClasses.background.gray2} rounded`}></div>
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

