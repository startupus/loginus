import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../primitives/Icon';
import { Badge } from '../../primitives/Badge';
import { themeClasses } from '../../utils/themeClasses';

export interface SecurityListItemProps {
  /**
   * Иконка элемента
   */
  icon: string;
  
  /**
   * Заголовок элемента
   */
  title: string;
  
  /**
   * Описание/подзаголовок элемента
   */
  description?: string;
  
  /**
   * Badge с количеством (например, количество устройств)
   */
  badge?: number;
  
  /**
   * Ссылка для навигации
   */
  href?: string;
  
  /**
   * Callback при клике (если не указан href)
   */
  onClick?: () => void;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * SecurityListItem - универсальный компонент для элементов списка безопасности
 * Использует themeClasses для единообразного стиля
 * Поддерживает темную и светлую тему через дизайн-систему
 */
export const SecurityListItem: React.FC<SecurityListItemProps> = ({
  icon,
  title,
  description,
  badge,
  href,
  onClick,
  className = '',
}) => {
  const content = (
    <div className={`flex items-center justify-between py-2 group ${className}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Иконка в контейнере */}
        <div className={themeClasses.iconContainer.gray}>
          <Icon name={icon} size="md" className={themeClasses.text.secondary} />
        </div>
        
        {/* Текстовая информация */}
        <div className="flex-1 min-w-0">
          {description ? (
            <>
              <div className={`text-sm mb-1 ${themeClasses.text.secondary}`}>
                {description}
              </div>
              <div className={`font-medium group-hover:text-primary transition-colors ${themeClasses.text.primary}`}>
                {title}
              </div>
            </>
          ) : (
            <div className={`font-medium group-hover:text-primary transition-colors ${themeClasses.text.primary}`}>
              {title}
            </div>
          )}
        </div>
      </div>
      
      {/* Badge и стрелка */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge !== undefined && (
          <Badge variant="primary" size="sm">{badge}</Badge>
        )}
        <Icon 
          name="chevron-right" 
          size="sm" 
          className={`group-hover:text-primary transition-colors ${themeClasses.text.secondary}`} 
        />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <Link to={href} className="block w-full">
        {content}
      </Link>
    );
  }

  return <div className="w-full">{content}</div>;
};

