import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../design-system/composites/Modal';
import { Button } from '../../../design-system/primitives/Button';
import { Icon } from '../../../design-system/primitives/Icon';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { backupApi } from '../../../services/api/backup';

interface CreateBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CreateBackupModal - модальное окно создания бекапа вручную
 */
export const CreateBackupModal: React.FC<CreateBackupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [include, setInclude] = useState({
    users: true,
    settings: true,
    logs: false,
  });
  const [isCreating, setIsCreating] = useState(false);

  const createMutation = useMutation({
    mutationFn: (options: { include: typeof include }) => backupApi.createBackup(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
      queryClient.invalidateQueries({ queryKey: ['backup-stats'] });
      onClose();
    },
  });

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await createMutation.mutateAsync({ include });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.backup.create.title', 'Создать бекап')}
      size="md"
      showCloseButton={true}
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            {t('common.cancel', 'Отменить')}
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={isCreating || (!include.users && !include.settings && !include.logs)}
          >
            {isCreating ? (
              <>
                <Icon name="refresh-cw" size="sm" className="animate-spin mr-2" />
                {t('admin.backup.create.creating', 'Создание...')}
              </>
            ) : (
              <>
                <Icon name="database" size="sm" className="mr-2" />
                {t('admin.backup.create.create', 'Создать')}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className={`text-sm ${themeClasses.text.secondary}`}>
          {t('admin.backup.create.description', 'Выберите, какие данные включить в бекап')}
        </p>

        <div className="space-y-3">
          <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${themeClasses.list.itemHover} transition-colors`}>
            <input
              type="checkbox"
              checked={include.users}
              onChange={(e) => setInclude(prev => ({ ...prev, users: e.target.checked }))}
              className={`w-5 h-5 ${themeClasses.text.primary} rounded`}
            />
            <div className="flex-1">
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {t('admin.backup.create.includeUsers', 'Данные пользователей')}
              </p>
              <p className={`text-xs ${themeClasses.text.secondary}`}>
                {t('admin.backup.create.includeUsersDesc', 'Все данные пользователей системы')}
              </p>
            </div>
          </label>

          <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${themeClasses.list.itemHover} transition-colors`}>
            <input
              type="checkbox"
              checked={include.settings}
              onChange={(e) => setInclude(prev => ({ ...prev, settings: e.target.checked }))}
              className={`w-5 h-5 ${themeClasses.text.primary} rounded`}
            />
            <div className="flex-1">
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {t('admin.backup.create.includeSettings', 'Настройки системы')}
              </p>
              <p className={`text-xs ${themeClasses.text.secondary}`}>
                {t('admin.backup.create.includeSettingsDesc', 'Конфигурация и настройки системы')}
              </p>
            </div>
          </label>

          <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${themeClasses.list.itemHover} transition-colors`}>
            <input
              type="checkbox"
              checked={include.logs}
              onChange={(e) => setInclude(prev => ({ ...prev, logs: e.target.checked }))}
              className={`w-5 h-5 ${themeClasses.text.primary} rounded`}
            />
            <div className="flex-1">
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {t('admin.backup.create.includeLogs', 'Логи')}
              </p>
              <p className={`text-xs ${themeClasses.text.secondary}`}>
                {t('admin.backup.create.includeLogsDesc', 'История действий и системные логи')}
              </p>
            </div>
          </label>
        </div>
      </div>
    </Modal>
  );
};

