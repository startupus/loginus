import React from 'react';

export interface AvatarProps {
  /**
   * URL изображения
   */
  src?: string;
  
  /**
   * Alt текст
   */
  alt?: string;
  
  /**
   * Инициалы (если нет изображения)
   */
  initials?: string;
  
  /**
   * Размер аватара
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /**
   * Цвет фона (для инициалов)
   */
  bgColor?: string;
  
  /**
   * Форма
   */
  rounded?: boolean;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  initials,
  size = 'md',
  bgColor = 'bg-primary-600',
  rounded = false,
  className = '',
}) => {
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const shapeStyles = rounded ? 'rounded-full' : 'rounded-lg';
  
  const baseStyles = `inline-flex items-center justify-center overflow-hidden ${shapeStyles} ${sizeStyles[size]}`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${baseStyles} ${className}`.trim()}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`${baseStyles} ${bgColor} text-white font-semibold ${className}`.trim()}
      >
        {initials}
      </div>
    );
  }

  // Fallback icon
  return (
    <div
      className={`${baseStyles} bg-secondary-200 text-secondary-500 ${className}`.trim()}
    >
      <svg
        className="w-2/3 h-2/3"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};

