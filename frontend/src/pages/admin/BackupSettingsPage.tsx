import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';

/**
 * BackupSettingsPage - страница настроек бекапов и синхронизации
 * TODO: Реализовать форму настройки бекапов
 */
const BackupSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AdminPageTemplate 
      title={t('admin.backup.title', 'Настройки бекапов')} 
      showSidebar={true}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          {t('admin.backup.comingSoon', 'Страница настроек бекапов будет реализована в следующем этапе')}
        </p>
      </div>
    </AdminPageTemplate>
  );
};

export default BackupSettingsPage;

