import React, { useRef, useState } from 'react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const handleViewAll = () => {
    navigate(buildPathWithLang('/personal/documents', currentLang));
  };

  // Разделяем документы: обычные документы и дипломы/сертификаты отдельно
  const regularDocuments = documents.filter(doc => doc.type !== 'diplomas-certificates');
  const diplomasCertificates = documents.find(doc => doc.type === 'diplomas-certificates');
  
  // Разделяем дипломы и сертификаты на отдельные элементы и помещаем в начало списка
  const separatedDocuments = [
    ...(diplomasCertificates ? [
      { ...diplomasCertificates, type: 'diplomas', label: 'Дипломы', icon: 'award' },
      { ...diplomasCertificates, type: 'certificates', label: 'Сертификаты', icon: 'award' },
    ] : []),
    ...regularDocuments,
  ];

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  React.useEffect(() => {
    handleScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [documents]);
  
  return (
    <DataSection
      id="documents"
      title={t('personalData.documents.title', 'Документы')}
      description={t('personalData.documents.description', 'В ID ваши документы всегда под рукой. А мы бережно их храним')}
      action={
        <button
          onClick={handleViewAll}
          className="text-sm text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1"
        >
          <span>{t('personalData.documents.viewAll', 'Все документы')}</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      }
    >
      <div className="relative">
        {/* Кнопка прокрутки влево */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background dark:bg-surface shadow-lg border border-border flex items-center justify-center hover:bg-gray-1 dark:hover:bg-gray-2 transition-colors"
            aria-label={t('common.scrollLeft', 'Прокрутить влево')}
          >
            <Icon name="chevron-left" size="sm" className="text-text-secondary" />
          </button>
        )}

        {/* Карусель документов */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onScroll={handleScroll}
        >
          {separatedDocuments.map((doc, index) => (
            <button
              key={`${doc.type}-${index}`}
              onClick={() => onAddDocument?.(doc.type)}
              className="group flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-lg bg-gray-1/50 dark:bg-gray-2/50 border border-border hover:border-primary/30 hover:bg-gray-1 dark:hover:bg-gray-2 transition-all duration-200 animate-fade-in relative min-w-[120px]"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Иконка */}
              <div className="w-12 h-12 rounded-lg bg-gray-1 dark:bg-gray-2 flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-2 dark:group-hover:bg-gray-3">
                <Icon 
                  name={doc.icon} 
                  size="md" 
                  className="text-text-secondary"
                />
              </div>
              
              {/* Название (локализуется по type, fallback на doc.label) */}
              <span className="text-xs text-center text-text-secondary group-hover:text-text-primary transition-colors duration-200">
                {getDocumentLabel(doc.type, t, doc.label || doc.type)}
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

        {/* Кнопка прокрутки вправо */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background dark:bg-surface shadow-lg border border-border flex items-center justify-center hover:bg-gray-1 dark:hover:bg-gray-2 transition-colors"
            aria-label={t('common.scrollRight', 'Прокрутить вправо')}
          >
            <Icon name="chevron-right" size="sm" className="text-text-secondary" />
          </button>
        )}
      </div>
    </DataSection>
  );
};
