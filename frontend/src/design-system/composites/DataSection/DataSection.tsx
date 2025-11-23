import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentLanguage, buildPathWithLang } from '../../../utils/routing';
import { Icon } from '../../primitives';
import { themeClasses } from '../../utils/themeClasses';

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
 *   viewAllLink={{ label: "Все документы", href: "/data/documents" }}
 * >
 *   <DocumentsList />
 * </DataSection>
 */
export const DataSection: React.FC<DataSectionProps> = React.memo(({
  id,
  title,
  description,
  children,
  action,
  viewAllLink,
  className = '',
}) => {
  const currentLang = useCurrentLanguage() || 'ru';
  const navigate = useNavigate();
  
  // Определяем, является ли ссылка внешней
  const isExternalLink = React.useCallback((href: string) => {
    return href.startsWith('http://') || href.startsWith('https://');
  }, []);
  
  // Формируем полный URL с языком
  const getFullUrl = React.useCallback((href: string) => {
    if (isExternalLink(href)) {
      return href;
    }
    return buildPathWithLang(href, currentLang);
  }, [currentLang, isExternalLink]);
  
  // Обработчик клика для внутренних ссылок
  const handleLinkClick = React.useCallback((e: React.MouseEvent, href: string) => {
    if (!isExternalLink(href)) {
      e.preventDefault();
      navigate(getFullUrl(href));
    }
  }, [navigate, getFullUrl, isExternalLink]);

  return (
    <section 
      id={id} 
      className={`
        ${themeClasses.card.rounded}
        p-6 sm:p-8
        ${className}
      `.trim()}
    >
      {/* Header */}
      <header className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
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
          <p className="text-sm text-text-secondary">
            {description}
          </p>
        )}
      </header>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* View All Link */}
      {viewAllLink && (() => {
        const href = typeof viewAllLink === 'string' ? viewAllLink : viewAllLink.href;
        const label = typeof viewAllLink === 'string' ? 'Все' : viewAllLink.label;
        const icon = typeof viewAllLink === 'object' ? viewAllLink.icon : undefined;
        const fullUrl = getFullUrl(href);
        const isExternal = isExternalLink(href);
        
        const linkContent = (
          <>
            {icon && <Icon name={icon} size="sm" />}
            <span>{label}</span>
            <Icon name="chevron-right" size="sm" />
          </>
        );
        
        return (
          <div className="mt-6 pt-4 border-t border-border">
            {isExternal ? (
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {linkContent}
              </a>
            ) : (
              <Link
                to={fullUrl}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {linkContent}
              </Link>
            )}
          </div>
        );
      })()}
    </section>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.className === nextProps.className &&
    prevProps.action === nextProps.action &&
    prevProps.viewAllLink === nextProps.viewAllLink &&
    prevProps.children === nextProps.children
  );
});

DataSection.displayName = 'DataSection';

