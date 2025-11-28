import { MenuItemConfig } from '../../settings/micro-modules/ui-permissions/default-menus';

/**
 * Интерфейс плагина меню (похож на Joomla плагины)
 * Каждый пункт меню - это плагин, который может быть включен/выключен
 */
export interface IMenuPlugin {
  /**
   * Уникальный идентификатор плагина
   */
  readonly id: string;

  /**
   * Название плагина
   */
  readonly name: string;

  /**
   * Описание плагина
   */
  readonly description?: string;

  /**
   * Тип плагина (system - системный, custom - пользовательский)
   */
  readonly type: 'system' | 'custom';

  /**
   * Версия плагина
   */
  readonly version?: string;

  /**
   * Автор плагина
   */
  readonly author?: string;

  /**
   * Включен ли плагин
   */
  enabled: boolean;

  /**
   * Порядок выполнения (для сортировки)
   */
  order: number;

  /**
   * ID родительского плагина (для вложенности)
   */
  parentId?: string;

  /**
   * Конфигурация пункта меню, который добавляет этот плагин
   */
  menuItem: MenuItemConfig;

  /**
   * Дополнительные параметры плагина
   */
  params?: Record<string, any>;

  /**
   * Метод инициализации плагина
   */
  onInit?(): void | Promise<void>;

  /**
   * Метод деактивации плагина
   */
  onDisable?(): void | Promise<void>;

  /**
   * Метод активации плагина
   */
  onEnable?(): void | Promise<void>;
}

/**
 * Метаданные плагина для регистрации
 */
export interface MenuPluginMetadata {
  id: string;
  name: string;
  description?: string;
  type: 'system' | 'custom';
  version?: string;
  author?: string;
  menuItem: MenuItemConfig;
  order?: number;
  parentId?: string;
  params?: Record<string, any>;
}

