/**
 * LoginusIdLogo - единый компонент логотипа Loginus ID (знак "iD")
 * Используется в аватарах чатов, карусели продуктов и других местах
 * Соответствует принципам Atomic Design (Atom - базовый визуальный элемент)
 */

import React from 'react';

export interface LoginusIdLogoProps {
  /**
   * Размер логотипа
   */
  size?: 'sm' | 'md' | 'lg' | number;
  
  /**
   * Показать индикатор онлайн (зеленая точка)
   */
  showStatus?: boolean;
  
  /**
   * Статус онлайн (для индикатора)
   */
  status?: 'online' | 'offline';
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * LoginusIdLogo - компонент логотипа Loginus ID
 * Единый источник истины для отображения знака "iD"
 */
export const LoginusIdLogo: React.FC<LoginusIdLogoProps> = ({
  size = 'md',
  showStatus = false,
  status = 'offline',
  className = '',
}) => {
  // Определяем размеры в зависимости от типа size
  const sizeConfig = typeof size === 'number' 
    ? {
        iconSize: size,
        textSize: Math.max(10, Math.floor(size * 0.6)),
      }
    : {
        sm: { iconSize: 32, textSize: 14 },
        md: { iconSize: 40, textSize: 18 },
        lg: { iconSize: 48, textSize: 20 },
      }[size];

  const iconSize = typeof size === 'number' ? sizeConfig.iconSize : sizeConfig.iconSize;
  const textSize = typeof size === 'number' ? sizeConfig.textSize : sizeConfig.textSize;

  return (
    <div className={`relative ${className}`}>
      <div 
        className="rounded-xl flex items-center justify-center shadow-lg ring-1 ring-black/5 !bg-gray-900 text-white dark:!bg-white dark:!text-gray-900"
        style={{ width: iconSize, height: iconSize }}
      >
        <span 
          className="font-extrabold leading-none tracking-tight"
          style={{ fontSize: `${textSize}px` }}
        >
          iD
        </span>
      </div>
      {/* Индикатор онлайн - обводка адаптируется под тему: белая в светлой теме, темная в темной теме */}
      {/* Используем тот же подход, что и в Avatar: border-white dark:border-dark-2 */}
      {showStatus && status === 'online' && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white dark:border-dark-2 shadow-sm z-10"></div>
      )}
    </div>
  );
};

