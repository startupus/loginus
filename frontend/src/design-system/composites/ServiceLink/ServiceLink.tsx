import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../primitives/Icon';
import { Badge } from '../../primitives/Badge';
import { useTheme } from '../../contexts/ThemeContext';

export interface ServiceLinkProps {
  /**
   * Иконка сервиса
   */
  icon: string;
  
  /**
   * Название сервиса
   */
  name: string;
  
  /**
   * Статус/описание
   */
  status?: React.ReactNode;
  
  /**
   * Дополнительная информация
   */
  extra?: React.ReactNode;
  
  /**
   * Badge с количеством
   */
  badge?: number;
  
  /**
   * Ссылка
   */
  href: string;
  
  /**
   * Callback при клике
   */
  onClick?: () => void;
}

/**
 * ServiceLink - ссылка на сервис с иконкой и описанием
 */
export const ServiceLink: React.FC<ServiceLinkProps> = ({
  icon,
  name,
  status,
  extra,
  badge,
  href,
  onClick,
}) => {
  const { isDark } = useTheme();
  const content = (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-2 transition-colors cursor-pointer">
      <Icon name={icon} size="lg" className="text-primary flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-medium ${isDark ? 'text-white' : 'text-text-primary'}`}>{name}</span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="primary" size="sm">{badge}</Badge>
          )}
        </div>
        
        {status && (
          <div className="text-sm text-text-secondary">
            {status}
          </div>
        )}
        
        {extra && (
          <div className="text-xs text-text-secondary mt-1">
            {extra}
          </div>
        )}
      </div>
      
      <Icon name="chevron-right" size="sm" className="text-text-secondary flex-shrink-0" />
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link to={href} className="block w-full">
      {content}
    </Link>
  );
};

