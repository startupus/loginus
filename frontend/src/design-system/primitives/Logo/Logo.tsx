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
  
  /**
   * Кастомный логотип (URL изображения) для клиентского брендинга
   */
  customLogo?: string;
  
  /**
   * Alt текст для кастомного логотипа
   */
  customLogoAlt?: string;
  
  /**
   * Вариант логотипа для темного фона (всегда светлый)
   * Используется в AdminSidebar, где фон всегда темный
   */
  variant?: 'auto' | 'light' | 'dark';
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
  customLogo,
  customLogoAlt,
  variant = 'auto',
}) => {
  const sizeClasses = {
    sm: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      dot: 'w-2.5 h-2.5',
      iconText: 'text-sm',
      image: 'h-8',
    },
    md: {
      icon: 'w-10 h-10',
      text: 'text-2xl',
      dot: 'w-3 h-3',
      iconText: 'text-[18px]',
      image: 'h-10',
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
      dot: 'w-4 h-4',
      iconText: 'text-xl',
      image: 'h-12',
    },
  };

  const classes = sizeClasses[size];

  // Если передан кастомный логотип, показываем его
  const logoContent = customLogo ? (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={customLogo} 
        alt={customLogoAlt || text || 'Logo'} 
        className={`${classes.image} object-contain`}
      />
      {showText && (
        <span className={`${classes.text} font-bold ${variant === 'light' ? 'text-white' : themeClasses.text.primary}`}>
          {text}
        </span>
      )}
    </div>
  ) : (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Знак: адаптируется под вариант */}
        {/* variant='light' - всегда светлый для темного фона (AdminSidebar) */}
        {/* variant='dark' - всегда темный для светлого фона */}
        {/* variant='auto' - автоматически по теме */}
        <div 
          className={`${classes.icon} rounded-xl flex items-center justify-center shadow-lg ring-1 ring-black/5 ${
            variant === 'light' 
              ? '!bg-gray-900 !text-white' 
              : variant === 'dark'
              ? '!bg-white !text-gray-900'
              : '!bg-gray-900 text-white dark:!bg-white dark:!text-gray-900'
          }`}
        >
          <span className={`${classes.iconText} font-extrabold leading-none tracking-tight ${
            variant === 'light' ? '!text-white' : ''
          }`}>iD</span>
        </div>
        {/* Зеленая точка - обводка адаптируется под вариант */}
        {/* Для variant='light' (темный фон) используем темную обводку */}
        {/* Для variant='dark' (светлый фон) используем светлую обводку */}
        <div 
          className={`absolute -bottom-1 -right-1 ${classes.dot} bg-success rounded-full border-2 ${
            variant === 'light'
              ? 'border-gray-900'
              : variant === 'dark'
              ? 'border-white'
              : 'border-white dark:border-dark-2'
          } shadow-sm z-10`}
        ></div>
      </div>
      {showText && (
        <span className={`${classes.text} font-bold ${
          variant === 'light' 
            ? '!text-white' 
            : variant === 'dark'
            ? '!text-gray-900'
            : themeClasses.text.primary
        }`}>
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

