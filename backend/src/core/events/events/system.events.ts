/**
 * Системные события
 */

export const SYSTEM_EVENTS = {
  // Жизненный цикл приложения
  STARTUP: 'system.startup',
  SHUTDOWN: 'system.shutdown',
  READY: 'system.ready',

  // Конфигурация
  CONFIG_CHANGED: 'system.config_changed',
  CONFIG_RELOADED: 'system.config_reloaded',

  // Здоровье системы
  HEALTH_CHECK: 'system.health_check',
  ERROR: 'system.error',
  WARNING: 'system.warning',

  // Wildcard
  ALL: 'system.*',
} as const;

/**
 * События плагинов/расширений
 */
export const PLUGIN_EVENTS = {
  // Установка
  INSTALLING: 'plugin.installing',
  INSTALLED: 'plugin.installed',
  INSTALL_FAILED: 'plugin.install_failed',

  // Удаление
  UNINSTALLING: 'plugin.uninstalling',
  UNINSTALLED: 'plugin.uninstalled',
  UNINSTALL_FAILED: 'plugin.uninstall_failed',

  // Активация
  ENABLING: 'plugin.enabling',
  ENABLED: 'plugin.enabled',
  ENABLE_FAILED: 'plugin.enable_failed',

  // Деактивация
  DISABLING: 'plugin.disabling',
  DISABLED: 'plugin.disabled',
  DISABLE_FAILED: 'plugin.disable_failed',

  // Обновление
  UPDATING: 'plugin.updating',
  UPDATED: 'plugin.updated',
  UPDATE_FAILED: 'plugin.update_failed',

  // Конфигурация
  CONFIG_CHANGED: 'plugin.config_changed',
  CONFIG_VALIDATED: 'plugin.config_validated',

  // Загрузка
  LOADING: 'plugin.loading',
  LOADED: 'plugin.loaded',
  LOAD_FAILED: 'plugin.load_failed',

  // Ошибки
  ERROR: 'plugin.error',

  // Wildcard
  ALL: 'plugin.*',
} as const;

/**
 * Типы данных для системных событий
 */
export interface SystemStartupEventData {
  version: string;
  environment: string;
  timestamp: Date;
}

export interface SystemConfigChangedEventData {
  key: string;
  oldValue: any;
  newValue: any;
}

export interface PluginInstalledEventData {
  pluginId: string;
  name: string;
  version: string;
  type: string;
}

export interface PluginEnabledEventData {
  pluginId: string;
  name: string;
}

export interface PluginDisabledEventData {
  pluginId: string;
  name: string;
}

export interface PluginUninstalledEventData {
  pluginId: string;
  name: string;
}

export interface PluginErrorEventData {
  pluginId: string;
  error: string;
  stack?: string;
}

