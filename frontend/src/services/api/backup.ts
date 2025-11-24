import { apiClient } from './client';

export interface SyncSettings {
  enabled: boolean;
  schedule: 'hourly' | 'daily' | 'weekly' | 'manual';
  time: string;
  type: 'one-way' | 'two-way';
  centralServer: {
    url: string;
    apiKey: string;
    connected: boolean;
  };
  enrichment: {
    enabled: boolean;
    sources: string[];
    autoEnrich: boolean;
  };
}

export interface BackupSettings {
  autoBackup: {
    enabled: boolean;
    schedule: 'daily' | 'weekly' | 'monthly';
    time: string;
    include: {
      users: boolean;
      settings: boolean;
      logs: boolean;
    };
  };
  storage: {
    type: 'local' | 'yandex-disk' | 's3' | 'custom';
    local: {
      enabled: boolean;
    };
    yandexDisk: {
      token: string;
      path: string;
      connected: boolean;
      enabled: boolean;
    };
    s3: {
      endpoint: string;
      credentials: Record<string, any>;
      enabled: boolean;
    };
    custom: {
      type: string;
      endpoint: string;
      credentials: Record<string, any>;
      enabled: boolean;
    };
  };
}

export interface Backup {
  id: string;
  createdAt: string;
  type: 'auto' | 'manual';
  size: number;
  storage: 'local' | 'yandex-disk' | 's3';
  status: 'success' | 'in-progress' | 'error';
  includes: {
    users: boolean;
    settings: boolean;
    logs: boolean;
  };
  error: string | null;
}

export interface SyncStatus {
  date: string;
  status: 'success' | 'error';
  updatedRecords: number;
  enrichedRecords: number;
}

export interface BackupStats {
  totalSize: number;
  totalCount: number;
  autoCount: number;
  manualCount: number;
  lastBackup: Backup | null;
  nextAutoBackup: string | null;
}

export interface BackupHistoryFilters {
  type?: 'auto' | 'manual';
  status?: 'success' | 'in-progress' | 'error';
  dateFrom?: string;
  dateTo?: string;
}

export const backupApi = {
  // Синхронизация

  /**
   * Получение настроек синхронизации
   */
  getSyncSettings: async (): Promise<SyncSettings> => {
    const response = await apiClient.get('/admin/backup/sync/settings');
    return response.data.data;
  },

  /**
   * Обновление настроек синхронизации
   */
  updateSyncSettings: async (settings: Partial<SyncSettings>): Promise<SyncSettings> => {
    const response = await apiClient.put('/admin/backup/sync/settings', settings);
    return response.data.data;
  },

  /**
   * Проверка подключения к центральному серверу
   */
  testSyncConnection: async (url: string, apiKey: string): Promise<{ connected: boolean; error?: string }> => {
    const response = await apiClient.post('/admin/backup/sync/test', { url, apiKey });
    return response.data.data;
  },

  /**
   * Запуск синхронизации вручную
   */
  runSync: async (): Promise<{ success: boolean; updatedRecords: number; enrichedRecords: number; error?: string }> => {
    const response = await apiClient.post('/admin/backup/sync/run');
    return response.data.data;
  },

  /**
   * Получение статуса последней синхронизации
   */
  getSyncStatus: async (): Promise<SyncStatus | undefined> => {
    const response = await apiClient.get('/admin/backup/sync/status');
    return response.data.data;
  },

  // Бекапы

  /**
   * Получение настроек бекапов
   */
  getBackupSettings: async (): Promise<BackupSettings> => {
    const response = await apiClient.get('/admin/backup/settings');
    return response.data.data;
  },

  /**
   * Обновление настроек бекапов
   */
  updateBackupSettings: async (settings: Partial<BackupSettings>): Promise<BackupSettings> => {
    const response = await apiClient.put('/admin/backup/settings', settings);
    return response.data.data;
  },

  /**
   * Создание бекапа вручную
   */
  createBackup: async (options: {
    include: {
      users: boolean;
      settings: boolean;
      logs: boolean;
    };
  }): Promise<Backup> => {
    const response = await apiClient.post('/admin/backup/create', options);
    return response.data.data;
  },

  /**
   * Получение истории бекапов
   */
  getBackupHistory: async (filters?: BackupHistoryFilters): Promise<Backup[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = `/admin/backup/history${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  /**
   * Получение статистики бекапов
   */
  getBackupStats: async (): Promise<BackupStats> => {
    const response = await apiClient.get('/admin/backup/stats');
    return response.data.data;
  },

  /**
   * Скачивание бекапа
   */
  downloadBackup: async (id: string): Promise<{ id: string; downloadUrl: string; size: number }> => {
    const response = await apiClient.get(`/admin/backup/${id}/download`);
    return response.data.data;
  },

  /**
   * Восстановление из бекапа
   */
  restoreBackup: async (
    id: string,
    options: {
      restoreUsers: boolean;
      restoreSettings: boolean;
      restoreLogs: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await apiClient.post(`/admin/backup/${id}/restore`, options);
    return response.data.data;
  },

  /**
   * Удаление бекапа
   */
  deleteBackup: async (id: string): Promise<{ success: boolean; error?: string }> => {
    const response = await apiClient.delete(`/admin/backup/${id}`);
    return response.data.data;
  },
};

