import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
   * Полная ширина
   */
  fullWidth?: boolean;
}

/**
 * Textarea - компонент многострочного поля ввода на базе Input
 * 
 * @source Основан на Input компоненте из дизайн-системы
 * @example
 * <Textarea label="Сообщение" placeholder="Введите сообщение" />
 * <Textarea label="Комментарий" error="Обязательное поле" />
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      fullWidth = false,
      className = '',
      disabled,
      rows = 1,
      ...props
    },
    ref
  ) => {
    // Базовые классы - используем стандартизированные классы темы
    // УБИРАЕМ border из baseTextareaClasses, так как он уже есть в themeClasses.border.default
    // Используем те же стили, что и Input для единообразия
    const baseTextareaClasses = 'w-full rounded-md px-5 py-[12px] transition focus:border-primary active:border-primary resize-none disabled:cursor-default leading-normal';
    
    // Классы границ в зависимости от состояния
    const borderClasses = error 
      ? 'border border-error' // Ошибка - красная граница
      : themeClasses.border.default; // Стандартная граница (уже содержит border)
    
    // Классы фона и текста
    // ИСПРАВЛЕНО: используем правильный фон для темной темы (dark-3 вместо transparent)
    const bgClasses = `${themeClasses.input.background} ${themeClasses.text.primary} ${themeClasses.input.placeholder}`;
    
    // Disabled классы
    const disabledClasses = 'disabled:border-gray-2 disabled:bg-gray-2 dark:disabled:border-dark-3 dark:disabled:bg-dark-3';
    
    // Если есть иконка слева - добавить padding
    const paddingClasses = leftIcon ? 'pl-16' : '';

    const textareaClassName = `${baseTextareaClasses} ${borderClasses} ${bgClasses} ${disabledClasses} ${paddingClasses} ${className}`.trim();
    
    const widthClass = fullWidth ? 'w-full' : '';
    // Убираем margin и padding у внешнего контейнера, если нет label, error и helperText
    const containerClass = !label && !error && !helperText ? `${widthClass} m-0 p-0` : widthClass;
    // Убираем margin у внутреннего контейнера, если нет label, error и helperText
    const innerContainerClass = !label && !error && !helperText 
      ? `relative ${fullWidth ? 'w-full' : ''} m-0 p-0` 
      : `relative ${fullWidth ? 'w-full' : ''}`;

    // Если нет label, error и helperText, возвращаем только textarea без оберток
    if (!label && !error && !helperText && !leftIcon) {
      return (
        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={textareaClassName}
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
        
        {/* Textarea с иконками */}
        <div className={innerContainerClass}>
          {/* Left Icon */}
          {leftIcon && (
            <span className="absolute left-4 top-4">
              {leftIcon}
            </span>
          )}
          
          {/* Textarea Field */}
          <textarea
            ref={ref}
            disabled={disabled}
            rows={rows}
            className={textareaClassName}
            {...props}
          />
        </div>
        
        {/* Helper Text или Error */}
        {error && (
          <p className="mt-2 text-sm text-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className={`mt-2 text-sm ${themeClasses.text.secondary}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

