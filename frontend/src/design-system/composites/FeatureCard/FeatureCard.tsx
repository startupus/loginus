import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface FeatureCardProps {
  /**
   * Иконка возможности
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
   * Вариант отображения
   */
  variant?: 'default' | 'centered';
  
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
 * FeatureCard - карточка возможности/фичи
 * Используется в секциях Features на landing страницах
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  variant = 'centered',
  onClick,
  className = '',
}) => {
  const Component = onClick ? 'button' : 'div';
  const isCentered = variant === 'centered';
  
  return (
    <Component
      onClick={onClick}
      className={`group ${isCentered ? 'text-center' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className={`mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110`}>
        {icon}
      </div>
      <h4 className={`mb-3 text-xl font-bold ${themeClasses.text.primary}`}>
        {title}
      </h4>
      <p className={`text-base ${themeClasses.text.secondary}`}>
        {description}
      </p>
    </Component>
  );
};

