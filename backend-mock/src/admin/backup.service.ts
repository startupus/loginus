import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DataPreloaderService } from '../data/data-preloader.service';

export interface BackupSettings {
  sync: {
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
  };
  backup: {
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
      yandexDisk: {
        token: string;
        path: string;
        connected: boolean;
      };
      custom: {
        type: string;
        endpoint: string;
        credentials: Record<string, any>;
      };
    };
  };
}

export interface BackupHistory {
  backups: Backup[];
  lastSync?: {
    date: string;
    status: 'success' | 'error';
    updatedRecords: number;
    enrichedRecords: number;
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

@Injectable()
export class BackupService {
  private settingsCache: BackupSettings | null = null;
  private historyCache: BackupHistory | null = null;
  private settingsCacheTime: number = 0;
  private historyCacheTime: number = 0;
  private readonly CACHE_TTL = 60000; // 1 минута кэширования

  constructor(private readonly preloader: DataPreloaderService) {}

  // Читаем настройки бекапов из JSON с кэшированием
  private getSettingsData(): BackupSettings {
    const now = Date.now();
    
    if (this.settingsCache && (now - this.settingsCacheTime) < this.CACHE_TTL) {
      return this.settingsCache;
    }

    const preloaded = this.preloader.getPreloadedData<BackupSettings>('backup-settings.json');
    if (preloaded) {
      this.settingsCache = preloaded;
      this.settingsCacheTime = now;
      return this.settingsCache;
    }

    const settingsPath = path.join(__dirname, '../../data/backup-settings.json');
    const settingsData = fs.readFileSync(settingsPath, 'utf-8');
    this.settingsCache = JSON.parse(settingsData);
    this.settingsCacheTime = now;
    
    return this.settingsCache;
  }

  // Сохраняем настройки бекапов в JSON
  private saveSettings(settings: BackupSettings): void {
    const settingsPath = path.join(__dirname, '../../data/backup-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    this.settingsCache = settings;
    this.settingsCacheTime = Date.now();
  }

  // Читаем историю бекапов из JSON с кэшированием
  private getHistoryData(): BackupHistory {
    const now = Date.now();
    
    if (this.historyCache && (now - this.historyCacheTime) < this.CACHE_TTL) {
      return this.historyCache;
    }

    const preloaded = this.preloader.getPreloadedData<BackupHistory>('backup-history.json');
    if (preloaded) {
      this.historyCache = preloaded;
      this.historyCacheTime = now;
      return this.historyCache;
    }

    const historyPath = path.join(__dirname, '../../data/backup-history.json');
    const historyData = fs.readFileSync(historyPath, 'utf-8');
    this.historyCache = JSON.parse(historyData);
    this.historyCacheTime = now;
    
    return this.historyCache;
  }

  // Сохраняем историю бекапов в JSON
  private saveHistory(history: BackupHistory): void {
    const historyPath = path.join(__dirname, '../../data/backup-history.json');
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
    this.historyCache = history;
    this.historyCacheTime = Date.now();
  }

  // Получение настроек синхронизации
  public getSyncSettings(): BackupSettings['sync'] {
    const settings = this.getSettingsData();
    return settings.sync;
  }

  // Обновление настроек синхронизации
  public updateSyncSettings(syncSettings: Partial<BackupSettings['sync']>): BackupSettings['sync'] {
    const settings = this.getSettingsData();
    settings.sync = { ...settings.sync, ...syncSettings };
    this.saveSettings(settings);
    return settings.sync;
  }

  // Проверка подключения к центральному серверу
  public async testSyncConnection(url: string, apiKey: string): Promise<{ connected: boolean; error?: string }> {
    // Мок проверки подключения
    if (!url || !apiKey) {
      return { connected: false, error: 'URL и API ключ обязательны' };
    }

    // Симуляция проверки подключения
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Обновляем статус подключения в настройках
    const settings = this.getSettingsData();
    settings.sync.centralServer.url = url;
    settings.sync.centralServer.apiKey = apiKey;
    settings.sync.centralServer.connected = true;
    this.saveSettings(settings);

    return { connected: true };
  }

  // Запуск синхронизации вручную
  public async runSync(): Promise<{ success: boolean; updatedRecords: number; enrichedRecords: number; error?: string }> {
    const settings = this.getSettingsData();
    
    if (!settings.sync.enabled) {
      return { success: false, updatedRecords: 0, enrichedRecords: 0, error: 'Синхронизация отключена' };
    }

    if (!settings.sync.centralServer.connected) {
      return { success: false, updatedRecords: 0, enrichedRecords: 0, error: 'Нет подключения к центральному серверу' };
    }

    // Симуляция синхронизации
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedRecords = Math.floor(Math.random() * 50) + 10;
    const enrichedRecords = settings.sync.enrichment.enabled ? Math.floor(Math.random() * 10) : 0;

    // Обновляем статус последней синхронизации
    const history = this.getHistoryData();
    history.lastSync = {
      date: new Date().toISOString(),
      status: 'success',
      updatedRecords,
      enrichedRecords,
    };
    this.saveHistory(history);

    return { success: true, updatedRecords, enrichedRecords };
  }

  // Получение статуса последней синхронизации
  public getSyncStatus(): BackupHistory['lastSync'] {
    const history = this.getHistoryData();
    return history.lastSync;
  }

  // Получение настроек бекапов
  public getBackupSettings(): BackupSettings['backup'] {
    const settings = this.getSettingsData();
    return settings.backup;
  }

  // Обновление настроек бекапов
  public updateBackupSettings(backupSettings: Partial<BackupSettings['backup']>): BackupSettings['backup'] {
    const settings = this.getSettingsData();
    settings.backup = { ...settings.backup, ...backupSettings };
    this.saveSettings(settings);
    return settings.backup;
  }

  // Создание бекапа вручную
  public async createBackup(options: {
    include: {
      users: boolean;
      settings: boolean;
      logs: boolean;
    };
  }): Promise<Backup> {
    // Симуляция создания бекапа
    await new Promise(resolve => setTimeout(resolve, 1500));

    const backup: Backup = {
      id: `backup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      type: 'manual',
      size: Math.floor(Math.random() * 10000000) + 1000000, // 1-10 MB
      storage: this.getSettingsData().backup.storage.type === 'local' ? 'local' : 
               this.getSettingsData().backup.storage.type === 'yandex-disk' ? 'yandex-disk' : 's3',
      status: 'success',
      includes: options.include,
      error: null,
    };

    // Добавляем бекап в историю
    const history = this.getHistoryData();
    history.backups.unshift(backup);
    this.saveHistory(history);

    return backup;
  }

  // Получение истории бекапов
  public getBackupHistory(filters?: {
    type?: 'auto' | 'manual';
    status?: 'success' | 'in-progress' | 'error';
    dateFrom?: string;
    dateTo?: string;
  }): Backup[] {
    const history = this.getHistoryData();
    let backups = [...history.backups];

    if (filters) {
      if (filters.type) {
        backups = backups.filter(b => b.type === filters.type);
      }
      if (filters.status) {
        backups = backups.filter(b => b.status === filters.status);
      }
      if (filters.dateFrom) {
        backups = backups.filter(b => new Date(b.createdAt) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        backups = backups.filter(b => new Date(b.createdAt) <= new Date(filters.dateTo!));
      }
    }

    return backups;
  }

  // Получение бекапа по ID
  public getBackupById(id: string): Backup | null {
    const history = this.getHistoryData();
    return history.backups.find(b => b.id === id) || null;
  }

  // Восстановление из бекапа
  public async restoreBackup(id: string, options: {
    restoreUsers: boolean;
    restoreSettings: boolean;
    restoreLogs: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    const backup = this.getBackupById(id);
    
    if (!backup) {
      return { success: false, error: 'Бекап не найден' };
    }

    if (backup.status !== 'success') {
      return { success: false, error: 'Бекап не может быть восстановлен (статус: ' + backup.status + ')' };
    }

    // Симуляция восстановления
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { success: true };
  }

  // Удаление бекапа
  public deleteBackup(id: string): { success: boolean; error?: string } {
    const history = this.getHistoryData();
    const index = history.backups.findIndex(b => b.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Бекап не найден' };
    }

    history.backups.splice(index, 1);
    this.saveHistory(history);

    return { success: true };
  }

  // Получение статистики бекапов
  public getBackupStats(): {
    totalSize: number;
    totalCount: number;
    autoCount: number;
    manualCount: number;
    lastBackup: Backup | null;
    nextAutoBackup: string | null;
  } {
    const history = this.getHistoryData();
    const backups = history.backups;
    
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    const totalCount = backups.length;
    const autoCount = backups.filter(b => b.type === 'auto').length;
    const manualCount = backups.filter(b => b.type === 'manual').length;
    const lastBackup = backups.length > 0 ? backups[0] : null;

    // Вычисляем следующий автоматический бекап
    const settings = this.getSettingsData();
    let nextAutoBackup: string | null = null;
    
    if (settings.backup.autoBackup.enabled) {
      const now = new Date();
      const [hours, minutes] = settings.backup.autoBackup.time.split(':').map(Number);
      const nextDate = new Date();
      nextDate.setHours(hours, minutes, 0, 0);
      
      if (nextDate <= now) {
        // Если время уже прошло сегодня, планируем на завтра
        nextDate.setDate(nextDate.getDate() + 1);
      }
      
      nextAutoBackup = nextDate.toISOString();
    }

    return {
      totalSize,
      totalCount,
      autoCount,
      manualCount,
      lastBackup,
      nextAutoBackup,
    };
  }
}

