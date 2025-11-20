import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface SectionHeaderProps {
  /**
   * Заголовок секции
   */
  title: string;
  
  /**
   * Подзаголовок/описание
   */
  subtitle?: string;
  
  /**
   * Выравнивание текста
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Размер заголовка
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * SectionHeader - заголовок секции с подзаголовком
 * Используется для секций Features, FAQ и других на landing страницах
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  align = 'center',
  size = 'lg',
  className = '',
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const titleSizeClasses = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-4xl lg:text-5xl',
  };

  return (
    <div className={`mb-16 ${alignClasses[align]} ${className}`}>
      <h2 className={`mb-4 ${titleSizeClasses[size]} font-bold ${themeClasses.text.primary}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mx-auto max-w-[600px] text-lg ${themeClasses.text.secondary}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

