import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type SidebarItem, Sidebar } from '../Sidebar';
import { Footer } from '../Footer';
import { Header } from '../Header';
import { useAuthStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { SidebarProvider, useSidebar } from '../../hooks';

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
      path: buildPathWithLang('/personal/documents', currentLang), 
      icon: 'document', 
      active: location.pathname.includes('/personal'),
      children: [
        {
          label: t('sidebar.documents', 'Документы'),
          path: buildPathWithLang('/personal/documents', currentLang),
        },
        {
          label: t('sidebar.addresses', 'Адреса'),
          path: buildPathWithLang('/personal/addresses', currentLang),
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
    <section className="bg-[#f7f8fa] dark:bg-dark relative flex min-h-screen w-full items-start">
      {shouldShowSidebar && finalSidebarItems && (
        <Sidebar 
          items={finalSidebarItems}
          onNavigate={(path) => navigate(path)}
        />
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

        <div className="bg-[#f7f8fa] dark:bg-dark p-[30px] flex-1">
          <div className={contentClassName}>
            {children}
          </div>
        </div>
        
        {showFooter && (
          <div className="flex-shrink-0">
            <Footer />
          </div>
        )}
      </div>
    </section>
  );
};


