import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';

/**
 * AuthFlowBuilderPage - страница настройки алгоритма авторизации
 * TODO: Реализовать D&D конструктор для шагов авторизации
 */
const AuthFlowBuilderPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AdminPageTemplate 
      title={t('admin.authFlow.title', 'Настройка алгоритма авторизации')} 
      showSidebar={true}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          {t('admin.authFlow.comingSoon', 'Конструктор алгоритма авторизации будет реализован в следующем этапе')}
        </p>
      </div>
    </AdminPageTemplate>
  );
};

export default AuthFlowBuilderPage;

