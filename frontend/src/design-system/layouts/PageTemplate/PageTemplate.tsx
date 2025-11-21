import React, { Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Lazy load Sidebar - не критичен для первого рендера (оптимизация первой загрузки)
const Sidebar = lazy(() => import('../Sidebar').then(m => ({ default: m.Sidebar })));
import type { SidebarItem } from '../Sidebar/Sidebar';
// Lazy load Footer - не критичен для первой загрузки (оптимизация производительности)
const Footer = lazy(() => import('../Footer').then(m => ({ default: m.Footer })));
import { Header } from '../Header';
import { useAuthStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { SidebarProvider, useSidebar } from '../../hooks';
import { themeClasses } from '../../utils/themeClasses';

export interface PageTemplateProps {
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
    unreadMail?: number;
    plusActive?: boolean;
    plusPoints?: number;
    gamePoints?: number; // Количество морковок (игровых баллов)
  };
  showSidebar?: boolean;
  contentClassName?: string;
  showFooter?: boolean;
}

export const PageTemplate: React.FC<PageTemplateProps> = (props) => {
  return (
    <SidebarProvider>
      <TemplateBody {...props} />
    </SidebarProvider>
  );
};

const TemplateBody: React.FC<PageTemplateProps> = ({
  children,
  title,
  headerActions,
  sidebarItems,
  userData: customUserData,
  showSidebar,
  contentClassName = '',
  showFooter = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const currentLang = useCurrentLanguage();
  const { toggleSidebar } = useSidebar();

  const shouldShowSidebar = showSidebar !== undefined 
    ? showSidebar 
    : sidebarItems !== undefined && sidebarItems.length > 0;

  const defaultSidebarItems: SidebarItem[] = [
    { 
      label: t('sidebar.profile', 'Профиль'), 
      path: buildPathWithLang('/dashboard', currentLang), 
      icon: 'home', 
      active: location.pathname.includes('/dashboard') || location.pathname === `/${currentLang}` 
    },
    { 
      label: t('sidebar.data', 'Данные'), 
      path: buildPathWithLang('/data', currentLang), 
      icon: 'document', 
      active: location.pathname.includes('/data'),
      children: [
        {
          label: t('sidebar.documents', 'Документы'),
          path: buildPathWithLang('/data/documents', currentLang),
        },
        {
          label: t('sidebar.addresses', 'Адреса'),
          path: buildPathWithLang('/data/addresses', currentLang),
        },
      ]
    },
    { 
      label: t('sidebar.security', 'Безопасность'), 
      path: buildPathWithLang('/security', currentLang), 
      icon: 'shield', 
      active: location.pathname.includes('/security') 
    },
    { 
      label: t('sidebar.family', 'Семья'), 
      path: buildPathWithLang('/family', currentLang), 
      icon: 'users', 
      active: location.pathname.includes('/family') 
    },
    { 
      label: t('sidebar.work', 'Работа'), 
      path: buildPathWithLang('/work', currentLang), 
      icon: 'briefcase', 
      active: location.pathname.includes('/work') 
    },
    { 
      label: t('sidebar.payments', 'Платежи'),
      path: buildPathWithLang('/pay', currentLang), 
      icon: 'credit-card', 
      active: location.pathname.includes('/pay') 
    },
    { 
      label: t('sidebar.support', 'Поддержка'), 
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
    <section className={`${themeClasses.page.containerGray} relative flex min-h-screen w-full items-start`}>
      {shouldShowSidebar && finalSidebarItems && (
        <Suspense fallback={
          <div className={`hidden xl:block fixed left-0 top-0 h-full w-[300px] ${themeClasses.background.surfaceElevated} border-r ${themeClasses.border.default} animate-pulse`}>
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
        <Sidebar 
          items={finalSidebarItems}
          onNavigate={(path) => navigate(path)}
        />
        </Suspense>
      )}

      <div className={`w-full flex flex-col min-h-screen ${shouldShowSidebar ? 'xl:pl-[300px]' : 'pl-0'}`}>
        <Header
          title={title}
          actions={headerActions}
          showMobileMenuButton={!!shouldShowSidebar}
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


