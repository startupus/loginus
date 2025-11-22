import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';

/**
 * CompaniesManagementPage - страница управления компаниями (только для super_admin)
 * TODO: Реализовать список компаний с карточками
 */
const CompaniesManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AdminPageTemplate 
      title={t('admin.companies.title', 'Управление компаниями')} 
      showSidebar={true}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          {t('admin.companies.comingSoon', 'Страница управления компаниями будет реализована в следующем этапе')}
        </p>
      </div>
    </AdminPageTemplate>
  );
};

export default CompaniesManagementPage;

