/**
 * События меню
 */

export const MENU_EVENTS = {
  // Рендеринг меню
  BEFORE_RENDER: 'menu.before_render',
  AFTER_RENDER: 'menu.after_render',

  // Клик по элементу меню
  ITEM_BEFORE_CLICK: 'menu.item.before_click',
  ITEM_AFTER_CLICK: 'menu.item.after_click',

  // CRUD операции с элементами меню
  ITEM_CREATED: 'menu.item.created',
  ITEM_UPDATED: 'menu.item.updated',
  ITEM_DELETED: 'menu.item.deleted',

  // Структура меню
  STRUCTURE_CHANGED: 'menu.structure_changed',
  ITEM_REORDERED: 'menu.item.reordered',
  ITEM_MOVED: 'menu.item.moved',

  // Настройки меню
  SETTINGS_UPDATED: 'menu.settings_updated',
  ITEM_ENABLED: 'menu.item.enabled',
  ITEM_DISABLED: 'menu.item.disabled',

  // Wildcard
  ALL: 'menu.*',
  ALL_ITEMS: 'menu.item.*',
} as const;

/**
 * Типы данных для событий меню
 */
export interface MenuItemCreatedEventData {
  itemId: string;
  type: string;
  label: string;
  path?: string;
  pluginId?: string;
}

export interface MenuItemUpdatedEventData {
  itemId: string;
  changes: Record<string, any>;
  previousValues: Record<string, any>;
}

export interface MenuItemDeletedEventData {
  itemId: string;
  label: string;
}

export interface MenuItemClickedEventData {
  itemId: string;
  userId?: string;
  path: string;
}

export interface MenuStructureChangedEventData {
  items: any[];
  changedBy?: string;
}

