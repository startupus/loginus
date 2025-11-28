import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DataPreloaderService } from '../data/data-preloader.service';

export interface MenuItemConfig {
  id: string;
  type: 'default' | 'external' | 'iframe' | 'embedded';
  enabled: boolean;
  order: number;
  systemId?: string;
  label?: string;
  icon?: string;
  path?: string;
  children?: MenuItemConfig[];
  // Для external
  externalUrl?: string;
  openInNewTab?: boolean;
  // Для iframe
  iframeUrl?: string;
  iframeCode?: string;
  // Для embedded
  embeddedAppUrl?: string;
}

export interface MenuSettings {
  items: MenuItemConfig[];
}

@Injectable()
export class MenuSettingsService {
  private settingsCache: MenuSettings | null = null;
  private settingsCacheTime: number = 0;
  private readonly CACHE_TTL = 60000; // 1 минута кэширования

  constructor(private readonly preloader: DataPreloaderService) {}

  /**
   * Базовые системные пункты меню (нельзя удалить)
   */
  private getDefaultMenuItems(): MenuItemConfig[] {
    return [
      {
        id: 'profile',
        type: 'default',
        enabled: true,
        order: 1,
        systemId: 'profile',
        label: 'Профиль',
        icon: 'home',
        path: '/dashboard',
      },
      {
        id: 'data',
        type: 'default',
        enabled: true,
        order: 2,
        systemId: 'data',
        label: 'Данные',
        icon: 'database',
        path: '/data',
        children: [
          {
            id: 'data-documents',
            type: 'default',
            enabled: true,
            order: 1,
            systemId: 'data-documents',
            label: 'Документы',
            icon: 'document',
            path: '/data/documents',
          },
          {
            id: 'data-addresses',
            type: 'default',
            enabled: true,
            order: 2,
            systemId: 'data-addresses',
            label: 'Адреса',
            icon: 'map-pin',
            path: '/data/addresses',
          },
        ],
      },
      {
        id: 'security',
        type: 'default',
        enabled: true,
        order: 3,
        systemId: 'security',
        label: 'Безопасность',
        icon: 'shield',
        path: '/security',
      },
      {
        id: 'family',
        type: 'default',
        enabled: true,
        order: 4,
        systemId: 'family',
        label: 'Семья',
        icon: 'users',
        path: '/family',
      },
      {
        id: 'work',
        type: 'default',
        enabled: true,
        order: 5,
        systemId: 'work',
        label: 'Работа',
        icon: 'briefcase',
        path: '/work',
      },
      {
        id: 'payments',
        type: 'default',
        enabled: true,
        order: 6,
        systemId: 'payments',
        label: 'Платежи',
        icon: 'credit-card',
        path: '/pay',
      },
      {
        id: 'support',
        type: 'default',
        enabled: true,
        order: 7,
        systemId: 'support',
        label: 'Поддержка',
        icon: 'help-circle',
        path: '/support',
      },
    ];
  }

  /**
   * Читаем настройки меню из JSON с кэшированием
   * Гарантируем, что базовые пункты всегда присутствуют
   */
  private getMenuSettingsData(): MenuSettings {
    const now = Date.now();

    if (this.settingsCache && (now - this.settingsCacheTime) < this.CACHE_TTL) {
      return this.settingsCache;
    }

    let loadedSettings: MenuSettings;
    const preloaded = this.preloader.getPreloadedData<MenuSettings>('menu-settings.json');
    if (preloaded) {
      loadedSettings = preloaded;
    } else {
      const settingsPath = path.join(__dirname, '../../data/menu-settings.json');
      const settingsData = fs.readFileSync(settingsPath, 'utf-8');
      loadedSettings = JSON.parse(settingsData);
    }

    // Гарантируем наличие всех базовых пунктов
    const defaultItems = this.getDefaultMenuItems();
    const defaultItemsMap = new Map(defaultItems.map(item => [item.id, item]));
    const loadedItemsMap = new Map(loadedSettings.items.filter(item => item.type === 'default').map(item => [item.id, item]));

    // Объединяем: берем настройки из загруженных данных (enabled, order), но структуру из дефолтных
    const mergedDefaultItems = defaultItems.map(defaultItem => {
      const loadedItem = loadedItemsMap.get(defaultItem.id);
      if (loadedItem) {
        // Сохраняем настройки из загруженных данных
        return {
          ...defaultItem,
          enabled: loadedItem.enabled,
          order: loadedItem.order,
          // Сохраняем children если они есть в загруженных данных
          children: loadedItem.children || defaultItem.children,
        };
      }
      return defaultItem;
    });

    // Получаем кастомные пункты
    const customItems = loadedSettings.items.filter(item => item.type !== 'default');

    // Объединяем базовые и кастомные
    const allItems = [...mergedDefaultItems, ...customItems].sort((a, b) => a.order - b.order);

    this.settingsCache = {
      items: allItems,
    };
    this.settingsCacheTime = now;

    return this.settingsCache;
  }

