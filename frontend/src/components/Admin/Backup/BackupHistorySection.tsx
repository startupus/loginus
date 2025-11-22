import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../design-system/primitives/Button';
import { Input } from '../../../design-system/primitives/Input';
import { Icon } from '../../../design-system/primitives/Icon';
import { Badge } from '../../../design-system/primitives/Badge';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { backupApi, Backup, BackupHistoryFilters } from '../../../services/api/backup';
import { RestoreBackupModal } from './RestoreBackupModal';

/**
 * BackupHistorySection - секция истории бекапов
 */
export const BackupHistorySection: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<BackupHistoryFilters>({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);

  const { data: backups = [], isLoading } = useQuery<Backup[]>({
    queryKey: ['backup-history', filters],
    queryFn: () => backupApi.getBackupHistory(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backupApi.deleteBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
      queryClient.invalidateQueries({ queryKey: ['backup-stats'] });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => backupApi.downloadBackup(id),
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFilterChange = (key: keyof BackupHistoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
  };

  const handleDateFilterApply = () => {
    setFilters(prev => ({
      ...prev,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }));
    setShowDatePicker(false);
  };

  const handleDateFilterReset = () => {
    setDateFrom('');
    setDateTo('');
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters.dateFrom;
      delete newFilters.dateTo;
      return newFilters;
    });
    setShowDatePicker(false);
  };

  const handleDownload = async (id: string) => {
    try {
      const result = await downloadMutation.mutateAsync(id);
      // В реальном приложении здесь был бы скачивание файла
      // В моке просто показываем сообщение
      alert(t('admin.backup.history.downloadStarted', 'Скачивание начато'));
    } catch (error) {
      alert(t('admin.backup.history.downloadError', 'Ошибка при скачивании'));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.backup.history.deleteConfirm', 'Вы уверены, что хотите удалить этот бекап?'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getStatusBadgeVariant = (status: Backup['status']) => {
    switch (status) {
      case 'success':
        return 'success' as const;
      case 'in-progress':
        return 'warning' as const;
      case 'error':
        return 'danger' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStorageLabel = (storage: Backup['storage']) => {
    const labels: Record<Backup['storage'], string> = {
      local: t('admin.backup.history.storageLocal', 'Локально'),
      'yandex-disk': t('admin.backup.history.storageYandex', 'Яндекс Диск'),
      s3: t('admin.backup.history.storageS3', 'S3'),
    };
    return labels[storage] || storage;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="loader" size="lg" className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className={`${themeClasses.card.default} p-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Фильтр по типу */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
              {t('admin.backup.history.filterType', 'Тип')}
            </label>
            <select
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="all">{t('admin.backup.history.allTypes', 'Все типы')}</option>
              <option value="auto">{t('admin.backup.history.auto', 'Автоматический')}</option>
              <option value="manual">{t('admin.backup.history.manual', 'Ручной')}</option>
            </select>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
              {t('admin.backup.history.filterStatus', 'Статус')}
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="all">{t('admin.backup.history.allStatuses', 'Все статусы')}</option>
              <option value="success">{t('admin.backup.history.success', 'Успешно')}</option>
              <option value="in-progress">{t('admin.backup.history.inProgress', 'В процессе')}</option>
              <option value="error">{t('admin.backup.history.error', 'Ошибка')}</option>
            </select>
          </div>

          {/* Фильтр по дате */}
          <div className="lg:col-span-2 relative">
            <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
              {t('admin.backup.history.filterDate', 'Дата создания')}
            </label>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`${themeClasses.input.default} w-full flex items-center gap-2`}
            >
              <Icon name="calendar" size="sm" />
              {filters.dateFrom || filters.dateTo
                ? `${filters.dateFrom || '...'} - ${filters.dateTo || '...'}`
                : t('admin.backup.history.selectDate', 'Выбрать дату')}
            </button>
            {showDatePicker && (
              <div className="absolute z-10 mt-2 p-4 bg-white dark:bg-dark-2 rounded-lg shadow-lg border border-border min-w-[280px]">
                <div className="space-y-3">
                  <Input
                    type="date"
                    label={t('admin.backup.history.dateFrom', 'С')}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    size="sm"
                  />
                  <Input
                    type="date"
                    label={t('admin.backup.history.dateTo', 'По')}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    size="sm"
                  />
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDateFilterReset}
                      className="flex-1"
                    >
                      {t('common.reset', 'Сбросить')}
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleDateFilterApply}
                      className="flex-1"
                    >
                      {t('common.apply', 'Применить')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Таблица бекапов */}
      <div className={`${themeClasses.card.default} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-1 dark:bg-dark-2">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  {t('admin.backup.history.date', 'Дата создания')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  {t('admin.backup.history.type', 'Тип')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  {t('admin.backup.history.size', 'Размер')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  {t('admin.backup.history.storage', 'Место хранения')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  {t('admin.backup.history.status', 'Статус')}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                  {t('admin.backup.history.actions', 'Действия')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Icon name="database" size="lg" className="text-text-secondary mb-4" />
                      <p className="text-text-secondary">
                        {t('admin.backup.history.empty', 'Бекапы не найдены')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-1 dark:hover:bg-dark-2 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-primary">{formatDate(backup.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={backup.type === 'auto' ? 'primary' : 'secondary'} size="sm">
                        {backup.type === 'auto'
                          ? t('admin.backup.history.auto', 'Автоматический')
                          : t('admin.backup.history.manual', 'Ручной')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-primary">{formatBytes(backup.size)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-primary">{getStorageLabel(backup.storage)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(backup.status)} size="sm">
                        {backup.status === 'success'
                          ? t('admin.backup.history.success', 'Успешно')
                          : backup.status === 'in-progress'
                          ? t('admin.backup.history.inProgress', 'В процессе')
                          : t('admin.backup.history.error', 'Ошибка')}
                      </Badge>
                      {backup.error && (
                        <p className="text-xs text-text-secondary mt-1">{backup.error}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(backup.id)}
                          title={t('admin.backup.history.download', 'Скачать')}
                          disabled={backup.status !== 'success'}
                        >
                          <Icon name="download" size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRestoreBackupId(backup.id)}
                          title={t('admin.backup.history.restore', 'Восстановить')}
                          disabled={backup.status !== 'success'}
                        >
                          <Icon name="rotate-ccw" size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(backup.id)}
                          title={t('admin.backup.history.delete', 'Удалить')}
                        >
                          <Icon name="trash-2" size="sm" className="text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно восстановления */}
      {restoreBackupId && (
        <RestoreBackupModal
          isOpen={!!restoreBackupId}
          onClose={() => setRestoreBackupId(null)}
          backupId={restoreBackupId}
        />
      )}
    </div>
  );
};

