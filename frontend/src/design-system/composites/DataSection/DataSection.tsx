import React from 'react';
import { Icon } from '../../primitives';

export interface DataSectionProps {
  /**
   * Якорная ссылка (например, "documents")
   */
  id?: string;
  
  /**
   * Заголовок секции
   */
  title: string;
  
  /**
   * Описание секции
   */
  description?: string;
  
  /**
   * Содержимое секции
   */
  children: React.ReactNode;
  
  /**
   * Ссылка "Все [тип]"
   */
  viewAllLink?: {
    label: string;
    href: string;
    icon?: string;
  };
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * DataSection - Секция данных с заголовком, описанием и контентом
 * 
 * @example
 * <DataSection
 *   id="documents"
 *   title="Документы"
 *   description="В ID ваши документы всегда под рукой"
 *   viewAllLink={{ label: "Все документы", href: "/personal/documents" }}
 * >
 *   <DocumentsList />
 * </DataSection>
 */
export const DataSection: React.FC<DataSectionProps> = ({
  id,
  title,
  description,
  children,
  viewAllLink,
  className = '',
}) => {
  return (
    <section id={id} className={`space-y-4 ${className}`.trim()}>
      {/* Header */}
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-secondary-900 dark:text-white">
          {id ? (
            <a
              href={`#${id}`}
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h2>
        {description && (
          <p className="text-sm text-secondary-600 dark:text-dark-6">
            {description}
          </p>
        )}
      </header>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* View All Link */}
      {viewAllLink && (
        <a
          href={viewAllLink.href}
          className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          {viewAllLink.icon && <Icon name={viewAllLink.icon} size="sm" />}
          <span>{viewAllLink.label}</span>
          <Icon name="chevron-right" size="sm" />
        </a>
      )}
    </section>
  );
};

