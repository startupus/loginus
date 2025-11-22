import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface BadgeProps {
  /**
   * Содержимое значка
   */
  children: React.ReactNode;
  
  /**
   * Вариант цвета
   */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray' | 'dark';
  
  /**
   * Размер значка
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Стиль отображения
   */
  outline?: boolean;
  
  /**
   * Форма значка
   */
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  
  /**
   * Прозрачный фон с opacity
   */
  bgOpacity?: boolean;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * Badge - компонент значка на базе TailGrids
 * 
 * @source tailgrids-bank/core/Badges/
 * @example
 * <Badge variant="primary">Новое</Badge>
 * <Badge variant="success" rounded="full">Активно</Badge>
 * <Badge variant="danger" outline>Ошибка</Badge>
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  outline = false,
  rounded = 'md',
  bgOpacity = false,
  className = '',
}) => {
  // Базовые классы из TailGrids BadgesItem - ТОЧНЫЕ из исходника
  const baseClasses = 'inline-flex items-center justify-center font-medium';
  
  // Размеры значка
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  // Rounded классы из дизайн-системы
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',        // Стандартный
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  
  // Варианты цветов из дизайн-системы Loginus
  const getVariantClasses = () => {
    const variants = {
      primary: {
        solid: 'bg-primary text-white',
        outline: 'border border-primary text-primary',
        opacity: 'bg-primary/10 text-primary',
      },
      secondary: {
        solid: 'bg-secondary text-white',
        outline: 'border border-secondary text-secondary',
        opacity: 'bg-secondary/10 text-secondary',
      },
      success: {
        solid: 'bg-success text-white',
        outline: 'border border-success text-success',
        opacity: 'bg-success/10 text-success',
      },
      danger: {
        solid: 'bg-error text-white',
        outline: 'border border-error text-error',
        opacity: 'bg-error/10 text-error',
      },
      warning: {
        solid: 'bg-warning text-white',
        outline: 'border border-warning text-warning',
        opacity: 'bg-warning/10 text-warning',
      },
      info: {
        solid: 'bg-info text-white',
        outline: 'border border-info text-info',
        opacity: 'bg-info/10 text-info',
      },
      gray: {
        solid: `bg-gray-3 ${themeClasses.text.primary}`,
        outline: `border border-gray-3 ${themeClasses.text.primary} ${themeClasses.border.default}`,
        opacity: `bg-gray-3/10 ${themeClasses.text.primary}`,
      },
      dark: {
        solid: 'bg-dark text-white dark:bg-dark-2',
        outline: `border border-dark ${themeClasses.text.primary} dark:border-dark-2`,
        opacity: `bg-dark/10 ${themeClasses.text.primary}`,
      },
    };
    
    if (bgOpacity) return variants[variant].opacity;
    if (outline) return variants[variant].outline;
    return variants[variant].solid;
  };
  
  const combinedClassName = `${baseClasses} ${sizeClasses[size]} ${roundedClasses[rounded]} ${getVariantClasses()} ${className}`.trim();
  
  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
};
