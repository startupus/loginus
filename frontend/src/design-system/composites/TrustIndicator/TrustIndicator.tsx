import React from 'react';
import { Icon } from '../../primitives/Icon';

export interface TrustIndicatorProps {
  /**
   * Текст индикатора
   */
  label: string;
  
  /**
   * Иконка (по умолчанию check)
   */
  icon?: React.ReactNode;
  
  /**
   * Цвет иконки
   */
  iconColor?: 'green' | 'primary' | 'secondary';
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * TrustIndicator - индикатор доверия (Безопасно, Быстро, Удобно)
 * Используется в hero-секциях для показа преимуществ
 */
export const TrustIndicator: React.FC<TrustIndicatorProps> = ({
  label,
  icon,
  iconColor = 'green',
  className = '',
}) => {
  const iconColorClasses = {
    green: 'text-green',
    primary: 'text-primary',
    secondary: 'text-secondary',
  };

  const defaultIcon = (
    <Icon
      name="check"
      size="sm"
      className={iconColorClasses[iconColor]}
    />
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon || defaultIcon}
      <span className="text-sm font-medium text-body-color dark:text-dark-6">
        {label}
      </span>
    </div>
  );
};

