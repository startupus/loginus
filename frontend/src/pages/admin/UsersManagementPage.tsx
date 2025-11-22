import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';

/**
 * UsersManagementPage - страница управления пользователями
 * TODO: Реализовать таблицу пользователей с фильтрацией
 */
const UsersManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AdminPageTemplate 
      title={t('admin.users.title', 'Управление пользователями')} 
      showSidebar={true}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          {t('admin.users.comingSoon', 'Страница управления пользователями будет реализована в следующем этапе')}
        </p>
      </div>
    </AdminPageTemplate>
  );
};

export default UsersManagementPage;

