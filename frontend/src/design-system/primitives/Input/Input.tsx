import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label для поля
   */
  label?: string;
  
  /**
   * Текст ошибки
   */
  error?: string;
  
  /**
   * Текст подсказки
   */
  helperText?: string;
  
  /**
   * Иконка слева
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Иконка справа
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Полная ширина
   */
  fullWidth?: boolean;
}

/**
 * Input - компонент поля ввода на базе TailGrids
 * 
 * @source tailgrids-bank/core/FormElement/FormElementInput.jsx
 * @example
 * <Input label="Email" placeholder="Введите email" />
 * <Input label="Имя" error="Обязательное поле" />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Базовые классы - используем стандартизированные классы темы
    // УБИРАЕМ border из baseInputClasses, так как он уже есть в themeClasses.border.default
    // Используем те же стили, что и Textarea для единообразия
    const baseInputClasses = 'w-full rounded-md px-5 py-[12px] transition focus:border-primary active:border-primary disabled:cursor-default leading-normal';
    
    // Классы границ в зависимости от состояния - используем стандартизированные классы
    const borderClasses = error 
      ? 'border border-error' // Ошибка - красная граница
      : themeClasses.border.default; // Стандартная граница (уже содержит border)
    
    // Классы фона и текста - используем стандартизированные классы
    // ИСПРАВЛЕНО: используем правильный фон для темной темы (dark-3 вместо transparent)
    const bgClasses = `${themeClasses.input.background} ${themeClasses.text.primary} ${themeClasses.input.placeholder}`;
    
    // Disabled классы - используем стандартизированные классы для обеих тем
    const disabledClasses = 'disabled:border-gray-2 disabled:bg-gray-2 dark:disabled:border-dark-3 dark:disabled:bg-dark-3';
    
    // Если есть иконки - добавить padding
    const paddingClasses = leftIcon ? 'pl-16' : rightIcon ? 'pr-12' : '';

    const inputClassName = `${baseInputClasses} ${borderClasses} ${bgClasses} ${disabledClasses} ${paddingClasses} ${className}`.trim();
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    // Убираем margin и padding у внешнего контейнера, если нет label, error и helperText (как в Textarea)
    const containerClass = !label && !error && !helperText ? `${widthClass} m-0 p-0` : widthClass;
    // Убираем margin у внутреннего контейнера, если нет label, error и helperText
    const innerContainerClass = !label && !error && !helperText 
      ? `relative ${fullWidth ? 'w-full' : ''} m-0 p-0` 
      : `relative ${fullWidth ? 'w-full' : ''}`;

    // Если нет label, error и helperText, возвращаем только input без оберток (как в Textarea)
    // Но если есть иконки, нужна обертка для позиционирования
    if (!label && !error && !helperText && !leftIcon && !rightIcon) {
      return (
        <input
          ref={ref}
          disabled={disabled}
          className={inputClassName}
          {...props}
        />
      );
    }

    return (
      <div className={containerClass}>
        {/* Label - используем стандартизированные классы */}
        {label && (
          <label className={`mb-[10px] block text-base font-medium ${themeClasses.text.primary}`}>
            {label}
          </label>
        )}
        
        {/* Input с иконками */}
        <div className={innerContainerClass}>
          {/* Left Icon - из TailGrids NameInput */}
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2">
              {leftIcon}
            </span>
          )}
          
          {/* Input Field */}
          <input
            ref={ref}
            disabled={disabled}
            className={inputClassName}
            {...props}
          />
          
          {/* Right Icon - из TailGrids InvalidInput/StrongInput */}
          {rightIcon && !error && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightIcon}
            </span>
          )}
          
          {/* Error Icon - из TailGrids InvalidInput */}
          {error && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.9987 2.50065C5.85656 2.50065 2.4987 5.85852 2.4987 10.0007C2.4987 14.1428 5.85656 17.5007 9.9987 17.5007C14.1408 17.5007 17.4987 14.1428 17.4987 10.0007C17.4987 5.85852 14.1408 2.50065 9.9987 2.50065ZM0.832031 10.0007C0.832031 4.93804 4.93609 0.833984 9.9987 0.833984C15.0613 0.833984 19.1654 4.93804 19.1654 10.0007C19.1654 15.0633 15.0613 19.1673 9.9987 19.1673C4.93609 19.1673 0.832031 15.0633 0.832031 10.0007Z"
                  fill="rgb(var(--color-error))"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.0013 5.83398C10.4615 5.83398 10.8346 6.20708 10.8346 6.66732V10.0007C10.8346 10.4609 10.4615 10.834 10.0013 10.834C9.54106 10.834 9.16797 10.4609 9.16797 10.0007V6.66732C9.16797 6.20708 9.54106 5.83398 10.0013 5.83398Z"
                  fill="rgb(var(--color-error))"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.16797 13.3333C9.16797 12.8731 9.54106 12.5 10.0013 12.5H10.0096C10.4699 12.5 10.843 12.8731 10.843 13.3333C10.843 13.7936 10.4699 14.1667 10.0096 14.1667H10.0013C9.54106 14.1667 9.16797 13.7936 9.16797 13.3333Z"
                  fill="rgb(var(--color-error))"
                />
              </svg>
            </span>
          )}
        </div>
        
        {/* Error Message - используем стандартизированные классы */}
        {error && (
          <p className={`mt-[10px] text-sm text-error`}>
            {error}
          </p>
        )}
        
        {/* Helper Text - используем стандартизированные классы */}
        {helperText && !error && (
          <p className={`mt-[10px] text-sm ${themeClasses.text.secondary}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
