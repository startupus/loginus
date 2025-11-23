import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../../../design-system/primitives';
import { WidgetCard } from '../../../design-system/composites/WidgetCard';
import { Badge } from '../../../design-system/primitives/Badge';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { backupApi, BackupStats, SyncStatus } from '../../../services/api/backup';
import { formatDate } from '../../../utils/intl/formatters';
import { useCurrentLanguage } from '../../../utils/routing';

/**
 * BackupStatsWidget - виджет статистики бекапов и синхронизации
 */
export const BackupStatsWidget: React.FC = () => {
  const { t } = useTranslation();
  const currentLang = useCurrentLanguage();
  const locale = currentLang === 'en' ? 'en' : 'ru';

  const { data: stats } = useQuery<BackupStats>({
    queryKey: ['backup-stats'],
    queryFn: () => backupApi.getBackupStats(),
  });

  const { data: syncStatus } = useQuery<SyncStatus | undefined>({
    queryKey: ['sync-status'],
    queryFn: () => backupApi.getSyncStatus(),
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    return formatDate(dateString, locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statsData = stats || {
    totalSize: 0,
    totalCount: 0,
    autoCount: 0,
    manualCount: 0,
    lastBackup: null,
    nextAutoBackup: null,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Последняя синхронизация */}
      <div className={`p-4 rounded-lg ${themeClasses.card.default}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${themeClasses.text.secondary}`}>
            {t('admin.backup.stats.lastSync', 'Последняя синхронизация')}
          </span>
          <Icon name="refresh-cw" size="sm" className={themeClasses.text.secondary} />
        </div>
        <div className="space-y-1">
          <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            {syncStatus ? formatDateTime(syncStatus.date) : '-'}
          </p>
          {syncStatus && (
            <div className="flex items-center gap-2">
              <Badge
                variant={syncStatus.status === 'success' ? 'success' : 'danger'}
                size="sm"
              >
                {syncStatus.status === 'success' 
                  ? t('admin.backup.stats.success', 'Успешно')
                  : t('admin.backup.stats.error', 'Ошибка')}
              </Badge>
              {syncStatus.updatedRecords > 0 && (
                <span className={`text-xs ${themeClasses.text.secondary}`}>
                  {syncStatus.updatedRecords} {t('admin.backup.stats.records', 'записей')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Последний бекап */}
      <div className={`p-4 rounded-lg ${themeClasses.card.default}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${themeClasses.text.secondary}`}>
            {t('admin.backup.stats.lastBackup', 'Последний бекап')}
          </span>
          <Icon name="database" size="sm" className={themeClasses.text.secondary} />
        </div>
        <div className="space-y-1">
          <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            {statsData.lastBackup ? formatDateTime(statsData.lastBackup.createdAt) : '-'}
          </p>
          {statsData.lastBackup && (
            <div className="flex items-center gap-2">
              <Badge
                variant={statsData.lastBackup.status === 'success' ? 'success' : 'danger'}
                size="sm"
              >
                {statsData.lastBackup.type === 'auto'
                  ? t('admin.backup.stats.auto', 'Авто')
                  : t('admin.backup.stats.manual', 'Ручной')}
              </Badge>
              <span className={`text-xs ${themeClasses.text.secondary}`}>
                {formatBytes(statsData.lastBackup.size)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Общий размер бекапов */}
      <div className={`p-4 rounded-lg ${themeClasses.card.default}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${themeClasses.text.secondary}`}>
            {t('admin.backup.stats.totalSize', 'Общий размер')}
          </span>
          <Icon name="hard-drive" size="sm" className={themeClasses.text.secondary} />
        </div>
        <div className="space-y-1">
          <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            {formatBytes(statsData.totalSize)}
          </p>
          <span className={`text-xs ${themeClasses.text.secondary}`}>
            {statsData.totalCount} {t('admin.backup.stats.backups', 'бекапов')}
          </span>
        </div>
      </div>

      {/* Следующий автоматический бекап */}
      <div className={`p-4 rounded-lg ${themeClasses.card.default}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${themeClasses.text.secondary}`}>
            {t('admin.backup.stats.nextBackup', 'Следующий бекап')}
          </span>
          <Icon name="clock" size="sm" className={themeClasses.text.secondary} />
        </div>
        <div className="space-y-1">
          <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            {statsData.nextAutoBackup ? formatDateTime(statsData.nextAutoBackup) : '-'}
          </p>
          {statsData.nextAutoBackup && (
            <span className={`text-xs ${themeClasses.text.secondary}`}>
              {t('admin.backup.stats.auto', 'Автоматический')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

