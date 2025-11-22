import React from 'react';
import { Spinner } from '../../primitives/Spinner';
import { themeClasses } from '../../utils/themeClasses';

/**
 * Интерфейс пропсов LoadingState
 */
export interface LoadingStateProps {
  /** Текст для отображения */
  text?: string;
  /** Размер спиннера */
  size?: 'sm' | 'md' | 'lg';
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * LoadingState - компонент для отображения состояния загрузки
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  text = 'Загрузка...',
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`${themeClasses.state.loading} ${className}`}>
      <div className="text-center">
        <Spinner size={size} className="mx-auto mb-4" />
        <p className={themeClasses.text.secondary}>{text}</p>
      </div>
    </div>
  );
};