  /**
   * Сохраняем настройки меню в JSON
   */
  private saveMenuSettings(settings: MenuSettings): void {
    const settingsPath = path.join(__dirname, '../../data/menu-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    this.settingsCache = settings;
    this.settingsCacheTime = Date.now();
  }

  /**
   * Получить настройки меню
   */
  getMenuSettings(): MenuSettings {
    return this.getMenuSettingsData();
  }

  /**
   * Обновить настройки меню
   */
  updateMenuSettings(settings: MenuSettings): MenuSettings {
    // Валидация структуры
    if (!settings || !Array.isArray(settings.items)) {
      throw new Error('Invalid menu settings structure');
    }

    // Получаем текущие настройки для сохранения базовых пунктов
    const currentSettings = this.getMenuSettingsData();
    const currentDefaultItems = currentSettings.items.filter(item => item.type === 'default');
    
    // Объединяем базовые пункты с обновленными
    // Базовые пункты берутся из текущих настроек (чтобы сохранить их настройки)
    const defaultItemsMap = new Map(currentDefaultItems.map(item => [item.id, item]));
    
    // Обновляем базовые пункты из переданных настроек (если они там есть)
    settings.items.forEach(item => {
      if (item.type === 'default' && defaultItemsMap.has(item.id)) {
        // Обновляем только enabled и order для базовых пунктов
        const existing = defaultItemsMap.get(item.id)!;
        existing.enabled = item.enabled;
        existing.order = item.order;
        // Обновляем children если они есть
        if (item.children) {
          existing.children = item.children;
        }
      }
    });

    // Получаем кастомные пункты из переданных настроек
    const customItems = settings.items.filter(item => item.type !== 'default');
    
    // Объединяем базовые и кастомные пункты
    const allItems = [...Array.from(defaultItemsMap.values()), ...customItems];
    
    // Сортируем по order
    const sortedItems = allItems.sort((a, b) => a.order - b.order);
    
    // Если есть children, тоже сортируем
    sortedItems.forEach(item => {
      if (item.children && Array.isArray(item.children)) {
        item.children.sort((a, b) => a.order - b.order);
      }
    });

    const updatedSettings: MenuSettings = {
      items: sortedItems,
    };

    this.saveMenuSettings(updatedSettings);
    return updatedSettings;
  }

  /**
   * Получить меню для пользователя (с учетом настроек)
   * Возвращает только включенные пункты, отсортированные по order
   */
  getUserMenu(): MenuItemConfig[] {
    const settings = this.getMenuSettingsData();
    return settings.items
      .filter(item => item.enabled)
      .map(item => {
        // Если есть children, фильтруем их тоже
        if (item.children && Array.isArray(item.children)) {
          return {
            ...item,
            children: item.children.filter(child => child.enabled),
          };
        }
        return item;
      })
      .filter(item => {
        // Удаляем пункты, у которых все children отключены
        if (item.children && item.children.length === 0) {
          return false;
        }
        return true;
      });
  }
}

