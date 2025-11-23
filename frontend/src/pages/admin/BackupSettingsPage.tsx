import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { BackupStatsWidget } from '../../components/Admin/Backup/BackupStatsWidget';
import { SyncSettingsSection } from '../../components/Admin/Backup/SyncSettingsSection';
import { BackupSettingsSection } from '../../components/Admin/Backup/BackupSettingsSection';
import { BackupHistorySection } from '../../components/Admin/Backup/BackupHistorySection';
import { CreateBackupModal } from '../../components/Admin/Backup/CreateBackupModal';

type TabType = 'sync' | 'backup' | 'history';

/**
 * BackupSettingsPage - страница настроек бекапов и синхронизации
 */
const BackupSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('sync');
  const [isCreateBackupModalOpen, setIsCreateBackupModalOpen] = useState(false);

  const handleCreateBackup = () => {
    setIsCreateBackupModalOpen(true);
  };

  const tabs = [
    { id: 'sync' as TabType, label: t('admin.backup.tabs.sync', 'Синхронизация'), icon: 'refresh-cw' },
    { id: 'backup' as TabType, label: t('admin.backup.tabs.backup', 'Бекапы'), icon: 'database' },
    { id: 'history' as TabType, label: t('admin.backup.tabs.history', 'История'), icon: 'clock' },
  ];

  return (
    <AdminPageTemplate 
      title={t('admin.backup.title', 'Настройки бекапов и синхронизации')} 
      showSidebar={true}
      headerActions={
        <Button
          variant="primary"
          leftIcon={<Icon name="plus" size="sm" />}
          onClick={handleCreateBackup}
          className="hidden sm:flex"
        >
          {t('admin.backup.create.create', 'Создать бекап')}
        </Button>
      }
    >
      <div className="p-4 sm:p-6 pb-24 sm:pb-6">
        {/* Статистика */}
        <BackupStatsWidget />

        {/* Вкладки */}
        <div className={`${themeClasses.card.default} mb-6`}>
          <div className="flex flex-wrap gap-2 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : `${themeClasses.text.secondary} ${themeClasses.text.hoverPrimary}`
                }`}
              >
                <Icon name={tab.icon as any} size="sm" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Контент вкладок */}
        <div className="space-y-6">
          {activeTab === 'sync' && (
            <div>
              <SyncSettingsSection />
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <BackupSettingsSection />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <BackupHistorySection />
            </div>
          )}
        </div>

        {/* Модальное окно создания бекапа */}
        {isCreateBackupModalOpen && (
          <CreateBackupModal
            isOpen={isCreateBackupModalOpen}
            onClose={() => setIsCreateBackupModalOpen(false)}
          />
        )}
      </div>

      {/* Мобильная кнопка создания бекапа */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <Button
          variant="primary"
          size="lg"
          onClick={handleCreateBackup}
          className="rounded-full shadow-xl hover:shadow-2xl"
          iconOnly
        >
          <Icon name="plus" size="md" />
        </Button>
      </div>
    </AdminPageTemplate>
  );
};

export default BackupSettingsPage;

