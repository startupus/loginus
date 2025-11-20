import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDark } = useTheme();
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
      <h2 className={`mb-4 ${titleSizeClasses[size]} font-bold ${isDark ? 'text-white' : 'text-text-primary'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto max-w-[600px] text-lg text-text-secondary">
          {subtitle}
        </p>
      )}
    </div>
  );
};

