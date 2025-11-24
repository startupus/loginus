import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../design-system/composites/Modal';
import { Button } from '../../../design-system/primitives/Button';
import { Icon } from '../../../design-system/primitives/Icon';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { backupApi, Backup } from '../../../services/api/backup';
import { formatDate } from '../../../utils/intl/formatters';
import { useCurrentLanguage } from '../../../utils/routing';

interface RestoreBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  backupId: string;
}

/**
 * RestoreBackupModal - модальное окно восстановления из бекапа
 */
export const RestoreBackupModal: React.FC<RestoreBackupModalProps> = ({
  isOpen,
  onClose,
  backupId,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentLang = useCurrentLanguage();
  const locale = currentLang === 'en' ? 'en' : 'ru';
  const [restoreOptions, setRestoreOptions] = useState({
    restoreUsers: true,
    restoreSettings: true,
    restoreLogs: false,
  });
  const [isRestoring, setIsRestoring] = useState(false);

  const { data: backup } = useQuery<Backup | null>({
    queryKey: ['backup', backupId],
    queryFn: async () => {
      const backups = await backupApi.getBackupHistory();
      return backups.find(b => b.id === backupId) || null;
    },
    enabled: isOpen && !!backupId,
  });

  const restoreMutation = useMutation({
    mutationFn: (options: typeof restoreOptions) => backupApi.restoreBackup(backupId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
      onClose();
    },
  });

  useEffect(() => {
    if (backup) {
      setRestoreOptions({
        restoreUsers: backup.includes.users,
        restoreSettings: backup.includes.settings,
        restoreLogs: backup.includes.logs,
      });
    }
  }, [backup]);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restoreMutation.mutateAsync(restoreOptions);
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDateTime = (dateString: string): string => {
    return formatDate(dateString, locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.backup.restore.title', 'Восстановление из бекапа')}
      size="md"
      showCloseButton={true}
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isRestoring}>
            {t('common.cancel', 'Отменить')}
          </Button>
          <Button
            variant="primary"
            onClick={handleRestore}
            disabled={isRestoring || (!restoreOptions.restoreUsers && !restoreOptions.restoreSettings && !restoreOptions.restoreLogs)}
          >
            {isRestoring ? (
              <>
                <Icon name="loader" size="sm" className="animate-spin mr-2" />
                {t('admin.backup.restore.restoring', 'Восстановление...')}
              </>
            ) : (
              <>
                <Icon name="rotate-ccw" size="sm" className="mr-2" />
                {t('admin.backup.restore.restore', 'Восстановить')}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {backup && (
          <>
            <div className={`p-4 rounded-lg bg-warning/10 ${themeClasses.border.default} border-warning/20`}>
              <div className="flex items-start gap-3">
                <Icon name="alert-triangle" size="md" className={`${themeClasses.text.warning} mt-0.5`} />
                <div>
                  <p className={`font-medium ${themeClasses.text.primary} mb-1`}>
                    {t('admin.backup.restore.warning', 'Внимание!')}
                  </p>
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    {t('admin.backup.restore.warningDesc', 'Восстановление из бекапа перезапишет текущие данные. Убедитесь, что у вас есть актуальный бекап перед восстановлением.')}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${themeClasses.card.default}`}>
              <p className={`text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.restore.backupInfo', 'Информация о бекапе')}
              </p>
              <div className="space-y-1 text-sm">
                <p className={themeClasses.text.secondary}>
                  <span className={themeClasses.text.primary}>{t('admin.backup.restore.date', 'Дата:')}</span>{' '}
                  {formatDateTime(backup.createdAt)}
                </p>
                <p className={themeClasses.text.secondary}>
                  <span className={themeClasses.text.primary}>{t('admin.backup.restore.type', 'Тип:')}</span>{' '}
                  {backup.type === 'auto'
                    ? t('admin.backup.restore.auto', 'Автоматический')
                    : t('admin.backup.restore.manual', 'Ручной')}
                </p>
              </div>
            </div>
          </>
        )}

        <div>
          <p className={`text-sm font-medium ${themeClasses.text.primary} mb-3`}>
            {t('admin.backup.restore.selectData', 'Выберите, что восстанавливать')}
          </p>

          <div className="space-y-3">
            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${themeClasses.list.itemHover} transition-colors`}>
              <input
                type="checkbox"
                checked={restoreOptions.restoreUsers}
                onChange={(e) => setRestoreOptions(prev => ({ ...prev, restoreUsers: e.target.checked }))}
                className={`w-5 h-5 ${themeClasses.text.primary} rounded`}
              />
              <div className="flex-1">
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {t('admin.backup.restore.restoreUsers', 'Данные пользователей')}
                </p>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  {t('admin.backup.restore.restoreUsersDesc', 'Восстановить все данные пользователей')}
                </p>
              </div>
            </label>

            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${themeClasses.list.itemHover} transition-colors`}>
              <input
                type="checkbox"
                checked={restoreOptions.restoreSettings}
                onChange={(e) => setRestoreOptions(prev => ({ ...prev, restoreSettings: e.target.checked }))}
                className={`w-5 h-5 ${themeClasses.text.primary} rounded`}
              />
              <div className="flex-1">
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {t('admin.backup.restore.restoreSettings', 'Настройки системы')}
                </p>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  {t('admin.backup.restore.restoreSettingsDesc', 'Восстановить конфигурацию системы')}
                </p>
              </div>
            </label>

            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${themeClasses.list.itemHover} transition-colors`}>
              <input
                type="checkbox"
                checked={restoreOptions.restoreLogs}
                onChange={(e) => setRestoreOptions(prev => ({ ...prev, restoreLogs: e.target.checked }))}
                className={`w-5 h-5 ${themeClasses.text.primary} rounded`}
              />
              <div className="flex-1">
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {t('admin.backup.restore.restoreLogs', 'Логи')}
                </p>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  {t('admin.backup.restore.restoreLogsDesc', 'Восстановить историю действий и логи')}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};

