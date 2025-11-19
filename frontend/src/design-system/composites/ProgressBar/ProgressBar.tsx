import React from 'react';

export interface ProgressBarProps {
  /**
   * Текущий шаг (начиная с 1)
   */
  currentStep: number;
  
  /**
   * Общее количество шагов
   */
  totalSteps: number;
  
  /**
   * Размер
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Показать номера шагов
   */
  showSteps?: boolean;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * ProgressBar - компонент прогресс-бара для многошаговых форм
 * 
 * @example
 * <ProgressBar currentStep={2} totalSteps={3} />
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  size = 'md',
  showSteps = false,
  className = '',
}) => {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`flex-1 w-full ${sizes[size]} rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary'
                    : 'bg-gray-2 dark:bg-dark-3'
                }`}
              />
              {showSteps && (
                <span className={`text-xs font-medium ${
                  isActive
                    ? 'text-primary'
                    : 'text-body-color dark:text-dark-6'
                }`}>
                  {stepNumber}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

