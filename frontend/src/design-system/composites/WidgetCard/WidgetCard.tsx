import React from 'react';

export interface WidgetCardProps {
  /**
   * Заголовок виджета
   */
  title?: string;
  
  /**
   * Иконка виджета
   */
  icon?: React.ReactNode;
  
  /**
   * Содержимое виджета
   */
  children: React.ReactNode;
  
  /**
   * Действия (кнопки, ссылки)
   */
  actions?: React.ReactNode;
  
  /**
   * Вариант отображения
   */
  variant?: 'default' | 'primary' | 'feature' | 'compact';
  
  /**
   * Клик на всю карточку
   */
  onClick?: () => void;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * WidgetCard - Карточка виджета на базе TailGrids Card
 * 
 * @source tailgrids-bank/application/Card/Card1.jsx (SingleCard component)
 * @example
 * <WidgetCard title="Документы" icon={<Icon name="document" />}>
 *   <p>У вас 5 документов</p>
 * </WidgetCard>
 */
export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon,
  children,
  actions,
  variant = 'default',
  onClick,
  className = '',
}) => {
  // Базовые классы из TailGrids Card1.jsx SingleCard - ТОЧНЫЕ из исходника
  // Добавлены анимации из mega шаблона: hover:-translate-y-1 для поднятия карточки
  const baseClasses = 'overflow-hidden rounded-lg shadow-1 duration-300 hover:shadow-3 hover:-translate-y-1 dark:shadow-card dark:hover:shadow-3 transition-all';
  
  // Варианты фона из TailGrids
  const variantClasses = {
    default: 'bg-white dark:bg-dark-2',  // Из Card1.jsx
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    feature: 'bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20',
    compact: 'bg-white dark:bg-dark-2',
  };
  
  // Padding - из TailGrids Card1.jsx
  const paddingClasses = {
    default: 'p-8 sm:p-9 md:p-7 xl:p-9',  // Точные из исходника
    primary: 'p-8 sm:p-9 md:p-7 xl:p-9',
    feature: 'p-8 sm:p-9 md:p-7 xl:p-9',
    compact: 'p-4',
  };
  
  const Component = onClick ? 'button' : 'div';
  
  const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`.trim();
  
  return (
    <Component
      onClick={onClick}
      className={`group ${combinedClassName}`}
    >
      <div className={paddingClasses[variant]}>
        {/* Header с иконкой, заголовком и действиями */}
        {(title || icon || actions) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {icon}
                </div>
              )}
              {title && (
                <h3 className="text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]">
                  {title}
                </h3>
              )}
            </div>
            {actions && (
              <div className="flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}
        
        {/* Content - классы из TailGrids Card1.jsx */}
        <div className="text-base leading-relaxed text-body-color dark:text-dark-6">
          {children}
        </div>
      </div>
    </Component>
  );
};
