import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../design-system/primitives/Icon';
import { Badge } from '../../../design-system/primitives/Badge';

interface SyncStatusIndicatorProps {
  connected: boolean;
}

/**
 * SyncStatusIndicator - индикатор статуса подключения к центральному серверу
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ connected }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-1 dark:bg-dark-2">
      <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success' : 'bg-gray-3'}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">
          {connected
            ? t('admin.backup.sync.connected', 'Подключено к центральному серверу')
            : t('admin.backup.sync.notConnected', 'Не подключено')}
        </p>
      </div>
      <Badge variant={connected ? 'success' : 'danger'} size="sm">
        {connected
          ? t('admin.backup.sync.statusConnected', 'Подключено')
          : t('admin.backup.sync.statusNotConnected', 'Не подключено')}
      </Badge>
    </div>
  );
};

