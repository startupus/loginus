import React from 'react';

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
}

/**
 * Button - компонент кнопки на базе TailGrids
 * 
 * @source tailgrids-bank/core/Buttons/
 * @example
 * <Button variant="primary">Нажми меня</Button>
 * <Button variant="primary" gradient>С градиентом</Button>
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
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Базовые классы из TailGrids Buttons (ТОЧНЫЕ из исходников)
    const baseStyles = 'inline-flex items-center justify-center border text-center font-medium transition-all duration-200';

    // Варианты из TailGrids Buttons - с правильной контрастностью
    const variantStyles = {
      // Primary с градиентом или без
      primary: gradient 
        ? 'border-0 bg-gradient-to-r from-primary via-blue-600 to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white shadow-lg hover:shadow-xl'
        : 'border-primary bg-primary text-white hover:bg-[#1B44C8] hover:border-[#1B44C8] shadow-lg hover:shadow-xl',
      
      // Secondary из TailGrids
      secondary: 'border-secondary bg-secondary text-white hover:bg-[#0BB489] hover:border-[#0BB489]',
      
      // Outline из TailGrids
      outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white dark:text-white dark:hover:bg-primary',
      
      // Ghost
      ghost: 'border-transparent bg-transparent text-body-color hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3',
      
      // Error
      error: 'border-red bg-red text-white hover:bg-red-dark',
      
      // Success
      success: 'border-green bg-green text-white hover:bg-opacity-90',
      
      // Warning
      warning: 'border-yellow bg-yellow text-dark hover:bg-opacity-90',
      
      // Link
      link: 'border-transparent bg-transparent text-primary hover:text-primary-dark hover:underline',
    };

    // Размеры (адаптировано из TailGrids)
    const sizeStyles = {
      xs: 'px-4 py-2 text-xs gap-1',
      sm: 'px-6 py-2.5 text-sm gap-1.5',
      md: 'px-7 py-3 text-base gap-2',      // Стандартный из TailGrids
      lg: 'px-9 py-4 text-lg gap-2.5',
      xl: 'px-11 py-5 text-xl gap-3',
    };
    
    // Disabled из TailGrids - ТОЧНЫЕ классы
    const disabledStyles = 'disabled:border-gray-3 disabled:bg-gray-3 disabled:text-dark-5 disabled:cursor-not-allowed disabled:opacity-70';

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
