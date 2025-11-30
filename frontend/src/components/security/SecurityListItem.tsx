import React from 'react';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface SecurityListItemProps {
  icon: string;
  title: string;
  description: string;
  status?: 'active' | 'inactive' | 'warning';
  onClick?: () => void;
}

/**
 * SecurityListItem - элемент списка для страниц безопасности
 */
export const SecurityListItem: React.FC<SecurityListItemProps> = ({
  icon,
  title,
  description,
  status = 'inactive',
  onClick,
}) => {
  const statusColor = {
    active: 'text-green-600 dark:text-green-400',
    inactive: 'text-gray-500 dark:text-gray-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div
      className={`p-4 rounded-lg border ${themeClasses.card.background} ${themeClasses.card.border} ${
        onClick ? 'cursor-pointer hover:border-blue-500 transition-colors' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`font-semibold ${themeClasses.text.primary}`}>{title}</h3>
              <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>{description}</p>
            </div>
            <span className={`text-sm font-medium ${statusColor[status]}`}>
              {status === 'active' ? '✓' : status === 'warning' ? '⚠' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

