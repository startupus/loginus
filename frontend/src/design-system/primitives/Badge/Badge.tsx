import React from 'react';

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
  outline = false,
  rounded = 'md',
  bgOpacity = false,
  className = '',
}) => {
  // Базовые классы из TailGrids BadgesItem - ТОЧНЫЕ из исходника
  const baseClasses = 'inline-block px-2.5 py-1 text-xs font-medium';
  
  // Rounded классы из TailGrids
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-xs',
    md: 'rounded',        // Стандартный из TailGrids
    lg: 'rounded-lg',
    full: 'rounded-full', // Из TailGrids BadgesItem
  };
  
  // Варианты цветов из TailGrids Badges
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
        solid: 'bg-green text-white',
        outline: 'border border-green text-green',
        opacity: 'bg-green/10 text-green',
      },
      danger: {
        solid: 'bg-red text-white',
        outline: 'border border-red text-red',
        opacity: 'bg-red/10 text-red',
      },
      warning: {
        solid: 'bg-yellow text-white',
        outline: 'border border-yellow text-yellow',
        opacity: 'bg-yellow/10 text-yellow',
      },
      info: {
        solid: 'bg-blue text-white',
        outline: 'border border-blue text-blue',
        opacity: 'bg-blue/10 text-blue',
      },
      gray: {
        solid: 'bg-gray-3 text-dark',
        outline: 'border border-gray-3 text-dark',
        opacity: 'bg-gray-3/10 text-dark',
      },
      dark: {
        solid: 'bg-dark text-white dark:bg-dark-2',
        outline: 'border border-dark text-dark dark:border-dark-2 dark:text-white',
        opacity: 'bg-dark/10 text-dark dark:text-white',
      },
    };
    
    if (bgOpacity) return variants[variant].opacity;
    if (outline) return variants[variant].outline;
    return variants[variant].solid;
  };
  
  const combinedClassName = `${baseClasses} ${roundedClasses[rounded]} ${getVariantClasses()} ${className}`.trim();
  
  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
};
