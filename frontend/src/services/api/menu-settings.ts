import { apiClient } from './client';

export interface MenuItemConfig {
  id: string;
  type: 'default' | 'external' | 'iframe' | 'embedded';
  enabled: boolean;
  order: number;
  systemId?: string;
  label?: string;
  labelRu?: string; // Название на русском языке
  labelEn?: string; // Название на английском языке
  icon?: string;
  path?: string;
  children?: MenuItemConfig[];
  pluginId?: string; // ID связанного плагина (для интеграции с extensions)
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

export interface MenuSettingsResponse {
  success: boolean;
  data: MenuSettings;
}

export interface UserMenuResponse {
  success: boolean;
  data: MenuItemConfig[];
}

export const menuSettingsApi = {
  /**
   * Получить настройки меню (для админки)
   */
  getMenuSettings: () => apiClient.get<MenuSettingsResponse>('/admin/menu-settings'),

  /**
   * Обновить настройки меню (для админки)
   */
  updateMenuSettings: (settings: MenuSettings) =>
    apiClient.put<MenuSettingsResponse>('/admin/menu-settings', settings),

  /**
   * Получить меню для текущего пользователя (с учетом настроек)
   */
  getUserMenu: () => apiClient.get<UserMenuResponse>('/profile/menu'),
};

