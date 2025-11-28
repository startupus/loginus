import { apiClient } from './client';

export type PluginType = 'external_link' | 'iframe' | 'web_app';

export interface Plugin {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  type: PluginType;
  enabled: boolean;
  order: number;
  scope: string;
  allowedRoles: string[];
  requiredPermissions: string[];
  config: Record<string, any>;
  menuId?: string | null;
  menuItemId?: string | null;
  menuParentItemId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LaunchPluginRequest {
  orgId?: string;
  locale?: string;
  location?: string;
  extra?: Record<string, any>;
}

export interface LaunchPluginData {
  launchUrl: string;
  initData: string;
  expiresInSeconds: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const pluginsApi = {
  /**
   * Список плагинов, доступных текущему пользователю.
   */
  getAvailable: () =>
    apiClient.get<ApiResponse<Plugin[]>>('/plugins/available'),

  /**
   * Запустить embedded web_app-плагин и получить launchUrl + initData.
   */
  launchWebApp: (slug: string, body: LaunchPluginRequest) =>
    apiClient.post<ApiResponse<LaunchPluginData>>(
      `/plugins/${encodeURIComponent(slug)}/launch`,
      body,
    ),
};


