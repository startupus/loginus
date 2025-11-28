export interface MenuItemConfig {
  id: string;
  type: 'default' | 'external' | 'iframe' | 'embedded';
  enabled: boolean;
  order: number;
  icon?: string;
  path?: string;
  externalUrl?: string;
  iframeUrl?: string;
  iframeCode?: string;
  embeddedAppUrl?: string;
  openInNewTab?: boolean;
  label?: string;
  labelRu?: string;
  labelEn?: string;
  systemId?: string;
  children?: MenuItemConfig[];
}

const defaultSidebarLabels: Record<
  string,
  { ru: string; en: string }
> = {
  profile: { ru: 'Профиль', en: 'Profile' },
  data: { ru: 'Данные', en: 'Data' },
  'data-documents': { ru: 'Документы', en: 'Documents' },
  'data-addresses': { ru: 'Адреса', en: 'Addresses' },
  security: { ru: 'Безопасность', en: 'Security' },
  family: { ru: 'Семья', en: 'Family' },
  work: { ru: 'Работа', en: 'Work' },
  payments: { ru: 'Платежи', en: 'Payments' },
  support: { ru: 'Поддержка', en: 'Support' },
};

function buildSystemMenuItem(params: {
  id: string;
  systemId: string;
  path: string;
  icon: string;
  order: number;
}): MenuItemConfig {
  const labels = defaultSidebarLabels[params.systemId] || {
    ru: params.systemId,
    en: params.systemId,
  };

  return {
    id: params.id,
    type: 'default',
    systemId: params.systemId,
    icon: params.icon,
    path: params.path,
    enabled: true,
    order: params.order,
    label: labels.ru,
    labelRu: labels.ru,
    labelEn: labels.en,
  };
}

export interface NavigationMenuSeed {
  menuId: string;
  name: string;
  items: MenuItemConfig[];
  conditions: Record<string, any>;
  priority: number;
  isActive: boolean;
  metadata: Record<string, any>;
}

export const defaultSidebarMenuItems: MenuItemConfig[] = [
  buildSystemMenuItem({
    id: 'dashboard',
    systemId: 'profile',
    icon: 'home',
    path: '/dashboard',
    order: 1,
  }),
  buildSystemMenuItem({
    id: 'data',
    systemId: 'data',
    icon: 'database',
    path: '/data',
    order: 2,
  }),
  buildSystemMenuItem({
    id: 'data-documents',
    systemId: 'data-documents',
    icon: 'document',
    path: '/data/documents',
    order: 3,
  }),
  buildSystemMenuItem({
    id: 'data-addresses',
    systemId: 'data-addresses',
    icon: 'map-pin',
    path: '/data/addresses',
    order: 4,
  }),
  buildSystemMenuItem({
    id: 'security',
    systemId: 'security',
    icon: 'shield',
    path: '/security',
    order: 5,
  }),
  buildSystemMenuItem({
    id: 'family',
    systemId: 'family',
    icon: 'users',
    path: '/family',
    order: 6,
  }),
  buildSystemMenuItem({
    id: 'work',
    systemId: 'work',
    icon: 'briefcase',
    path: '/work',
    order: 7,
  }),
  buildSystemMenuItem({
    id: 'payments',
    systemId: 'payments',
    icon: 'credit-card',
    path: '/pay',
    order: 8,
  }),
  buildSystemMenuItem({
    id: 'support',
    systemId: 'support',
    icon: 'help-circle',
    path: '/support',
    order: 9,
  }),
];

// Маппинг системных ID на дефолтные иконки
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

export function applyDefaultLabels(items: MenuItemConfig[]): MenuItemConfig[] {
  return items.map((item) => {
    const systemKey = item.systemId || item.id;
    const labels = defaultSidebarLabels[systemKey];
    const defaultIcon = defaultIcons[systemKey];

    const enriched: MenuItemConfig = {
      ...item,
    };

    // Применяем дефолтные метки
    if (labels) {
      enriched.labelRu = enriched.labelRu || labels.ru;
      enriched.labelEn = enriched.labelEn || labels.en;
      enriched.label = enriched.label || enriched.labelRu || enriched.labelEn;
    } else if (!enriched.label && (enriched.labelRu || enriched.labelEn)) {
      enriched.label = enriched.labelRu || enriched.labelEn;
    }

    // Применяем дефолтные иконки для системных пунктов меню
    // Всегда применяем дефолтные иконки для системных пунктов, чтобы гарантировать их наличие
    if (defaultIcon && item.systemId) {
      enriched.icon = defaultIcon;
    }

    if (item.children?.length) {
      enriched.children = applyDefaultLabels(item.children);
    }

    return enriched;
  });
}

export function getDefaultMenuSeed(menuId: string): NavigationMenuSeed | null {
  if (menuId !== 'sidebar-main') {
    return null;
  }

  return {
    menuId,
    name: 'Sidebar Main',
    items: defaultSidebarMenuItems,
    conditions: {},
    priority: 100,
    isActive: true,
    metadata: {},
  };
}

