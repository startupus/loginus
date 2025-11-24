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
import { formatDate } from '../../../utils/intl/formatters';
import { useCurrentLanguage } from '../../../utils/routing';

/**
 * BackupHistorySection - секция истории бекапов
 */
export const BackupHistorySection: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ id: string; isOpen: boolean }>({ id: '', isOpen: false });
  const [downloadMessage, setDownloadMessage] = useState<{ text: string; isOpen: boolean }>({ text: '', isOpen: false });
  const currentLang = useCurrentLanguage();
  const locale = currentLang === 'en' ? 'en' : 'ru';
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

  const formatDateTime = (dateString: string): string => {
    return formatDate(dateString, locale, {
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
      setDownloadMessage({ text: t('admin.backup.history.downloadStarted'), isOpen: true });
    } catch (error) {
      setDownloadMessage({ text: t('admin.backup.history.downloadError'), isOpen: true });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmModal({ id, isOpen: true });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmModal.id) {
      await deleteMutation.mutateAsync(deleteConfirmModal.id);
      setDeleteConfirmModal({ id: '', isOpen: false });
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
      local: t('admin.backup.history.storageLocal'),
      'yandex-disk': t('admin.backup.history.storageYandex'),
      s3: t('admin.backup.history.storageS3'),
    };
    return labels[storage] || storage;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="loader" size="lg" className="animate-spin" color="rgb(var(--color-primary))" />
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
              {t('admin.backup.history.filterType')}
            </label>
            <select
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="all">{t('admin.backup.history.allTypes')}</option>
              <option value="auto">{t('admin.backup.history.auto')}</option>
              <option value="manual">{t('admin.backup.history.manual')}</option>
            </select>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
              {t('admin.backup.history.filterStatus')}
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="all">{t('admin.backup.history.allStatuses')}</option>
              <option value="success">{t('admin.backup.history.success')}</option>
              <option value="in-progress">{t('admin.backup.history.inProgress')}</option>
              <option value="error">{t('admin.backup.history.error')}</option>
            </select>
          </div>

          {/* Фильтр по дате */}
          <div className="lg:col-span-2 relative">
            <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
              {t('admin.backup.history.filterDate')}
            </label>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`${themeClasses.input.default} w-full flex items-center gap-2`}
            >
              <Icon name="calendar" size="sm" />
              {filters.dateFrom || filters.dateTo
                ? `${filters.dateFrom || '...'} - ${filters.dateTo || '...'}`
                : t('admin.backup.history.selectDate')}
            </button>
            {showDatePicker && (
              <div className={`absolute z-10 mt-2 p-4 ${themeClasses.card.default} ${themeClasses.border.default} rounded-lg shadow-lg min-w-[280px]`}>
                <div className="space-y-3">
                  <Input
                    type="date"
                    label={t('admin.backup.history.dateFrom')}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    size="sm"
                  />
                  <Input
                    type="date"
                    label={t('admin.backup.history.dateTo')}
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
                      {t('common.reset')}
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleDateFilterApply}
                      className="flex-1"
                    >
                      {t('common.apply')}
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
            <thead className={themeClasses.background.gray2}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                  {t('admin.backup.history.date')}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                  {t('admin.backup.history.type')}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                  {t('admin.backup.history.size')}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                  {t('admin.backup.history.storage')}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                  {t('admin.backup.history.status')}
                </th>
                <th className={`px-6 py-4 text-right text-sm font-semibold ${themeClasses.text.primary}`}>
                  {t('admin.backup.history.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Icon name="database" size="lg" className={`${themeClasses.text.secondary} mb-4`} />
                      <p className={themeClasses.text.secondary}>
                        {t('admin.backup.history.empty')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className={`${themeClasses.list.itemHover} transition-colors`}>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${themeClasses.text.primary}`}>{formatDateTime(backup.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={backup.type === 'auto' ? 'primary' : 'secondary'} size="sm">
                        {backup.type === 'auto'
                          ? t('admin.backup.history.auto')
                          : t('admin.backup.history.manual')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${themeClasses.text.primary}`}>{formatBytes(backup.size)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${themeClasses.text.primary}`}>{getStorageLabel(backup.storage)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(backup.status)} size="sm">
                        {backup.status === 'success'
                          ? t('admin.backup.history.success')
                          : backup.status === 'in-progress'
                          ? t('admin.backup.history.inProgress')
                          : t('admin.backup.history.error')}
                      </Badge>
                      {backup.error && (
                        <p className={`text-xs ${themeClasses.text.secondary} mt-1`}>{backup.error}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(backup.id)}
                          title={t('admin.backup.history.download')}
                          disabled={backup.status !== 'success'}
                        >
                          <Icon name="download" size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRestoreBackupId(backup.id)}
                          title={t('admin.backup.history.restore')}
                          disabled={backup.status !== 'success'}
                        >
                          <Icon name="rotate-ccw" size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(backup.id)}
                          title={t('admin.backup.history.delete')}
                        >
                          <Icon name="trash-2" size="sm" className={themeClasses.text.error} />
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

      {/* Модальное окно подтверждения удаления */}
      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ id: '', isOpen: false })}
        title={t('admin.backup.history.deleteConfirmTitle')}
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmModal({ id: '', isOpen: false })}>
              {t('common.cancel')}
            </Button>
            <Button variant="error" onClick={handleDeleteConfirm}>
              {t('common.delete')}
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text.primary}>
          {t('admin.backup.history.deleteConfirm')}
        </p>
      </Modal>

      {/* Модальное окно сообщения о скачивании */}
      <Modal
        isOpen={downloadMessage.isOpen}
        onClose={() => setDownloadMessage({ text: '', isOpen: false })}
        title={t('admin.backup.history.downloadTitle')}
        size="sm"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setDownloadMessage({ text: '', isOpen: false })}>
              {t('common.close')}
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text.primary}>{downloadMessage.text}</p>
      </Modal>
    </div>
  );
};

