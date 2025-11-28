import { IMenuPlugin, MenuPluginMetadata } from '../interfaces/menu-plugin.interface';
import { MenuItemConfig } from '../../settings/micro-modules/ui-permissions/default-menus';

/**
 * Базовый класс для плагинов меню
 * Похож на структуру плагинов в Joomla
 */
export class BaseMenuPlugin implements IMenuPlugin {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: 'system' | 'custom';
  readonly version?: string;
  readonly author?: string;
  enabled: boolean;
  order: number;
  parentId?: string;
  menuItem: MenuItemConfig;
  params?: Record<string, any>;

  constructor(metadata: MenuPluginMetadata) {
    this.id = metadata.id;
    this.name = metadata.name;
    this.description = metadata.description;
    this.type = metadata.type;
    this.version = metadata.version;
    this.author = metadata.author;
    this.enabled = metadata.menuItem.enabled !== false;
    this.order = metadata.order || metadata.menuItem.order || 0;
    this.parentId = metadata.parentId;
    this.menuItem = metadata.menuItem;
    this.params = metadata.params;
  }

  /**
   * Инициализация плагина
   */
  async onInit(): Promise<void> {
    // Переопределить в дочерних классах при необходимости
  }

  /**
   * Деактивация плагина
   */
  async onDisable(): Promise<void> {
    this.enabled = false;
    this.menuItem.enabled = false;
  }

  /**
   * Активация плагина
   */
  async onEnable(): Promise<void> {
    this.enabled = true;
    this.menuItem.enabled = true;
  }

  /**
   * Обновить конфигурацию пункта меню
   */
  updateMenuItem(menuItem: Partial<MenuItemConfig>): void {
    this.menuItem = {
      ...this.menuItem,
      ...menuItem,
    };
  }

  /**
   * Обновить порядок
   */
  setOrder(order: number): void {
    this.order = order;
    this.menuItem.order = order;
  }

  /**
   * Установить родительский плагин
   */
  setParent(parentId: string | undefined): void {
    this.parentId = parentId;
  }
}

