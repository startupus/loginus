import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface SwitchProps {
  /**
   * Состояние (включено/выключено)
   */
  checked: boolean;
  
  /**
   * Callback изменения
   */
  onChange: (checked: boolean) => void;
  
  /**
   * Label
   */
  label?: string;
  
  /**
   * Disabled
   */
  disabled?: boolean;
  
  /**
   * Размер
   */
  size?: 'sm' | 'md' | 'lg';
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}) => {
  const sizes = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'h-4 w-4',
      translate: checked ? 'translate-x-4' : 'translate-x-0.5',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'h-5 w-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0.5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'h-6 w-6',
      translate: checked ? 'translate-x-7' : 'translate-x-0.5',
    },
  };

  const { track, thumb, translate } = sizes[size];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label 
      className="flex items-center gap-3 cursor-pointer" 
      onClick={handleToggle}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="relative" style={{ pointerEvents: 'auto' }}>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.checked);
          }}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
        <div
          className={`${track} ${
            checked ? 'bg-primary' : themeClasses.background.gray2
          } rounded-full transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={handleToggle}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className={`${thumb} ${translate} ${themeClasses.background.surface} rounded-full shadow-md transform transition-transform absolute top-0.5`}
          />
        </div>
      </div>
      {label && (
        <span className={`text-sm font-medium ${themeClasses.text.primary} ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </span>
      )}
    </label>
  );
};

