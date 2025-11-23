import React, { Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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
import { menuSettingsApi, MenuItemConfig } from '@/services/api/menu-settings';

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
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const currentLang = useCurrentLanguage();
  const { toggleSidebar } = useSidebar();

  const shouldShowSidebar = showSidebar !== undefined 
    ? showSidebar 
    : sidebarItems !== undefined && sidebarItems.length > 0;

  // Загрузка настроек меню из API
  const { data: userMenuData } = useQuery({
    queryKey: ['user-menu'],
    queryFn: () => menuSettingsApi.getUserMenu(),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 30 * 60 * 1000, // 30 минут
  });

  // Ключи переводов для пунктов меню, приходящих из API с systemId
  const sidebarTranslationKeys: Record<string, string> = {
    profile: 'sidebar.profile',
    data: 'sidebar.data',
    'data-documents': 'sidebar.documents',
    'data-addresses': 'sidebar.addresses',
    security: 'sidebar.security',
    family: 'sidebar.family',
    work: 'sidebar.work',
    payments: 'sidebar.payments',
    support: 'sidebar.support',
  };

  const resolveMenuItemLabel = (item: MenuItemConfig): string => {
    const fallbackLabel = item.label || item.id;
    if (!item.systemId) {
      return fallbackLabel;
    }

    const translationKey =
      sidebarTranslationKeys[item.systemId] || `sidebar.${item.systemId}`;

    return t(translationKey, { defaultValue: fallbackLabel });
  };

  // Функция для преобразования MenuItemConfig в SidebarItem с локализацией
  const convertMenuItemToSidebarItem = (item: MenuItemConfig): SidebarItem => {
    let path = item.path || '';
    
    // Для кастомных типов формируем путь
    if (item.type === 'iframe') {
      path = buildPathWithLang('/iframe', currentLang);
      if (item.iframeUrl) {
        path += `?url=${encodeURIComponent(item.iframeUrl)}`;
      } else if (item.iframeCode) {
        path += `?code=${encodeURIComponent(item.iframeCode)}`;
      }
    } else if (item.type === 'embedded') {
      path = buildPathWithLang('/embedded', currentLang);
      if (item.embeddedAppUrl) {
        path += `?url=${encodeURIComponent(item.embeddedAppUrl)}`;
      }
    } else if (item.type === 'external') {
      // Для внешних ссылок используем специальный путь или externalUrl
      path = item.path || item.externalUrl || '#';
    } else if (item.path) {
      // Для системных пунктов добавляем язык
      path = buildPathWithLang(item.path, currentLang);
    }

    const sidebarItem: SidebarItem = {
      label: resolveMenuItemLabel(item),
      path,
      icon: item.icon,
      type: item.type,
      externalUrl: item.externalUrl,
      openInNewTab: item.openInNewTab,
      iframeUrl: item.iframeUrl,
      iframeCode: item.iframeCode,
      embeddedAppUrl: item.embeddedAppUrl,
      active: location.pathname === path || 
              (item.path && location.pathname.includes(item.path)) ||
              (item.type === 'iframe' && location.pathname.includes('/iframe')) ||
              (item.type === 'embedded' && location.pathname.includes('/embedded')),
    };

    // Обрабатываем children
    if (item.children && item.children.length > 0) {
      sidebarItem.children = item.children.map(convertMenuItemToSidebarItem);
    }

    return sidebarItem;
  };

  // Дефолтные пункты меню (fallback)
  // Пересобираем при смене языка (i18n.language)
  const defaultSidebarItems: SidebarItem[] = React.useMemo(() => [
    { 
      label: t('sidebar.profile'), 
      path: buildPathWithLang('/dashboard', currentLang), 
      icon: 'home', 
      active: location.pathname.includes('/dashboard') || location.pathname === `/${currentLang}` 
    },
    { 
      label: t('sidebar.data'), 
      path: buildPathWithLang('/data', currentLang), 
      icon: 'document', 
      active: location.pathname.includes('/data'),
      children: [
        {
          label: t('sidebar.documents'),
          path: buildPathWithLang('/data/documents', currentLang),
        },
        {
          label: t('sidebar.addresses'),
          path: buildPathWithLang('/data/addresses', currentLang),
        },
      ]
    },
    { 
      label: t('sidebar.security'), 
      path: buildPathWithLang('/security', currentLang), 
      icon: 'shield', 
      active: location.pathname.includes('/security') 
    },
    { 
      label: t('sidebar.family'), 
      path: buildPathWithLang('/family', currentLang), 
      icon: 'users', 
      active: location.pathname.includes('/family') 
    },
    { 
      label: t('sidebar.work'), 
      path: buildPathWithLang('/work', currentLang), 
      icon: 'briefcase', 
      active: location.pathname.includes('/work') 
    },
    { 
      label: t('sidebar.payments'),
      path: buildPathWithLang('/pay', currentLang), 
      icon: 'credit-card', 
      active: location.pathname.includes('/pay') 
    },
    { 
      label: t('sidebar.support'), 
      path: buildPathWithLang('/support', currentLang), 
      icon: 'help-circle', 
      active: location.pathname.includes('/support') 
    },
  ], [t, currentLang, location.pathname, i18n.language]);

  // Используем меню из API, если оно загружено, иначе дефолтное
  // Пересобираем при смене языка
  const configuredSidebarItems = React.useMemo(() => {
    const menuItemsFromApi = userMenuData?.data?.data || [];
    return menuItemsFromApi.length > 0
      ? menuItemsFromApi.map(convertMenuItemToSidebarItem)
      : defaultSidebarItems;
  }, [userMenuData, defaultSidebarItems, currentLang, i18n.language]);

  const finalSidebarItems = sidebarItems || (shouldShowSidebar ? configuredSidebarItems : undefined);

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


