import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { Button, Icon } from '../design-system/primitives';
import { DataSection } from '../design-system/composites/DataSection';
import { personalApi } from '../services/api/personal';

/**
 * PersonalDocumentsPage - страница управления документами
 */
const PersonalDocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['personal-documents'],
    queryFn: () => personalApi.getDocuments(),
  });

  if (isLoading) {
    return (
      <PageTemplate title={t('personalData.documents.title', 'Документы')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-body-color dark:text-dark-6">{t('common.loading', 'Загрузка...')}</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  const documents = data?.data?.documents || [];

  return (
    <PageTemplate title={t('personalData.documents.title', 'Документы')} showSidebar={true}>
      <div className="space-y-6">
        <DataSection
          id="documents"
          title={t('personalData.documents.title', 'Документы')}
          description={t('personalData.documents.description', 'В ID ваши документы всегда под рукой. А мы бережно их храним')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map((doc: any) => (
              <div
                key={doc.type}
                className="p-6 rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-4">
                  <Icon name={doc.icon || 'document'} size="xl" className="text-primary" />
                  <div className="text-center">
                    <h3 className="font-semibold text-dark dark:text-white mb-1">
                      {doc.label || doc.type}
                    </h3>
                    {doc.added ? (
                      <p className="text-sm text-body-color dark:text-dark-6">
                        {t('common.edit', 'Редактировать')}
                      </p>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-2"
                      >
                        {t('personalData.documents.addDocument', 'Добавить документ')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DataSection>
      </div>
    </PageTemplate>
  );
};

export default PersonalDocumentsPage;

