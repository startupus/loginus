import React from 'react';

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

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`${track} ${
            checked ? 'bg-primary' : 'bg-secondary'
          } rounded-full transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div
            className={`${thumb} ${translate} bg-white rounded-full shadow-md transform transition-transform absolute top-0.5`}
          />
        </div>
      </div>
      {label && (
        <span className={`text-sm font-medium text-text-primary ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </span>
      )}
    </label>
  );
};

