import React, { useState, useEffect, useMemo } from 'react';
import { getAvatarGradient } from '@/utils/stringUtils';

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
   * Используется для отображения текста внутри аватара
   */
  initials?: string;
  
  /**
   * Имя пользователя для генерации градиентного фона
   * Если не указан bgColor, будет использован градиент на основе имени
   */
  name?: string;
  
  /**
   * Размер аватара
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /**
   * Цвет фона (для инициалов) - использует классы из дизайн-системы
   * Если не указан, будет использован градиент на основе name
   */
  bgColor?: string;
  
  /**
   * Форма
   */
  rounded?: boolean;
  
  /**
   * Показать границу
   */
  border?: boolean;
  
  /**
   * Показать индикатор статуса (онлайн/активен)
   */
  showStatus?: boolean;
  
  /**
   * Статус пользователя
   */
  status?: 'online' | 'offline' | 'away';
  
  /**
   * Дополнительные классы
   */
  className?: string;
  
}

/**
 * Avatar - компонент аватара из дизайн-системы
 * Поддерживает изображения, инициалы и fallback иконку
 * 
 * ВАЖНО: Компонент НЕ принимает children. Используйте только props.
 * 
 * @example
 * <Avatar src="/avatar.jpg" size="lg" rounded />
 * <Avatar initials="ДЛ" size="lg" rounded showStatus status="online" />
 * <Avatar size="md" rounded /> // Покажет fallback иконку
 */
export const Avatar: React.FC<AvatarProps & { children?: never }> = ({
  src,
  alt = '',
  initials,
  name,
  size = 'md',
  bgColor,
  rounded = false,
  border = false,
  showStatus = false,
  status = 'online',
  className = '',
}) => {
  // Состояние для отслеживания ошибки загрузки изображения
  const [imageError, setImageError] = useState(false);

  // Сбрасываем ошибку при изменении src
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  // Размеры индикатора статуса в зависимости от размера аватара
  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  // Позиционирование индикатора
  const statusPositions = {
    xs: '-bottom-0.5 -right-0.5',
    sm: '-bottom-0.5 -right-0.5',
    md: '-bottom-0.5 -right-0.5',
    lg: '-bottom-0.5 -right-0.5',
    xl: '-bottom-1 -right-1',
    '2xl': '-bottom-1 -right-1',
  };

  const shapeStyles = rounded ? 'rounded-full' : 'rounded-lg';
  
  // Генерируем градиентный фон на основе имени пользователя
  const gradientStyle = useMemo(() => {
    // Если указан bgColor, не используем градиент
    if (bgColor) return undefined;
    
    // Используем name для генерации градиента, если он указан
    // Иначе используем initials как fallback
    const sourceForGradient = name || initials || '';
    if (sourceForGradient) {
      return getAvatarGradient(sourceForGradient);
    }
    
    return undefined;
  }, [name, initials, bgColor]);
  
  // Цвет фона по умолчанию из дизайн-системы (используется только если нет градиента)
  const defaultBgColor = 'bg-primary text-white';
  const finalBgColor = bgColor || (gradientStyle ? '' : defaultBgColor);
  
  // Стили границы
  const borderStyles = border 
    ? 'ring-2 ring-white dark:ring-dark-2' 
    : '';
  
  const baseStyles = `inline-flex items-center justify-center overflow-hidden ${shapeStyles} ${sizeStyles[size]} ${borderStyles}`;

  // Цвет индикатора статуса
  const statusColors = {
    online: 'bg-success',
    offline: 'bg-gray-3 dark:bg-dark-6',
    away: 'bg-warning',
  };

  const statusBorder = 'border-2 border-white dark:border-dark-2';

  // Обертка для аватара с индикатором
  const AvatarContent = () => {
    // Проверяем, что src не пустой, не null и изображение загрузилось успешно
    if (src && src.trim() !== '' && !imageError) {
      return (
        <img
          src={src}
          alt={alt}
          className={`${baseStyles} object-cover ${className}`.trim()}
          onError={() => {
            // Если изображение не загрузилось, устанавливаем флаг ошибки
            setImageError(true);
          }}
        />
      );
    }

    // Если есть валидные инициалы, показываем их
    if (initials && initials.trim() !== '') {
      return (
        <div
          className={`${baseStyles} ${finalBgColor} font-semibold text-white ${className}`.trim()}
          style={gradientStyle}
        >
          {initials}
        </div>
      );
    }

    // Fallback иконка профиля - показывается всегда, когда нет src и нет initials
    return (
      <div
        className={`${baseStyles} bg-gray-2 dark:bg-dark-3 text-body-color dark:text-dark-6 ${className}`.trim()}
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

  // Если нужно показать статус, оборачиваем в контейнер
  if (showStatus) {
    return (
      <span className="relative inline-block">
        <AvatarContent />
        <span 
          className={`absolute ${statusPositions[size]} ${statusSizes[size]} ${statusColors[status]} ${statusBorder} rounded-full z-10`}
          aria-label={`Статус: ${status === 'online' ? 'онлайн' : status === 'offline' ? 'офлайн' : 'отошёл'}`}
        />
      </span>
    );
  }

  return <AvatarContent />;
};

