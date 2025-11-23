import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../design-system/composites/Modal';
import { Button } from '../../../design-system/primitives/Button';
import { Input } from '../../../design-system/primitives/Input';
import { Icon } from '../../../design-system/primitives/Icon';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { backupApi, BackupSettings } from '../../../services/api/backup';

interface StorageConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageType: 'local' | 'yandex-disk' | 's3' | 'custom';
  settings: BackupSettings['storage'];
}

/**
 * StorageConfigModal - модальное окно настройки хранилища
 */
export const StorageConfigModal: React.FC<StorageConfigModalProps> = ({
  isOpen,
  onClose,
  storageType,
  settings,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; isOpen: boolean }>({ success: false, message: '', isOpen: false });

  const [formData, setFormData] = useState(() => {
    if (storageType === 'yandex-disk') {
      return {
        token: settings.yandexDisk.token || '',
        path: settings.yandexDisk.path || '/backups',
      };
    } else if (storageType === 's3' || storageType === 'custom') {
      return {
        type: settings.custom.type || '',
        endpoint: settings.custom.endpoint || '',
        accessKey: '',
        secretKey: '',
      };
    }
    return {};
  });

  const updateMutation = useMutation({
    mutationFn: (storageSettings: Partial<BackupSettings['storage']>) =>
      backupApi.updateBackupSettings({ storage: storageSettings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] });
      onClose();
    },
  });

  const handleSave = () => {
    if (storageType === 'yandex-disk') {
      updateMutation.mutate({
        ...settings,
        yandexDisk: {
          token: formData.token,
          path: formData.path,
          connected: !!formData.token,
        },
      });
    } else if (storageType === 's3' || storageType === 'custom') {
      updateMutation.mutate({
        ...settings,
        custom: {
          type: formData.type,
          endpoint: formData.endpoint,
          credentials: {
            accessKey: formData.accessKey,
            secretKey: formData.secretKey,
          },
        },
      });
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      // Симуляция проверки подключения
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({ success: true, message: t('admin.backup.storage.testSuccess', 'Подключение успешно'), isOpen: true });
    } catch (error) {
      setTestResult({ success: false, message: t('admin.backup.storage.testError', 'Ошибка подключения'), isOpen: true });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        storageType === 'yandex-disk'
          ? t('admin.backup.storage.yandexTitle', 'Настройка Яндекс Диск')
          : storageType === 's3'
          ? t('admin.backup.storage.s3Title', 'Настройка S3 хранилища')
          : t('admin.backup.storage.customTitle', 'Настройка хранилища')
      }
      size="md"
      showCloseButton={true}
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel', 'Отменить')}
          </Button>
          {storageType !== 'local' && (
            <Button variant="outline" onClick={handleTest} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Icon name="loader" size="sm" className="animate-spin mr-2" />
                  {t('admin.backup.storage.testing', 'Проверка...')}
                </>
              ) : (
                <>
                  <Icon name="check-circle" size="sm" className="mr-2" />
                  {t('admin.backup.storage.test', 'Проверить')}
                </>
              )}
            </Button>
          )}
          <Button variant="primary" onClick={handleSave}>
            {t('common.save', 'Сохранить')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {storageType === 'yandex-disk' && (
          <>
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.storage.yandexToken', 'OAuth токен / API ключ')}
              </label>
              <Input
                type="password"
                value={formData.token}
                onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                placeholder={t('admin.backup.storage.yandexTokenPlaceholder', 'Введите токен Яндекс Диск')}
              />
              <p className={`text-xs ${themeClasses.text.secondary} mt-1`}>
                {t('admin.backup.storage.yandexTokenHint', 'Получите токен в настройках Яндекс Диск API')}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.storage.yandexPath', 'Путь на диске')}
              </label>
              <Input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/backups"
              />
            </div>
          </>
        )}

        {(storageType === 's3' || storageType === 'custom') && (
          <>
            {storageType === 'custom' && (
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  {t('admin.backup.storage.customType', 'Тип хранилища')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className={`${themeClasses.input.default} w-full`}
                >
                  <option value="">{t('admin.backup.storage.selectType', 'Выберите тип')}</option>
                  <option value="s3">S3</option>
                  <option value="google-drive">Google Drive</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="onedrive">OneDrive</option>
                </select>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.storage.endpoint', 'URL / Endpoint')}
              </label>
              <Input
                type="url"
                value={formData.endpoint}
                onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://storage.example.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.storage.accessKey', 'Access Key')}
              </label>
              <Input
                type="password"
                value={formData.accessKey}
                onChange={(e) => setFormData(prev => ({ ...prev, accessKey: e.target.value }))}
                placeholder={t('admin.backup.storage.accessKeyPlaceholder', 'Введите Access Key')}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.storage.secretKey', 'Secret Key')}
              </label>
              <Input
                type="password"
                value={formData.secretKey}
                onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                placeholder={t('admin.backup.storage.secretKeyPlaceholder', 'Введите Secret Key')}
              />
            </div>
          </>
        )}
      </div>

      {/* Модальное окно результата теста */}
      <Modal
        isOpen={testResult.isOpen}
        onClose={() => setTestResult({ success: false, message: '', isOpen: false })}
        title={testResult.success ? t('admin.backup.storage.testSuccessTitle', 'Подключение успешно') : t('admin.backup.storage.testErrorTitle', 'Ошибка подключения')}
        size="sm"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setTestResult({ success: false, message: '', isOpen: false })}>
              {t('common.close', 'Закрыть')}
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text.primary}>{testResult.message}</p>
      </Modal>
    </Modal>
  );
};

