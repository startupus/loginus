import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../design-system/primitives/Button';
import { Input } from '../../../design-system/primitives/Input';
import { Icon } from '../../../design-system/primitives/Icon';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { backupApi, BackupSettings } from '../../../services/api/backup';
import { StorageConfigModal } from './StorageConfigModal';

/**
 * BackupSettingsSection - секция настроек бекапов
 */
export const BackupSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  const { data: backupSettings, isLoading } = useQuery<BackupSettings>({
    queryKey: ['backup-settings'],
    queryFn: () => backupApi.getBackupSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (settings: Partial<BackupSettings>) => backupApi.updateBackupSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] });
    },
  });

  if (isLoading || !backupSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="loader" size="lg" className="animate-spin text-primary" />
      </div>
    );
  }

  const handleToggle = (path: string, value: any) => {
    const pathParts = path.split('.');
    const updates: any = { ...backupSettings };
    let current: any = updates;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const key = pathParts[i];
      current[key] = { ...current[key] };
      current = current[key];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    updateMutation.mutate(updates);
  };

  const handleInputChange = (path: string, value: any) => {
    handleToggle(path, value);
  };

  const handleStorageTypeChange = (type: 'local' | 'yandex-disk' | 's3' | 'custom') => {
    handleToggle('storage.type', type);
  };

  return (
    <div className="space-y-6">
      {/* Автоматические бекапы */}
      <div className={`${themeClasses.card.default} p-6`}>
        <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
          {t('admin.backup.backup.autoBackup', 'Автоматические бекапы')}
        </h3>

        <div className="space-y-4">
          {/* Включение автоматических бекапов */}
          <div className="flex items-center justify-between">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}>
                {t('admin.backup.backup.enableAuto', 'Включить автоматические бекапы')}
              </label>
              <p className={`text-xs ${themeClasses.text.secondary}`}>
                {t('admin.backup.backup.enableAutoDesc', 'Автоматическое создание бекапов по расписанию')}
              </p>
            </div>
            <button
              onClick={() => handleToggle('autoBackup.enabled', !backupSettings.autoBackup.enabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                backupSettings.autoBackup.enabled ? 'bg-success' : 'bg-gray-3'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                backupSettings.autoBackup.enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Расписание создания */}
          {backupSettings.autoBackup.enabled && (
            <>
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  {t('admin.backup.backup.schedule', 'Расписание создания')}
                </label>
                <select
                  value={backupSettings.autoBackup.schedule}
                  onChange={(e) => handleToggle('autoBackup.schedule', e.target.value)}
                  className={`${themeClasses.input.default} w-full`}
                >
                  <option value="daily">{t('admin.backup.backup.scheduleDaily', 'Ежедневно')}</option>
                  <option value="weekly">{t('admin.backup.backup.scheduleWeekly', 'Еженедельно')}</option>
                  <option value="monthly">{t('admin.backup.backup.scheduleMonthly', 'Ежемесячно')}</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  {t('admin.backup.backup.time', 'Время создания')}
                </label>
                <Input
                  type="time"
                  value={backupSettings.autoBackup.time}
                  onChange={(e) => handleToggle('autoBackup.time', e.target.value)}
                />
              </div>

              {/* Что включать в бекап */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  {t('admin.backup.backup.include', 'Что включать в бекап')}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup.include.users}
                      onChange={(e) => handleToggle('autoBackup.include.users', e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className={themeClasses.text.primary}>
                      {t('admin.backup.backup.includeUsers', 'Данные пользователей')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup.include.settings}
                      onChange={(e) => handleToggle('autoBackup.include.settings', e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className={themeClasses.text.primary}>
                      {t('admin.backup.backup.includeSettings', 'Настройки системы')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup.include.logs}
                      onChange={(e) => handleToggle('autoBackup.include.logs', e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className={themeClasses.text.primary}>
                      {t('admin.backup.backup.includeLogs', 'Логи')}
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Место хранения */}
      <div className={`${themeClasses.card.default} p-6`}>
        <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
          {t('admin.backup.backup.storage', 'Место хранения')}
        </h3>

        <div className="space-y-4">
          {/* Тип хранилища */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
              {t('admin.backup.backup.storageType', 'Тип хранилища')}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="storageType"
                  value="local"
                  checked={backupSettings.storage.type === 'local'}
                  onChange={(e) => handleStorageTypeChange('local')}
                  className="w-4 h-4 text-primary"
                />
                <span className={themeClasses.text.primary}>
                  {t('admin.backup.backup.storageLocal', 'Локальное хранилище (бэкенд Loginus)')}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="storageType"
                  value="yandex-disk"
                  checked={backupSettings.storage.type === 'yandex-disk'}
                  onChange={(e) => handleStorageTypeChange('yandex-disk')}
                  className="w-4 h-4 text-primary"
                />
                <span className={themeClasses.text.primary}>
                  {t('admin.backup.backup.storageYandex', 'Яндекс Диск')}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="storageType"
                  value="s3"
                  checked={backupSettings.storage.type === 's3'}
                  onChange={(e) => handleStorageTypeChange('s3')}
                  className="w-4 h-4 text-primary"
                />
                <span className={themeClasses.text.primary}>
                  {t('admin.backup.backup.storageS3', 'S3 совместимое хранилище')}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="storageType"
                  value="custom"
                  checked={backupSettings.storage.type === 'custom'}
                  onChange={(e) => handleStorageTypeChange('custom')}
                  className="w-4 h-4 text-primary"
                />
                <span className={themeClasses.text.primary}>
                  {t('admin.backup.backup.storageCustom', 'Другое облачное хранилище')}
                </span>
              </label>
            </div>
          </div>

          {/* Настройки Яндекс Диск */}
          {backupSettings.storage.type === 'yandex-disk' && (
            <div className={`p-4 rounded-lg ${themeClasses.background.gray2}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    {t('admin.backup.backup.yandexDisk', 'Яндекс Диск')}
                  </p>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>
                    {backupSettings.storage.yandexDisk.connected
                      ? t('admin.backup.backup.connected', 'Подключено')
                      : t('admin.backup.backup.notConnected', 'Не подключено')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStorageModalOpen(true)}
                >
                  {backupSettings.storage.yandexDisk.connected
                    ? t('admin.backup.backup.configure', 'Настроить')
                    : t('admin.backup.backup.connect', 'Подключить')}
                </Button>
              </div>
            </div>
          )}

          {/* Настройки другого хранилища */}
          {(backupSettings.storage.type === 's3' || backupSettings.storage.type === 'custom') && (
            <div className={`p-4 rounded-lg ${themeClasses.background.gray2}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    {backupSettings.storage.type === 's3'
                      ? t('admin.backup.backup.s3Storage', 'S3 хранилище')
                      : t('admin.backup.backup.customStorage', 'Кастомное хранилище')}
                  </p>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>
                    {t('admin.backup.backup.configureStorage', 'Настройте параметры подключения')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStorageModalOpen(true)}
                >
                  {t('admin.backup.backup.configure', 'Настроить')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно настройки хранилища */}
      {isStorageModalOpen && (
        <StorageConfigModal
          isOpen={isStorageModalOpen}
          onClose={() => setIsStorageModalOpen(false)}
          storageType={backupSettings.storage.type}
          settings={backupSettings.storage}
        />
      )}
    </div>
  );
};

