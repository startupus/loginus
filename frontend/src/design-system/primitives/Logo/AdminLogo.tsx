import React from 'react';
import { Link } from 'react-router-dom';
import { themeClasses } from '../../utils/themeClasses';

export interface AdminLogoProps {
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
}

/**
 * AdminLogo - компонент логотипа для админ-панели
 * Всегда использует светлый вариант для темного фона сайдбара
 * Независимо от темы приложения
 */
export const AdminLogo: React.FC<AdminLogoProps> = ({
  size = 'md',
  showText = true,
  text = 'Loginus',
  href = '/',
  onClick,
  className = '',
  customLogo,
  customLogoAlt,
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
        <span className={`${classes.text} font-bold text-white`}>
          {text}
        </span>
      )}
    </div>
  ) : (
     <div className={`flex items-center gap-3 ${className}`}>
       <div className="relative">
         {/* Знак: белый фон с темным текстом для темного фона админ-сайдбара */}
         <div 
           className={`${classes.icon} rounded-xl flex items-center justify-center shadow-lg ring-1 ring-black/5 !bg-white !text-gray-900`}
         >
           <span className={`${classes.iconText} font-extrabold leading-none tracking-tight !text-gray-900`}>iD</span>
         </div>
         {/* Зеленая точка - обводка цвета фона сайдбара (slate-900) */}
         <div 
           className={`absolute -bottom-1 -right-1 ${classes.dot} bg-success rounded-full border-2 border-slate-900 shadow-sm z-10`}
         ></div>
       </div>
       {showText && (
         <span className={`${classes.text} font-bold !text-white`}>
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

