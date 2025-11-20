import React from 'react';
import { Link } from 'react-router-dom';
import { themeClasses } from '../../utils/themeClasses';

export interface LogoProps {
  /**
   * Размер логотипа
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Показать текст рядом с логотипом
   */
  showText?: boolean;
  
  /**
   * Текст логотипа (по умолчанию "Loginus")
   */
  text?: string;
  
  /**
   * URL для ссылки (по умолчанию "/")
   */
  href?: string;
  
  /**
   * Callback при клике
   */
  onClick?: () => void;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * Logo - компонент логотипа Loginus ID
 * Включает знак "iD" с зеленой точкой и опциональный текст
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  text = 'Loginus',
  href = '/',
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      dot: 'w-2.5 h-2.5',
      iconText: 'text-sm',
    },
    md: {
      icon: 'w-10 h-10',
      text: 'text-2xl',
      dot: 'w-3 h-3',
      iconText: 'text-[18px]',
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
      dot: 'w-4 h-4',
      iconText: 'text-xl',
    },
  };

  const classes = sizeClasses[size];

  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Знак: почти черный фон в светлой теме, белый фон в темной теме - уникальный элемент */}
        <div 
          className={`${classes.icon} rounded-xl flex items-center justify-center shadow-lg ring-1 ring-black/5 !bg-gray-900 text-white dark:!bg-white dark:!text-gray-900`}
        >
          <span className={`${classes.iconText} font-extrabold leading-none tracking-tight`}>iD</span>
        </div>
        {/* Зеленая точка */}
        <div 
          className={`absolute -bottom-1 -right-1 ${classes.dot} bg-success rounded-full border-2 border-background dark:border-text-primary shadow-sm z-10`}
        ></div>
      </div>
      {showText && (
        <span className={`${classes.text} font-bold ${themeClasses.text.primary}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {logoContent}
      </div>
    );
  }

  if (href.startsWith('http')) {
    return (
      <a href={href} className="inline-block">
        {logoContent}
      </a>
    );
  }

  return (
    <Link to={href} className="inline-block">
      {logoContent}
    </Link>
  );
};

