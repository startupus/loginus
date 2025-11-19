import React from 'react';
import { useCurrentLanguage, buildPathWithLang } from '../../../utils/routing';
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
   * Action элемент в заголовке (например, кнопка)
   */
  action?: React.ReactNode;
  
  /**
   * Ссылка "Все [тип]" (может быть строкой для обратной совместимости или объектом)
   */
  viewAllLink?: string | {
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
  action,
  viewAllLink,
  className = '',
}) => {
  const currentLang = useCurrentLanguage() || 'ru';
  
  // Формируем полный URL с языком для открытия в новой вкладке
  const getFullUrl = (href: string) => {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href;
    }
    return buildPathWithLang(href, currentLang);
  };

  return (
    <section 
      id={id} 
      className={`
        bg-white dark:bg-dark-2 
        rounded-xl 
        shadow-1 dark:shadow-card 
        border border-gray-2 dark:border-dark-3
        p-6 sm:p-8
        transition-all duration-300
        hover:shadow-3 dark:hover:shadow-3
        ${className}
      `.trim()}
    >
      {/* Header */}
      <header className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-dark dark:text-white">
            {id ? (
              <a
                href={`#${id}`}
                className="hover:text-primary dark:hover:text-primary transition-colors"
              >
                {title}
              </a>
            ) : (
              title
            )}
          </h2>
          {action && <div>{action}</div>}
        </div>
        {description && (
          <p className="text-sm text-body-color dark:text-dark-6">
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
        <div className="mt-6 pt-4 border-t border-gray-2 dark:border-dark-3">
          <a
            href={getFullUrl(typeof viewAllLink === 'string' ? viewAllLink : viewAllLink.href)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            {typeof viewAllLink === 'object' && viewAllLink.icon && <Icon name={viewAllLink.icon} size="sm" />}
            <span>{typeof viewAllLink === 'string' ? 'Все' : viewAllLink.label}</span>
            <Icon name="chevron-right" size="sm" />
          </a>
        </div>
      )}
    </section>
  );
};

