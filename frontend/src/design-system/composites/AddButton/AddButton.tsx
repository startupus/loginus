import React from 'react';
import { Icon } from '../../primitives';
import { useTheme } from '../../contexts/ThemeContext';

export interface AddButtonProps {
  /**
   * Текст кнопки
   */
  label: string;
  
  /**
   * Обработчик клика
   */
  onClick: () => void;
  
  /**
   * Вариант отображения
   */
  variant?: 'horizontal' | 'vertical' | 'compact';
  
  /**
   * Размер
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Стиль границы
   * - 'dashed' - пунктирная граница (по умолчанию, для обычных кнопок добавления)
   * - 'solid' - сплошная граница
   * - 'none' - без границы (для встраивания в другие компоненты)
   */
  borderStyle?: 'dashed' | 'solid' | 'none';
  
  /**
   * Фон кнопки
   * - 'default' - белый/темный фон (по умолчанию)
   * - 'transparent' - прозрачный фон (для встраивания)
   */
  background?: 'default' | 'transparent';
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * AddButton - универсальная кнопка "Добавить" из дизайн-системы
 * Используется для добавления элементов в различных секциях
 */
export const AddButton: React.FC<AddButtonProps> = ({
  label,
  onClick,
  variant = 'horizontal',
  size = 'md',
  borderStyle = 'dashed',
  background = 'default',
  className = '',
}) => {
  const { isDark } = useTheme();
  const sizeClasses = {
    sm: {
      padding: 'p-2',
      iconSize: 'w-5 h-5',
      icon: 'xs' as const,
      text: 'text-xs',
      gap: 'gap-1.5',
    },
    md: {
      padding: 'p-3',
      iconSize: 'w-6 h-6',
      icon: 'sm' as const,
      text: 'text-sm',
      gap: 'gap-2',
    },
    lg: {
      padding: 'p-4',
      iconSize: 'w-12 h-12',
      icon: 'md' as const,
      text: 'text-sm',
      gap: 'gap-3',
    },
  };

  const currentSize = sizeClasses[size];

  // Определяем классы границы
  const borderClasses = {
    dashed: 'border-2 border-dashed',
    solid: 'border-2 border-solid',
    none: 'border-0',
  };

  // Определяем классы фона
  const backgroundClasses = {
    default: 'bg-white dark:bg-dark-2',
    transparent: 'bg-transparent',
  };

  const baseClasses = `
    group flex items-center justify-center 
    rounded-xl 
    ${backgroundClasses[background]}
    ${borderClasses[borderStyle]}
    ${borderStyle !== 'none' ? 'border-stroke dark:border-dark-3 hover:border-primary dark:hover:border-primary' : ''}
    transition-all duration-200 
    cursor-pointer
  `.trim().replace(/\s+/g, ' ');

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} flex-row ${currentSize.padding} ${currentSize.gap} ${className}`.trim()}
      >
        <div className={`${currentSize.iconSize} rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 group-hover:scale-110`}>
          <Icon name="plus" size={currentSize.icon} className="text-primary" />
        </div>
        <div className="flex flex-col items-start min-w-0">
          <span className={`${currentSize.text} font-semibold ${isDark ? 'text-white' : 'text-text-primary'} transition-colors duration-200 group-hover:text-primary`}>
            {label}
          </span>
        </div>
      </button>
    );
  }

  if (variant === 'vertical') {
    // Для размера md используем меньшую иконку
    const iconSizeForVertical = size === 'md' ? 'w-10 h-10' : (currentSize.iconSize === 'w-12 h-12' ? 'w-12 h-12' : currentSize.iconSize);
    const iconSizeForVerticalIcon = size === 'md' ? 'sm' as const : currentSize.icon;
    
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} flex-col ${currentSize.padding} ${currentSize.gap} ${className}`.trim()}
      >
        <div className={`${iconSizeForVertical} rounded-full bg-gray-1 dark:bg-dark-3 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/10`}>
          <Icon 
            name="plus" 
            size={iconSizeForVerticalIcon} 
            className="text-text-secondary dark:text-dark-6 group-hover:text-primary transition-colors duration-200"
          />
        </div>
        <span className={`${currentSize.text} text-text-secondary group-hover:text-primary transition-colors duration-200 text-center`}>
          {label}
        </span>
      </button>
    );
  }

  // horizontal (default)
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} flex-row ${currentSize.padding} ${currentSize.gap} ${className}`.trim()}
    >
      <Icon 
        name="plus" 
        size={currentSize.icon} 
        className="text-text-secondary group-hover:text-primary transition-colors duration-200"
      />
      <span className={`${currentSize.text} text-text-secondary group-hover:text-primary transition-colors duration-200`}>
        {label}
      </span>
    </button>
  );
};

