import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variant цвета кнопки
   * @source Классы из tailgrids-bank/core/Buttons/
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error' | 'success' | 'warning' | 'link';
  
  /**
   * Размер кнопки
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Полная ширина
   */
  fullWidth?: boolean;
  
  /**
   * Состояние загрузки
   */
  loading?: boolean;
  
  /**
   * Иконка слева
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Иконка справа
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Использовать градиент
   */
  gradient?: boolean;
  
  /**
   * Кнопка только с иконкой (без текста)
   * Автоматически уменьшает padding для компактного вида
   */
  iconOnly?: boolean;
}

/**
 * Button - компонент кнопки на базе TailGrids
 * 
 * @source tailgrids-bank/core/Buttons/
 * @example
 * <Button variant="primary">Нажми меня</Button>
 * <Button variant="primary" gradient>С градиентом</Button>
 * <Button variant="outline" iconOnly><Icon name="paperclip" /></Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      gradient = false,
      iconOnly = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Определяем iconOnly: явно указан или автоматически по содержимому
    // Автоматическое определение: есть children (React элемент), но нет текста и нет leftIcon/rightIcon
    const hasTextContent = children && typeof children === 'string' && String(children).trim().length > 0;
    const hasOnlyIcon = children && !hasTextContent && !leftIcon && !rightIcon;
    // Если iconOnly явно указан, используем его; иначе определяем автоматически
    const isIconOnly = iconOnly === true || (iconOnly !== false && hasOnlyIcon && !loading);
    
    // Базовые классы из TailGrids Buttons (ТОЧНЫЕ из исходников)
    const baseStyles = 'inline-flex items-center justify-center border text-center font-medium transition-all duration-200';

    // Варианты из TailGrids Buttons - используют токены темы через CSS переменные
    const variantStyles = {
      // Primary с градиентом или без - использует токены темы
      primary: gradient 
        ? 'border-0 bg-gradient-to-r from-primary via-primary/80 to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white shadow-lg hover:shadow-xl'
        : 'border-primary bg-primary text-white hover:bg-primary/90 hover:border-primary/90 shadow-lg hover:shadow-xl',
      
      // Secondary - использует цвет из темы (серый)
      secondary: 'border-secondary bg-secondary text-white hover:bg-secondary/90 hover:border-secondary/90',
      
      // Outline - использует токены темы
      outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white',
      
      // Ghost - использует токены темы
      ghost: `border-transparent bg-transparent ${themeClasses.text.secondary} ${themeClasses.active.navItemInactive}`,
      
      // Error - использует токены темы
      error: 'border-error bg-error text-white hover:bg-error/90 hover:border-error/90',
      
      // Success - использует токены темы
      success: 'border-success bg-success text-white hover:bg-success/90 hover:border-success/90',
      
      // Warning - использует токены темы
      warning: 'border-warning bg-warning text-white hover:bg-warning/90 hover:border-warning/90',
      
      // Link - использует токены темы
      link: 'border-transparent bg-transparent text-primary hover:text-primary/80 hover:underline',
    };

    // Размеры (адаптировано из TailGrids)
    // Для iconOnly используем компактный padding (квадратные кнопки)
    // Уменьшаем padding для более компактного вида иконок - используем меньшие значения
    const sizeStyles = {
      xs: isIconOnly ? 'p-1 text-xs' : 'px-4 py-2 text-xs gap-1',
      sm: isIconOnly ? 'p-1.5 text-sm' : 'px-6 py-2.5 text-sm gap-1.5',
      md: isIconOnly ? 'p-2 text-base' : 'px-7 py-3 text-base gap-2',      // Стандартный из TailGrids
      lg: isIconOnly ? 'p-2.5 text-lg' : 'px-9 py-4 text-lg gap-2.5',
      xl: isIconOnly ? 'p-3 text-xl' : 'px-11 py-5 text-xl gap-3',
    };
    
    // Disabled стили - для primary используем голубой цвет с opacity, для остальных серый
    const disabledStyles = variant === 'primary' 
      ? 'disabled:border-primary/30 disabled:bg-primary/30 disabled:text-white disabled:cursor-not-allowed disabled:opacity-70'
      : 'disabled:border-gray-3 disabled:bg-gray-3 disabled:text-dark-5 disabled:cursor-not-allowed disabled:opacity-70';

    // Width style
    const widthStyle = fullWidth ? 'w-full' : '';

    // Rounded (для современного вида)
    const roundedStyle = size === 'xs' || size === 'sm' ? 'rounded-lg' : 'rounded-xl';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyle} ${roundedStyle} ${className}`.trim();

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={combinedClassName}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
