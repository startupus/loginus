import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  /**
   * Состояние (отмечено/не отмечено)
   */
  checked: boolean;
  
  /**
   * Callback изменения
   */
  onChange: (checked: boolean) => void;
  
  /**
   * Label
   */
  label?: React.ReactNode;
  
  /**
   * Размер
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Позиция label относительно чекбокса
   */
  labelPosition?: 'left' | 'right';
}

/**
 * Checkbox - компонент чекбокса на базе TailGrids
 * 
 * @source tailgrids-bank/dashboard/TableStack/TableStack5.jsx
 * @example
 * <Checkbox checked={isChecked} onChange={setIsChecked} label="Согласен" />
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  checked,
  onChange,
  label,
  size = 'md',
  labelPosition = 'right',
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const checkbox = (
    <div className="relative">
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      <label
        htmlFor={checkboxId}
        className={`flex ${sizes[size]} cursor-pointer items-center justify-center rounded border transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
          checked
            ? 'border-primary bg-primary'
            : `border border-gray-3 dark:border-gray-3 bg-white dark:bg-dark-2`
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <span className={`icon ${checked ? '' : 'opacity-0'} transition-opacity`}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0791 3.08687C12.307 3.31468 12.307 3.68402 12.0791 3.91183L5.66248 10.3285C5.43467 10.5563 5.06533 10.5563 4.83752 10.3285L1.92085 7.41183C1.69305 7.18402 1.69305 6.81468 1.92085 6.58687C2.14866 6.35906 2.51801 6.35906 2.74581 6.58687L5.25 9.09106L11.2542 3.08687C11.482 2.85906 11.8513 2.85906 12.0791 3.08687Z"
              fill="white"
            />
          </svg>
        </span>
      </label>
    </div>
  );

  if (!label) {
    return checkbox;
  }

  const labelElement = (
    <span className={`text-sm ${themeClasses.text.primary} ${disabled ? 'opacity-50' : ''}`}>
      {label}
    </span>
  );

  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}>
      {labelPosition === 'left' && labelElement}
      {checkbox}
      {labelPosition === 'right' && labelElement}
    </label>
  );
});

