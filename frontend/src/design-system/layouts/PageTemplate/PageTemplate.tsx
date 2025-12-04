import React, { Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
// Lazy load Sidebar - не критичен для первого рендера (оптимизация первой загрузки)
const Sidebar = lazy(() => import('../Sidebar/Sidebar').then(m => ({ default: m.Sidebar })));
import type { SidebarItem } from '../Sidebar/Sidebar';
// Lazy load Footer - не критичен для первой загрузки (оптимизация производительности)
const Footer = lazy(() => import('../Footer').then(m => ({ default: m.Footer })));
// Lazy load MobileBottomNav - не критичен для первой загрузки
const MobileBottomNav = lazy(() => import('../MobileBottomNav').then(m => ({ default: m.MobileBottomNav })));
import { Header } from '../Header';
import { useAuthStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { SidebarProvider, useSidebar } from '@/design-system/hooks';
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
    staleTime: 0, // Всегда считаем данные устаревшими, чтобы получать свежие данные
    gcTime: 5 * 60 * 1000, // 5 минут
    refetchOnMount: true, // Всегда загружаем свежие данные при монтировании
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
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

  const resolveMenuItemLabel = React.useCallback((item: MenuItemConfig): string => {
    const fallbackLabel = item.label || item.id;
    if (!item.systemId) {
      return fallbackLabel;
    }

    const translationKey =
      sidebarTranslationKeys[item.systemId] || `sidebar.${item.systemId}`;

    return t(translationKey, { defaultValue: fallbackLabel });
  }, [t]);

  // Функция для преобразования MenuItemConfig в SidebarItem с локализацией
  const convertMenuItemToSidebarItem = React.useCallback((item: MenuItemConfig): SidebarItem | null => {
    // ✅ КРИТИЧЕСКОЕ ЛОГИРОВАНИЕ: Всегда логируем для data-documents и data-addresses в самом начале
    if (item.systemId === 'data-documents' || item.systemId === 'data-addresses') {
      console.log('[PageTemplate] 🔍 ENTRY POINT for data-documents/addresses:', {
        systemId: item.systemId,
        systemIdType: typeof item.systemId,
        systemIdLength: item.systemId?.length,
        itemPath: item.path,
        itemId: item.id,
        itemType: item.type,
        enabled: item.enabled
      });
    }
    
    // Пропускаем выключенные элементы
    if (item.enabled === false) {
      return null;
    }
    
    // ✅ ИСПРАВЛЕНИЕ: Определяем systemPaths ДО использования, чтобы он был доступен везде
    const systemPaths: Record<string, string> = {
      'profile': '/dashboard',
      'data': '/data',
      'data-documents': '/data/documents',
      'data-addresses': '/data/addresses',
      'security': '/security',
      'family': '/family',
      'work': '/work',
      'payments': '/pay',
      'support': '/support',
    };
    
    let path = '';
    let navigationPath = ''; // Путь для фактической навигации
    
    // Для кастомных типов формируем путь
    if (item.type === 'iframe' || item.type === 'embedded') {
      // Используем ту же логику для iframe и embedded
      // Генерируем реальный путь для навигации
      navigationPath = buildPathWithLang('/iframe', currentLang);
      
      // Для embedded используем embeddedAppUrl, для iframe - iframeUrl
      const url = item.type === 'embedded' ? item.embeddedAppUrl : item.iframeUrl;
      const code = item.type === 'embedded' ? undefined : item.iframeCode; // embedded не поддерживает код
      
      // ВАЖНО: code имеет приоритет над url (если есть код, используем его, а не URL)
      if (code) {
        navigationPath += `?code=${encodeURIComponent(code)}`;
      } else if (url) {
        navigationPath += `?url=${encodeURIComponent(url)}`;
      }
      
      // Для построения иерархии используем кастомный path, если он задан
      // Иначе используем тот же путь, что и для навигации
      path = item.path ? buildPathWithLang(item.path, currentLang) : navigationPath;
    } else if (item.type === 'external') {
      // Для внешних ссылок используем специальный путь или externalUrl
      path = item.path || item.externalUrl || '#';
      navigationPath = path;
    } else if (item.systemId) {
      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Принудительно используем дефолтные пути для data-documents и data-addresses
      // Это должно быть ПЕРВЫМ, чтобы гарантированно переопределить пути из API
      console.log('[PageTemplate] 🔍 Checking systemId for forced path:', {
        systemId: item.systemId,
        systemIdType: typeof item.systemId,
        isDataDocuments: item.systemId === 'data-documents',
        isDataAddresses: item.systemId === 'data-addresses',
        willForce: item.systemId === 'data-documents' || item.systemId === 'data-addresses'
      });
      
      const isForcedPath = item.systemId === 'data-documents' || item.systemId === 'data-addresses';
      if (isForcedPath) {
        let forcedPath = '';
        if (item.systemId === 'data-documents') {
          forcedPath = '/data/documents';
        } else if (item.systemId === 'data-addresses') {
          forcedPath = '/data/addresses';
        }
        path = buildPathWithLang(forcedPath, currentLang);
        navigationPath = path;
        console.log('[PageTemplate] 🔧 FORCED default path for:', {
          systemId: item.systemId,
          forcedPath,
          finalPath: path,
          navigationPath: navigationPath
        });
        // ✅ ВАЖНО: После установки принудительного пути, пропускаем остальную логику
        // и сразу переходим к созданию sidebarItem
      }
      
      // ✅ ВАЖНО: Если это НЕ принудительный путь, выполняем обычную логику
      if (!isForcedPath) {
        // ✅ ИСПРАВЛЕНИЕ: Для остальных системных разделов используем дефолтные пути (игнорируем path из API)
        // Нормализуем systemId (убираем пробелы, приводим к нижнему регистру)
        const normalizedSystemId = item.systemId?.trim().toLowerCase();
        // Пробуем найти путь по нормализованному systemId, затем по оригинальному
        let defaultPath = systemPaths[normalizedSystemId];
        if (!defaultPath) {
          defaultPath = systemPaths[item.systemId];
        }
        if (!defaultPath && item.systemId?.trim()) {
          defaultPath = systemPaths[item.systemId.trim()];
        }
        
        console.log('[PageTemplate] Processing systemId:', {
          systemId: item.systemId,
          normalizedSystemId,
          defaultPath,
          itemPath: item.path,
          willUseDefault: !!defaultPath,
          systemPathsKeys: Object.keys(systemPaths),
          hasNormalized: systemPaths.hasOwnProperty(normalizedSystemId),
          hasOriginal: systemPaths.hasOwnProperty(item.systemId),
          directAccess: systemPaths[item.systemId],
          normalizedAccess: systemPaths[normalizedSystemId]
        });
        
        if (defaultPath) {
          // ВАЖНО: Игнорируем path из API для системных разделов
          path = buildPathWithLang(defaultPath, currentLang);
          navigationPath = path;
          console.log('[PageTemplate] ✅ Using system path:', {
            systemId: item.systemId,
            normalizedSystemId,
            defaultPath,
            finalPath: path
          });
        } else if (item.path) {
          // Если systemId не найден в systemPaths, используем path из API
          console.warn('[PageTemplate] ⚠️ SystemId not found in systemPaths, using API path:', {
            systemId: item.systemId,
            normalizedSystemId,
            apiPath: item.path,
            availableKeys: Object.keys(systemPaths),
            directAccess: systemPaths[item.systemId],
            normalizedAccess: systemPaths[normalizedSystemId]
          });
          path = buildPathWithLang(item.path, currentLang);
          navigationPath = path;
        } else {
          console.warn('[PageTemplate] ⚠️ No path for systemId:', {
            systemId: item.systemId,
            normalizedSystemId,
            availableKeys: Object.keys(systemPaths)
          });
        }
      }
    } else if (item.path) {
      // Для несистемных пунктов добавляем язык
      path = buildPathWithLang(item.path, currentLang);
      navigationPath = path;
    }

    // Применяем дефолтные иконки для системных пунктов, если иконка отсутствует
    const defaultIcons: Record<string, string> = {
      'profile': 'home',
      'data': 'database',
      'data-documents': 'document',
      'data-addresses': 'map-pin',
      'security': 'shield',
      'family': 'users',
      'work': 'briefcase',
      'payments': 'credit-card',
      'support': 'help-circle',
    };
    
    const systemKey = item.systemId || item.id;
    // Всегда применяем дефолтную иконку для системных пунктов, если иконка не указана или пустая
    const hasValidIcon = item.icon && typeof item.icon === 'string' && item.icon.trim() !== '';
    const finalIcon = hasValidIcon ? item.icon : (defaultIcons[systemKey] || undefined);

    // Сначала обрабатываем children, чтобы знать, есть ли активные дочерние элементы
    let hasActiveChild = false;
    let filteredChildren: SidebarItem[] = [];
    
    if (item.children && item.children.length > 0) {
      filteredChildren = item.children
        .map(convertMenuItemToSidebarItem)
        .filter((child): child is SidebarItem => child !== null);
      
      hasActiveChild = filteredChildren.some(child => child.active);
    }

    // Определяем активность родительского элемента
    // Если есть активный дочерний элемент, родительский не должен быть активным
    // Иначе проверяем активность родительского элемента
    
    // Для iframe/embedded с navigationPath проверяем navigationPath, а не общий тип
    const isNavigationPathActive = navigationPath && location.pathname === navigationPath;
    
    // Для элементов с navigationPath (которые имеют кастомный path для иерархии)
    // активность определяется только по navigationPath
    const shouldCheckNavigationPath = navigationPath && navigationPath !== path;
    
    // ИСПРАВЛЕНО: убрали агрессивные проверки на /iframe и /embedded
    // Активность определяется только точным совпадением path или navigationPath
    const isParentActive = !hasActiveChild && (
      location.pathname === path || 
      (shouldCheckNavigationPath && isNavigationPathActive)
    );

    // ВАЖНО: Если path пустой, это проблема - нужно установить fallback
    // Это может произойти, если systemId не найден и item.path тоже пустой
    if (!path && !navigationPath) {
      console.warn('[PageTemplate] Empty path for item:', {
        systemId: item.systemId,
        id: item.id,
        type: item.type,
        originalPath: item.path
      });
      // Для системных элементов без path используем id как fallback
      path = item.path || `/${item.id}`;
      navigationPath = path;
    }

    // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Принудительно переопределяем пути для data-documents и data-addresses
    // Это делается ПЕРЕД созданием sidebarItem, чтобы гарантированно установить правильные пути
    if (item.systemId === 'data-documents' || item.systemId === 'data-addresses') {
      let forcedPath = '';
      if (item.systemId === 'data-documents') {
        forcedPath = '/data/documents';
      } else if (item.systemId === 'data-addresses') {
        forcedPath = '/data/addresses';
      }
      const forcedPathWithLang = buildPathWithLang(forcedPath, currentLang);
      path = forcedPathWithLang;
      navigationPath = forcedPathWithLang;
      console.log('[PageTemplate] 🔧 FORCED default path BEFORE sidebarItem creation:', {
        systemId: item.systemId,
        forcedPath,
        finalPath: forcedPathWithLang,
        path,
        navigationPath
      });
    }

    const sidebarItem: SidebarItem = {
      label: resolveMenuItemLabel(item),
      path: path || navigationPath || '#', // Fallback на navigationPath или '#'
      navigationPath: navigationPath || path || '#', // Используем navigationPath, если есть, иначе path
      icon: finalIcon,
      type: item.type,
      externalUrl: item.externalUrl,
      openInNewTab: item.openInNewTab,
      iframeUrl: item.iframeUrl,
      iframeCode: item.iframeCode,
      embeddedAppUrl: item.embeddedAppUrl,
      active: isParentActive,
    };
    
    // ✅ КРИТИЧЕСКАЯ ПРОВЕРКА: Убеждаемся, что пути для data-documents и data-addresses установлены правильно
    // Это делается ПОСЛЕ создания sidebarItem, чтобы гарантированно исправить любые ошибки
    if (item.systemId === 'data-documents' || item.systemId === 'data-addresses') {
      const expectedPath = item.systemId === 'data-documents' 
        ? buildPathWithLang('/data/documents', currentLang)
        : buildPathWithLang('/data/addresses', currentLang);
      
      // Принудительно устанавливаем правильные пути, независимо от того, что было установлено ранее
      sidebarItem.path = expectedPath;
      sidebarItem.navigationPath = expectedPath;
      
      console.log('[PageTemplate] 🔧 FINAL FORCED default path AFTER sidebarItem creation:', {
        systemId: item.systemId,
        expectedPath,
        sidebarItemPath: sidebarItem.path,
        sidebarItemNavigationPath: sidebarItem.navigationPath,
        wasCorrected: sidebarItem.path === expectedPath && sidebarItem.navigationPath === expectedPath
      });
    }

    // Логируем системные разделы для отладки
    if (item.systemId) {
      console.log('[PageTemplate] Converted system item:', {
        systemId: item.systemId,
        systemIdType: typeof item.systemId,
        systemIdLength: item.systemId?.length,
        systemIdCharCodes: item.systemId?.split('').map(c => c.charCodeAt(0)),
        originalPath: item.path,
        finalPath: sidebarItem.path,
        navigationPath: sidebarItem.navigationPath,
        label: sidebarItem.label,
        hasChildren: !!item.children,
        systemPathsKeys: Object.keys(systemPaths || {}),
        defaultPathFound: systemPaths?.[item.systemId] !== undefined
      });
    }

    // Добавляем children, если они есть
    if (filteredChildren.length > 0) {
      sidebarItem.children = filteredChildren;
    }

    return sidebarItem;
  }, [currentLang, location.pathname, resolveMenuItemLabel]);

  // Дефолтные пункты меню (fallback)
  // Оптимизировано: пересобираем только при изменении языка (currentLang) или пути (location.pathname)
  // Функция t() автоматически обновляется при смене языка через i18n, поэтому i18n.language не нужен в зависимостях
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
      icon: 'database', 
      active: location.pathname.includes('/data') && !location.pathname.includes('/data/documents') && !location.pathname.includes('/data/addresses'),
      children: [
        {
          label: t('sidebar.documents'),
          path: buildPathWithLang('/data/documents', currentLang),
          icon: 'document',
          active: location.pathname.includes('/data/documents'),
        },
        {
          label: t('sidebar.addresses'),
          path: buildPathWithLang('/data/addresses', currentLang),
          icon: 'map-pin',
          active: location.pathname.includes('/data/addresses'),
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
      icon: 'headset', 
      active: location.pathname.includes('/support') 
    },
  ], [t, currentLang, location.pathname]);

  /**
   * Универсальная функция для автоматического определения вложенности на основе путей
   * Анализирует пути элементов и строит иерархию: если путь одного элемента начинается
   * с пути другого элемента + "/", то первый является дочерним для второго
   * ВАЖНО: Сохраняет порядок элементов из API (не меняет порядок родительских элементов)
   */
  const buildNestedStructure = React.useCallback((items: SidebarItem[]): SidebarItem[] => {
    // Нормализуем пути: убираем языковой префикс и query параметры для сравнения
    const normalizePath = (path: string | undefined): string => {
      if (!path) return '';
      // Убираем языковой префикс (например, /ru/ или /en/)
      let normalized = path.replace(/^\/[a-z]{2}\//, '/');
      // Убираем query параметры
      normalized = normalized.split('?')[0];
      // Убираем trailing slash (кроме корня)
      normalized = normalized === '/' ? '/' : normalized.replace(/\/$/, '');
      return normalized;
    };

    // Всегда логируем для отладки
    if (items.length > 0) {
      console.log('[PageTemplate] buildNestedStructure input:', items.map(item => ({
        label: item.label,
        path: item.path,
        normalized: normalizePath(item.path),
        hasChildren: !!item.children,
      })));
    }

    // Создаем копию массива для работы (СОХРАНЯЕМ ПОРЯДОК из API)
    const itemsCopy = items.map(item => ({ ...item }));
    
    // НЕ сортируем по длине пути - сохраняем порядок из админ-панели!
    // Вместо этого проходим по элементам в исходном порядке и строим иерархию

    // Строим иерархию, сохраняя порядок родительских элементов
    const rootItems: SidebarItem[] = [];
    const processedItems = new Set<string>();

    // Рекурсивная функция для поиска родителя в дереве (включая уже добавленные children)
    const findParentInTree = (items: SidebarItem[], itemPath: string): SidebarItem | null => {
      for (const rootItem of items) {
        const rootPath = normalizePath(rootItem.path);
        
        // Проверяем, является ли rootItem родителем для itemPath
        // Путь дочернего элемента должен начинаться с пути родителя + "/"
        // Например: /1/2 начинается с /1/
        if (rootPath && rootPath !== itemPath) {
          // Проверяем точное совпадение: itemPath должен начинаться с rootPath + "/"
          const parentPathWithSlash = rootPath + '/';
          if (itemPath.startsWith(parentPathWithSlash)) {
            // Всегда логируем для отладки
            console.log('[PageTemplate] Found parent:', {
              childPath: itemPath,
              parentPath: rootPath,
              parentPathWithSlash,
              parentLabel: rootItem.label,
              childLabel: items.find(i => normalizePath(i.path) === itemPath)?.label,
            });
            // Проверяем, не является ли этот элемент уже дочерним для другого элемента
            // Если у rootItem есть children, проверяем их тоже (для глубокой вложенности)
            if (rootItem.children && rootItem.children.length > 0) {
              const childParent = findParentInTree(rootItem.children, itemPath);
              if (childParent) {
                return childParent;
              }
            }
            return rootItem;
          }
        }
        // Рекурсивно проверяем children для глубокой вложенности
        if (rootItem.children && rootItem.children.length > 0) {
          const childParent = findParentInTree(rootItem.children, itemPath);
          if (childParent) {
            return childParent;
          }
        }
      }
      return null;
    };

    // Первый проход: добавляем все элементы в корень в исходном порядке (СОХРАНЯЕМ ПОРЯДОК из админ-панели)
    for (const item of itemsCopy) {
      const itemPath = normalizePath(item.path);
      
      // Пропускаем элементы без пути
      if (!itemPath || itemPath === '/') {
        rootItems.push(item);
        continue;
      }

      // Добавляем элемент в корень (в исходном порядке из API)
      rootItems.push(item);
    }

    // Второй проход: перемещаем дочерние элементы к родителям на основе путей
    // Проходим в обратном порядке, чтобы не нарушить индексы при удалении из rootItems
    for (let i = itemsCopy.length - 1; i >= 0; i--) {
      const item = itemsCopy[i];
      const itemPath = normalizePath(item.path);
      
      // Пропускаем элементы без пути или уже обработанные
      if (!itemPath || itemPath === '/' || processedItems.has(itemPath)) {
        continue;
      }

      // Ищем родительский элемент в дереве на основе пути
      // ВАЖНО: Проверяем вложенность на основе путей независимо от того,
      // есть ли у элементов уже children (из бэкенда через parentId)
      // Если путь одного элемента начинается с пути другого + "/",
      // то первый является дочерним для второго
      const parent = findParentInTree(rootItems, itemPath);
      
      if (parent) {
        // Найден родитель на основе пути - перемещаем элемент из корня к родителю
        const rootIndex = rootItems.findIndex(rootItem => {
          const rootPath = normalizePath(rootItem.path);
          return rootPath === itemPath;
        });
        
        if (rootIndex !== -1) {
          // Удаляем из корня
          const itemToMove = rootItems.splice(rootIndex, 1)[0];
          
          // Добавляем к родителю
          if (!parent.children) {
            parent.children = [];
          }
          // Сохраняем существующие children элемента, если они есть (из бэкенда)
          // Это позволяет комбинировать вложенность из parentId и вложенность из путей
          parent.children.push(itemToMove);
          
          // Всегда логируем для отладки
          console.log('[PageTemplate] Nested item:', {
            parent: { label: parent.label, path: parent.path, normalized: normalizePath(parent.path) },
            child: { label: itemToMove.label, path: itemToMove.path, normalized: itemPath },
          });
        }
      }
      
      processedItems.add(itemPath);
    }

    return rootItems;
  }, []);

  // Используем меню из API, если оно загружено, иначе дефолтное
  // Оптимизировано: пересобираем только при изменении данных меню или языка
  const configuredSidebarItems = React.useMemo(() => {
    // API возвращает { success: true, data: [...] }, axios оборачивает в { data: { success: true, data: [...] } }
    // Поэтому используем userMenuData?.data?.data
    const apiResponse = userMenuData?.data;
    const menuItemsFromApi = apiResponse?.data || apiResponse || [];
    
    // Всегда логируем для отладки
    if (menuItemsFromApi.length > 0) {
      console.log('[PageTemplate] Menu items from API:', menuItemsFromApi.map(item => ({ id: item.id, icon: item.icon, systemId: item.systemId, enabled: item.enabled, hasChildren: !!item.children, path: item.path, order: item.order })));
      // Логируем системные разделы отдельно
      const systemItems = menuItemsFromApi.filter(item => item.systemId);
      if (systemItems.length > 0) {
        console.log('[PageTemplate] System items from API:', systemItems.map(item => ({ systemId: item.systemId, path: item.path, label: item.label || item.name })));
      }
    }
    
    // Если API вернул данные (даже пустой массив), используем их
    // Fallback на defaultSidebarItems только если API еще не загрузился (userMenuData === undefined)
    if (userMenuData !== undefined) {
      // ✅ КРИТИЧЕСКОЕ ЛОГИРОВАНИЕ: Проверяем, что приходит из API для data-documents и data-addresses
      console.log('[PageTemplate] 🔍 CHECKING menuItemsFromApi for data-documents/addresses:', {
        totalItems: menuItemsFromApi.length,
        allSystemIds: menuItemsFromApi.map(item => item.systemId).filter(Boolean),
        dataDocsItems: menuItemsFromApi.filter(item => item.systemId && item.systemId.includes('document')),
        dataAddressesItems: menuItemsFromApi.filter(item => item.systemId && item.systemId.includes('address'))
      });
      
      const dataDocsItem = menuItemsFromApi.find(item => item.systemId === 'data-documents');
      const dataAddressesItem = menuItemsFromApi.find(item => item.systemId === 'data-addresses');
      
      console.log('[PageTemplate] 🔍 FIND RESULTS:', {
        dataDocsItem: dataDocsItem ? {
          systemId: dataDocsItem.systemId,
          path: dataDocsItem.path,
          id: dataDocsItem.id,
          type: dataDocsItem.type
        } : null,
        dataAddressesItem: dataAddressesItem ? {
          systemId: dataAddressesItem.systemId,
          path: dataAddressesItem.path,
          id: dataAddressesItem.id,
          type: dataAddressesItem.type
        } : null
      });
      
      // API загружен, используем данные из API (даже если пустой массив - все плагины выключены)
      const filteredItems = menuItemsFromApi
        .map(convertMenuItemToSidebarItem)
        .filter((item): item is SidebarItem => item !== null);
      
      // Применяем универсальную функцию для автоматического построения вложенности на основе путей
      const nestedItems = buildNestedStructure(filteredItems);
      
    // Всегда логируем для отладки
    console.log('[PageTemplate] Built nested structure:', {
      before: filteredItems.length,
      after: nestedItems.length,
      itemsBefore: filteredItems.map(item => ({ label: item.label, path: item.path })),
      itemsAfter: nestedItems.map(item => ({
        label: item.label,
        path: item.path,
        hasChildren: !!item.children,
        childrenCount: item.children?.length || 0,
        children: item.children?.map(c => ({ label: c.label, path: c.path })) || [],
      })),
    });
      
      return nestedItems;
    }
    
    // API еще не загрузился, используем fallback
    return defaultSidebarItems;
  }, [userMenuData, defaultSidebarItems, buildNestedStructure, convertMenuItemToSidebarItem]);

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

        <div className={`${themeClasses.page.content} ${shouldShowSidebar ? 'pb-20 xl:pb-0' : ''}`}>
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

      {/* Мобильная нижняя навигация - видна только на мобильных устройствах */}
      {shouldShowSidebar && finalSidebarItems && (
        <Suspense fallback={null}>
          <MobileBottomNav
            items={finalSidebarItems}
            onNavigate={(path) => navigate(path)}
          />
        </Suspense>
      )}
    </section>
  );
};


