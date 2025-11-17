import React from 'react';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Ориентация разделителя
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Декоративный разделитель (не влияет на семантику)
   */
  decorative?: boolean;
}

/**
 * Separator - Компонент разделителя для визуального разделения элементов
 * 
 * @example
 * // Горизонтальный разделитель
 * <Separator />
 * 
 * @example
 * // Вертикальный разделитель
 * <Separator orientation="vertical" />
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      orientation = 'horizontal',
      decorative = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'bg-secondary-200 dark:bg-secondary-700';

    // Orientation styles
    const orientationStyles = {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    };

    const combinedClassName = `${baseStyles} ${orientationStyles[orientation]} ${className}`.trim();

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        className={combinedClassName}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

