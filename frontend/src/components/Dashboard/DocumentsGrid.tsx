import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';

export interface DocumentType {
  type: string;
  label: string;
  icon: string;
  added: boolean;
}

export interface DocumentsGridProps {
  documents: DocumentType[];
  onAddDocument?: (type: string) => void;
}

/**
 * DocumentsGrid - сетка типов документов
 */
export const DocumentsGrid: React.FC<DocumentsGridProps> = ({
  documents,
  onAddDocument,
}) => {
  const { t } = useTranslation();
  
  return (
    <DataSection
      id="documents"
      title={t('personalData.documents.title', 'Документы')}
      description={t('personalData.documents.description', 'В ID ваши документы всегда под рукой. А мы бережно их храним')}
      viewAllLink="/personal/documents"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {documents.map((doc, index) => (
          <Button
            key={doc.type}
            variant="outline"
            className="group flex flex-col items-center gap-2 h-auto py-4 transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary"
            onClick={() => onAddDocument?.(doc.type)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Icon name={doc.icon} size="lg" className="text-primary dark:text-white transition-all duration-200 group-hover:scale-110 group-hover:text-white dark:group-hover:text-white" />
            <span className="text-xs text-center text-primary dark:text-white transition-colors duration-200 group-hover:text-white dark:group-hover:text-white">
              {doc.added ? doc.label : t('personalData.documents.addDocument', 'Добавить') + ' ' + doc.label}
            </span>
          </Button>
        ))}
      </div>
    </DataSection>
  );
};

