import React from 'react';

export interface ServiceCardProps {
  /**
   * Иконка сервиса
   */
  icon: React.ReactNode;
  
  /**
   * Заголовок
   */
  title: string;
  
  /**
   * Описание
   */
  description: string;
  
  /**
   * Callback при клике
   */
  onClick?: () => void;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * ServiceCard - компактная карточка сервиса с hover эффектом
 * Используется в hero-секциях landing страниц
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  onClick,
  className = '',
}) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`group rounded-2xl bg-white p-8 shadow-1 transition-all duration-300 hover:shadow-3 hover:-translate-y-1 dark:bg-dark-2 dark:shadow-card dark:hover:shadow-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-dark dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-body-color dark:text-dark-6">
        {description}
      </p>
    </Component>
  );
};

