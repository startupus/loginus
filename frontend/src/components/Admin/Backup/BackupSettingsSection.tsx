import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../design-system/primitives/Button';
import { Input } from '../../../design-system/primitives/Input';
import { LoadingState } from '../../../design-system/composites/LoadingState';
import { Switch } from '../../../design-system/composites/Switch';
import { Icon } from '../../../design-system/primitives/Icon';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { backupApi, BackupSettings } from '../../../services/api/backup';
import { StorageConfigModal } from './StorageConfigModal';

interface BackupSettingsSectionProps {
  onCreateBackup?: () => void;
}

/**
 * BackupSettingsSection - секция настроек бекапов
 */
export const BackupSettingsSection: React.FC<BackupSettingsSectionProps> = ({
  onCreateBackup,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [storageModalType, setStorageModalType] = useState<'local' | 'yandex-disk' | 's3' | 'custom' | null>(null);

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
    return <LoadingState text={t('common.loading')} />;
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

  const handleOpenStorageModal = (type: 'local' | 'yandex-disk' | 's3' | 'custom') => {
    setStorageModalType(type);
  };

  const handleCloseStorageModal = () => {
    setStorageModalType(null);
  };

  return (
    <div className="space-y-6">
      {/* Автоматические бекапы */}
      <div className={`${themeClasses.card.default} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
          {t('admin.backup.backup.autoBackup')}
        </h3>
          {onCreateBackup && (
            <Button
              variant="primary"
              leftIcon={<Icon name="plus" size="sm" />}
              onClick={onCreateBackup}
              size="sm"
            >
              {t('admin.backup.create.create', 'Создать')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Включение автоматических бекапов */}
          <div className="flex items-center justify-between">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}>
                {t('admin.backup.backup.enableAuto')}
              </label>
              <p className={`text-xs ${themeClasses.text.secondary}`}>
                {t('admin.backup.backup.enableAutoDesc')}
              </p>
            </div>
            <Switch
              checked={backupSettings.autoBackup.enabled}
              onChange={(checked) => handleToggle('autoBackup.enabled', checked)}
              size="sm"
            />
          </div>

          {/* Расписание создания */}
          {backupSettings.autoBackup.enabled && (
            <>
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  {t('admin.backup.backup.schedule')}
                </label>
                <select
                  value={backupSettings.autoBackup.schedule}
                  onChange={(e) => handleToggle('autoBackup.schedule', e.target.value)}
                  className={`${themeClasses.input.default} w-full`}
                >
                  <option value="daily">{t('admin.backup.backup.scheduleDaily')}</option>
                  <option value="weekly">{t('admin.backup.backup.scheduleWeekly')}</option>
                  <option value="monthly">{t('admin.backup.backup.scheduleMonthly')}</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  {t('admin.backup.backup.time')}
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
                  {t('admin.backup.backup.include')}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup.include.users}
                      onChange={(e) => handleToggle('autoBackup.include.users', e.target.checked)}
                      className={`w-4 h-4 ${themeClasses.text.primary} rounded`}
                    />
                    <span className={themeClasses.text.primary}>
                      {t('admin.backup.backup.includeUsers')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup.include.settings}
                      onChange={(e) => handleToggle('autoBackup.include.settings', e.target.checked)}
                      className={`w-4 h-4 ${themeClasses.text.primary} rounded`}
                    />
                    <span className={themeClasses.text.primary}>
                      {t('admin.backup.backup.includeSettings')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup.include.logs}
                      onChange={(e) => handleToggle('autoBackup.include.logs', e.target.checked)}
                      className={`w-4 h-4 ${themeClasses.text.primary} rounded`}
                    />
                    <span className={themeClasses.text.primary}>
                      {t('admin.backup.backup.includeLogs')}
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
          {t('admin.backup.backup.storage')}
        </h3>

        <div className="space-y-3">
          {/* Локальное хранилище */}
          <div className={`p-4 rounded-lg border ${themeClasses.background.gray2} ${themeClasses.border.default}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="hard-drive" size="sm" className={themeClasses.text.primary} />
                  <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  {t('admin.backup.backup.storageLocal')}
                  </p>
                </div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  {t('admin.backup.backup.storageLocalDesc', 'Бекапы сохраняются на сервере Loginus')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {backupSettings.storage.local?.enabled && (
                    <span className={`text-xs px-2 py-1 rounded ${themeClasses.background.success} ${themeClasses.text.success}`}>
                      {t('admin.backup.backup.active', 'Активно')}
                </span>
                  )}
                  <button
                    onClick={() => handleOpenStorageModal('local')}
                    className={`text-sm ${themeClasses.link.primary} underline-offset-2 hover:underline`}
                  >
                    {t('admin.backup.backup.configure')}
                  </button>
                </div>
                <Switch
                  checked={backupSettings.storage.local?.enabled ?? true}
                  onChange={(checked) => handleToggle('storage.local.enabled', checked)}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Яндекс Диск */}
          <div className={`p-4 rounded-lg border ${themeClasses.background.gray2} ${themeClasses.border.default}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="cloud" size="sm" className={themeClasses.text.primary} />
                  <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    {t('admin.backup.backup.storageYandex')}
                  </p>
                </div>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>
                    {backupSettings.storage.yandexDisk.connected
                      ? t('admin.backup.backup.connected')
                      : t('admin.backup.backup.notConnected')}
                  </p>
                </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {backupSettings.storage.yandexDisk.connected && backupSettings.storage.yandexDisk.enabled && (
                    <span className={`text-xs px-2 py-1 rounded ${themeClasses.background.success} ${themeClasses.text.success}`}>
                      {t('admin.backup.backup.active', 'Активно')}
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenStorageModal('yandex-disk')}
                    className={`text-sm ${themeClasses.link.primary} underline-offset-2 hover:underline`}
                  >
                    {t('admin.backup.backup.configure')}
                  </button>
                </div>
                <Switch
                  checked={backupSettings.storage.yandexDisk.enabled ?? false}
                  onChange={(checked) => handleToggle('storage.yandexDisk.enabled', checked)}
                  size="sm"
                  disabled={!backupSettings.storage.yandexDisk.connected}
                />
              </div>
            </div>
          </div>

          {/* S3 совместимое хранилище */}
          <div className={`p-4 rounded-lg border ${themeClasses.background.gray2} ${themeClasses.border.default}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="database" size="sm" className={themeClasses.text.primary} />
                  <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    {t('admin.backup.backup.storageS3')}
                  </p>
                </div>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>
                  {backupSettings.storage.s3?.endpoint
                    ? t('admin.backup.backup.configured', 'Настроено')
                    : t('admin.backup.backup.notConfigured', 'Не настроено')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {backupSettings.storage.s3?.endpoint && backupSettings.storage.s3.enabled && (
                    <span className={`text-xs px-2 py-1 rounded ${themeClasses.background.success} ${themeClasses.text.success}`}>
                      {t('admin.backup.backup.active', 'Активно')}
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenStorageModal('s3')}
                    className={`text-sm ${themeClasses.link.primary} underline-offset-2 hover:underline`}
                  >
                    {t('admin.backup.backup.configure')}
                  </button>
                </div>
                <Switch
                  checked={backupSettings.storage.s3?.enabled ?? false}
                  onChange={(checked) => handleToggle('storage.s3.enabled', checked)}
                  size="sm"
                  disabled={!backupSettings.storage.s3?.endpoint}
                />
              </div>
            </div>
          </div>

          {/* Другое облачное хранилище */}
          <div className={`p-4 rounded-lg border ${themeClasses.background.gray2} ${themeClasses.border.default}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="cloud" size="sm" className={themeClasses.text.primary} />
                  <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    {t('admin.backup.backup.storageCustom')}
                  </p>
                </div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  {backupSettings.storage.custom.endpoint && backupSettings.storage.custom.type
                    ? t('admin.backup.backup.configured')
                    : t('admin.backup.backup.notConfigured')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {backupSettings.storage.custom.endpoint && backupSettings.storage.custom.type && backupSettings.storage.custom.enabled && (
                    <span className={`text-xs px-2 py-1 rounded ${themeClasses.background.success} ${themeClasses.text.success}`}>
                      {t('admin.backup.backup.active', 'Активно')}
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenStorageModal('custom')}
                    className={`text-sm ${themeClasses.link.primary} underline-offset-2 hover:underline`}
                  >
                    {t('admin.backup.backup.configure')}
                  </button>
                </div>
                <Switch
                  checked={backupSettings.storage.custom.enabled ?? false}
                  onChange={(checked) => handleToggle('storage.custom.enabled', checked)}
                  size="sm"
                  disabled={!backupSettings.storage.custom.endpoint || !backupSettings.storage.custom.type}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно настройки хранилища */}
      {storageModalType && (
        <StorageConfigModal
          isOpen={!!storageModalType}
          onClose={handleCloseStorageModal}
          storageType={storageModalType}
          settings={backupSettings.storage}
        />
      )}
    </div>
  );
};

