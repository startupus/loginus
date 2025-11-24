import React from 'react';
import { Icon } from '../../primitives/Icon';
import { Button } from '../../primitives/Button';
import { themeClasses } from '../../utils/themeClasses';

/**
 * Интерфейс пропсов EmptyState
 */
export interface EmptyStateProps {
  /** Иконка для отображения */
  icon: string;
  /** Заголовок пустого состояния */
  title: string;
  /** Описание пустого состояния */
  description?: string;
  /** Действие для выполнения */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  /** Дополнительные CSS классы */
  className?: string;
  /** Размер иконки */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Цветовой вариант */
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

/**
 * Мапп вариантов на классы icon circle
 */
const variantToIconCircleClass = {
  default: themeClasses.iconCircle.gray,
  info: themeClasses.iconCircle.info,
  success: themeClasses.iconCircle.success,
  warning: themeClasses.iconCircle.warning,
  error: themeClasses.iconCircle.error,
};

/**
 * EmptyState - компонент для отображения пустого состояния
 * Используется когда нет данных для отображения
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  iconSize = 'lg',
  variant = 'default',
}) => {
  const iconCircleClass = variantToIconCircleClass[variant];

  return (
    <div className={`${themeClasses.state.emptyDark} ${className}`}>
      {/* Иконка */}
      <div className={`${iconCircleClass} mb-4`}>
        <Icon name={icon} size={iconSize} />
      </div>

      {/* Заголовок */}
      <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>
        {title}
      </h3>

      {/* Описание */}
      {description && (
        <p className={`${themeClasses.text.secondary} max-w-md mb-4 text-center`}>
          {description}
        </p>
      )}

      {/* Действие */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

