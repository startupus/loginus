import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { getDocumentLabel } from '../../utils/i18nMappings';

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
 * DocumentsGrid - минималистичная сетка типов документов
 * Спокойный дизайн без ярких цветов и агрессивных эффектов
 */
export const DocumentsGrid: React.FC<DocumentsGridProps> = ({
  documents,
  onAddDocument,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  
  const handleViewAll = () => {
    navigate(buildPathWithLang('/personal/documents', currentLang));
  };
  
  return (
    <DataSection
      id="documents"
      title={t('personalData.documents.title', 'Документы')}
      description={t('personalData.documents.description', 'В ID ваши документы всегда под рукой. А мы бережно их храним')}
      action={
        <button
          onClick={handleViewAll}
          className="text-sm text-body-color dark:text-dark-6 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1"
        >
          <span>{t('personalData.documents.viewAll', 'Все документы')}</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {documents.map((doc, index) => (
          <button
            key={doc.type}
            onClick={() => onAddDocument?.(doc.type)}
            className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-gray-3 dark:hover:border-dark-4 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Иконка */}
            <div className="w-12 h-12 rounded-lg bg-gray-1 dark:bg-dark-3 flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-2 dark:group-hover:bg-dark-4">
              <Icon 
                name={doc.icon} 
                size="md" 
                className="text-body-color dark:text-dark-6"
              />
            </div>
            
            {/* Название (локализуется по type) */}
            <span className="text-xs text-center text-body-color dark:text-dark-6 group-hover:text-dark dark:group-hover:text-white transition-colors duration-200">
              {getDocumentLabel(doc.type, t, doc.label)}
            </span>
            
            {/* Статус */}
            {doc.added && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </DataSection>
  );
};
