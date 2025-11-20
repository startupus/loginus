import React from 'react';
import { Icon } from '../Icon';

export interface ScrollButtonProps {
  direction: 'left' | 'right';
  ariaLabel: string;
  onClick: () => void;
  className?: string;
  variant?: 'elevated' | 'accent';
}

/**
 * ScrollButton — приподнятая круглая кнопка для горизонтальной прокрутки каруселей.
 * Использует специализированный фон surface-elevated и явный цвет иконки,
 * чтобы исключить хрупкость наследования currentColor от родителей.
 */
export const ScrollButton: React.FC<ScrollButtonProps> = ({
  direction,
  ariaLabel,
  onClick,
  className = '',
  variant = 'elevated',
}) => {
  const baseClasses =
    variant === 'elevated'
      ? 'z-10 w-8 h-8 rounded-full bg-surface-elevated shadow-lg border border-border flex items-center justify-center hover:bg-gray-1 dark:hover:bg-gray-3 transition-colors text-text-primary'
      : 'z-10 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 shadow-lg border border-primary/20 dark:border-primary/30 flex items-center justify-center hover:bg-primary/15 dark:hover:bg-primary/25 transition-colors text-primary';
  const positionClasses =
    direction === 'left'
      ? 'absolute left-0 top-1/2 -translate-y-1/2'
      : 'absolute right-0 top-1/2 -translate-y-1/2';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${positionClasses} ${baseClasses} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <Icon
        name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
        size="sm"
        // Явно задаем цвет штриха, чтобы исключить влияние currentColor от предков
        color={variant === 'elevated' ? 'rgb(var(--color-text-primary))' : 'rgb(var(--color-primary))'}
      />
    </button>
  );
};


