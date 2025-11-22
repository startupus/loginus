import React from 'react';
import { Icon } from '../../primitives/Icon';
import { Button } from '../../primitives/Button';
import { themeClasses } from '../../utils/themeClasses';

/**
 * Интерфейс пропсов ErrorState
 */
export interface ErrorStateProps {
  /** Заголовок ошибки */
  title: string;
  /** Описание ошибки */
  description?: string;
  /** Действие для повтора */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Дополнительные CSS классы */
  className?: string;
  /** Показывать ли стандартную иконку ошибки */
  showIcon?: boolean;
}

/**
 * ErrorState - компонент для отображения состояния ошибки
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  action,
  className = '',
  showIcon = true,
}) => {
  return (
    <div className={`${themeClasses.state.error} ${className}`}>
      <div className="text-center">
        {showIcon && (
          <Icon
            name="alert-circle"
            size="lg"
            className="text-error mx-auto mb-4"
          />
        )}
        <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>
          {title}
        </h3>
        {description && (
          <p className={`${themeClasses.text.secondary} max-w-md mb-4`}>
            {description}
          </p>
        )}
        {action && (
          <Button variant="outline" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

