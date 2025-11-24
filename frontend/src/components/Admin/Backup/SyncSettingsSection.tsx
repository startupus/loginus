import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../design-system/primitives/Button';
import { Input } from '../../../design-system/primitives/Input';
import { Icon } from '../../../design-system/primitives/Icon';
import { Badge } from '../../../design-system/primitives/Badge';
import { Switch } from '../../../design-system/composites/Switch';
import { themeClasses } from '../../../design-system/utils/themeClasses';
import { backupApi, SyncSettings } from '../../../services/api/backup';
import { SyncStatusIndicator } from './SyncStatusIndicator';

/**
 * SyncSettingsSection - секция настроек синхронизации
 */
export const SyncSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isRunningSync, setIsRunningSync] = useState(false);

  const { data: syncSettings, isLoading } = useQuery<SyncSettings>({
    queryKey: ['sync-settings'],
    queryFn: () => backupApi.getSyncSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (settings: Partial<SyncSettings>) => backupApi.updateSyncSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-settings'] });
    },
  });

  const runSyncMutation = useMutation({
    mutationFn: () => backupApi.runSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['backup-stats'] });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: () => backupApi.testSyncConnection(
      syncSettings?.centralServer.url || '',
      syncSettings?.centralServer.apiKey || ''
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-settings'] });
    },
  });

  if (isLoading || !syncSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="loader" size="lg" className="animate-spin" color="rgb(var(--color-primary))" />
      </div>
    );
  }

  const handleToggle = (field: keyof SyncSettings, value: any) => {
    updateMutation.mutate({ [field]: value } as Partial<SyncSettings>);
  };

  const handleInputChange = (field: string, value: any) => {
    const path = field.split('.');
    const updates: any = { ...syncSettings };
    let current: any = updates;
    
    for (let i = 0; i < path.length - 1; i++) {
      current[path[i]] = { ...current[path[i]] };
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    updateMutation.mutate(updates);
  };

  const handleRunSync = async () => {
    setIsRunningSync(true);
    try {
      await runSyncMutation.mutateAsync();
    } finally {
      setIsRunningSync(false);
    }
  };

  const handleTestConnection = async () => {
    await testConnectionMutation.mutateAsync();
  };

  const handleEnrichmentSourceToggle = (sourceKey: string) => {
    // Маппинг ключей на переведенные строки для проверки
    const sourceKeyMap: Record<string, string> = {
      'debtors': t('admin.backup.sync.dataSourceDebtors', 'База должников'),
      'problematic': t('admin.backup.sync.dataSourceProblematic', 'База проблемных клиентов'),
      'other': t('admin.backup.sync.dataSourceOther', 'Другие источники'),
    };
    
    // Проверяем по ключу или по переведенной строке (для обратной совместимости)
    const sourceLabel = sourceKeyMap[sourceKey] || sourceKey;
    const sources = syncSettings.enrichment.sources.includes(sourceLabel) || syncSettings.enrichment.sources.includes(sourceKey)
      ? syncSettings.enrichment.sources.filter(s => s !== sourceLabel && s !== sourceKey)
      : [...syncSettings.enrichment.sources, sourceLabel];
    
    handleInputChange('enrichment.sources', sources);
  };

  return (
    <div className="space-y-6">
      {/* Основные настройки */}
      <div className={`${themeClasses.card.default} p-6`}>
        <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
          {t('admin.backup.sync.basicSettings', 'Основные настройки')}
        </h3>

        <div className="space-y-4">
          {/* Включение синхронизации */}
          <div className="flex items-center justify-between">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}>
                {t('admin.backup.sync.enable', 'Включить синхронизацию')}
              </label>
              <p className={`text-xs ${themeClasses.text.secondary}`}>
                {t('admin.backup.sync.enableDesc', 'Автоматическая синхронизация данных с центральным сервером')}
              </p>
            </div>
            <Switch
              checked={syncSettings.enabled}
              onChange={(checked) => handleToggle('enabled', checked)}
              size="sm"
            />
          </div>

          {/* Расписание синхронизации */}
          {syncSettings.enabled && (
            <>
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  {t('admin.backup.sync.schedule', 'Расписание синхронизации')}
                </label>
                <select
                  value={syncSettings.schedule}
                  onChange={(e) => handleToggle('schedule', e.target.value)}
                  className={`${themeClasses.input.default} w-full`}
                >
                  <option value="hourly">{t('admin.backup.sync.scheduleHourly', 'Ежечасно')}</option>
                  <option value="daily">{t('admin.backup.sync.scheduleDaily', 'Ежедневно')}</option>
                  <option value="weekly">{t('admin.backup.sync.scheduleWeekly', 'Еженедельно')}</option>
                  <option value="manual">{t('admin.backup.sync.scheduleManual', 'Вручную')}</option>
                </select>
              </div>

              {syncSettings.schedule !== 'manual' && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                    {t('admin.backup.sync.time', 'Время синхронизации')}
                  </label>
                  <Input
                    type="time"
                    value={syncSettings.time}
                    onChange={(e) => handleToggle('time', e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Подключение к центральному серверу */}
      {syncSettings.enabled && (
        <div className={`${themeClasses.card.default} p-6`}>
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
            {t('admin.backup.sync.centralServer', 'Подключение к центральному серверу')}
          </h3>

          <div className="space-y-4">
            {/* URL центрального сервера */}
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.sync.serverUrl', 'URL центрального сервера')}
              </label>
              <Input
                type="text"
                value={syncSettings.centralServer.url}
                onChange={(e) => handleInputChange('centralServer.url', e.target.value)}
                placeholder="https://central.loginus.com"
              />
            </div>

            {/* API ключ */}
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.sync.apiKey', 'API ключ')}
              </label>
              <Input
                type="password"
                value={syncSettings.centralServer.apiKey}
                onChange={(e) => handleInputChange('centralServer.apiKey', e.target.value)}
                placeholder="••••••••••••••••"
              />
            </div>

            {/* Статус подключения и кнопка проверки */}
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending}
              >
                {testConnectionMutation.isPending && (
                  <Icon name="loader" size="sm" className="animate-spin mr-2" />
                )}
                {!testConnectionMutation.isPending && (
                  <Icon name="refresh-cw" size="sm" className="mr-2" />
                )}
                {testConnectionMutation.isPending 
                  ? t('admin.backup.sync.testing', 'Проверка...')
                  : t('admin.backup.sync.testConnection', 'Проверить подключение')
                }
              </Button>
              
              {syncSettings.centralServer.url && syncSettings.centralServer.apiKey && (
                <SyncStatusIndicator connected={syncSettings.centralServer.connected} />
              )}
            </div>

            {/* Тип синхронизации */}
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                {t('admin.backup.sync.type', 'Тип синхронизации')}
              </label>
              <select
                value={syncSettings.type}
                onChange={(e) => handleToggle('type', e.target.value)}
                className={`${themeClasses.input.default} w-full`}
              >
                <option value="one-way">{t('admin.backup.sync.typeOneWay', 'Односторонняя (только загрузка)')}</option>
                <option value="two-way">{t('admin.backup.sync.typeTwoWay', 'Двусторонняя (загрузка и отправка)')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Обогащение данных */}
      {syncSettings.enabled && (
        <div className={`${themeClasses.card.default} p-6`}>
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
            {t('admin.backup.sync.enrichment', 'Обогащение данных')}
          </h3>

          <div className="space-y-4">
            {/* Включение обогащения */}
            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}>
                  {t('admin.backup.sync.enableEnrichment', 'Включить обогащение данных')}
                </label>
                <p className={`text-xs ${themeClasses.text.secondary} mb-1`}>
                  {t('admin.backup.sync.enrichmentDesc', 'Обогащение данных пользователей из внешних источников')}
                </p>
                <p className={`text-xs ${themeClasses.text.secondary} italic`}>
                  {t('admin.backup.sync.enrichmentPrivacy', 'Обогащенная информация будет доступна только администраторам системы. Пользователи будут видеть только данные, которые сами ввели про себя.')}
                </p>
              </div>
              <Switch
                checked={syncSettings.enrichment.enabled}
                onChange={(checked) => handleInputChange('enrichment.enabled', checked)}
                size="sm"
              />
            </div>

            {/* Источники данных */}
            {syncSettings.enrichment.enabled && (
              <>
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                    {t('admin.backup.sync.dataSources', 'Источники данных')}
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'debtors', translationKey: 'admin.backup.sync.dataSourceDebtors', fallback: 'База должников' },
                      { key: 'problematic', translationKey: 'admin.backup.sync.dataSourceProblematic', fallback: 'База проблемных клиентов' },
                      { key: 'other', translationKey: 'admin.backup.sync.dataSourceOther', fallback: 'Другие источники' },
                    ].map(({ key, translationKey, fallback }) => {
                      const sourceLabel = t(translationKey, fallback);
                      // Проверяем по переведенной строке или по ключу (для обратной совместимости)
                      const isChecked = syncSettings.enrichment.sources.includes(sourceLabel) || 
                                       syncSettings.enrichment.sources.includes(key) ||
                                       syncSettings.enrichment.sources.some(s => {
                                         const fallbackMap: Record<string, string> = {
                                           'debtors': 'База должников',
                                           'problematic': 'База проблемных клиентов',
                                           'other': 'Другие источники',
                                         };
                                         return s === fallbackMap[key];
                                       });
                      return (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleEnrichmentSourceToggle(key)}
                            className={`w-4 h-4 ${themeClasses.text.primary} rounded`}
                          />
                          <span className={themeClasses.text.primary}>{sourceLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Автоматическое обогащение */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}>
                      {t('admin.backup.sync.autoEnrich', 'Автоматическое обогащение')}
                    </label>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>
                      {t('admin.backup.sync.autoEnrichDesc', 'Обогащать данные при каждой синхронизации')}
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.enrichment.autoEnrich}
                    onChange={(checked) => handleInputChange('enrichment.autoEnrich', checked)}
                    size="sm"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Ручной запуск синхронизации */}
      {syncSettings.enabled && syncSettings.schedule === 'manual' && (
        <div className={`${themeClasses.card.default} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-1`}>
                {t('admin.backup.sync.manualSync', 'Ручной запуск синхронизации')}
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {t('admin.backup.sync.manualSyncDesc', 'Запустите синхронизацию вручную прямо сейчас')}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleRunSync}
              disabled={isRunningSync}
            >
              {isRunningSync ? (
                <>
                  <Icon name="loader" size="sm" className="animate-spin mr-2" />
                  {t('admin.backup.sync.syncing', 'Синхронизация...')}
                </>
              ) : (
                <>
                  <Icon name="refresh-cw" size="sm" className="mr-2" />
                  {t('admin.backup.sync.runNow', 'Запустить сейчас')}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

