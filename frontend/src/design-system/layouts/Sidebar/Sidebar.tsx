import React from 'react';
import { Icon } from '../../primitives/Icon';

export interface SidebarItem {
  label: string;
  path: string;
  icon?: string;
  active?: boolean;
}

export interface SidebarProps {
  /**
   * Пункты меню
   */
  items: SidebarItem[];
  
  /**
   * Callback клика на пункт
   */
  onNavigate?: (path: string) => void;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * Sidebar - боковое меню в стилях дизайн-системы
 * Адаптивный дизайн для мобильных и десктопных устройств
 */
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  onNavigate,
  className = '',
}) => {
  return (
    <aside
      className={`hidden lg:block w-64 bg-white dark:bg-dark-2 border-r border-gray-2 dark:border-dark-3 min-h-[calc(100vh-64px)] sticky top-16 ${className}`}
    >
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate?.(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
              ${
                item.active
                  ? 'bg-primary/10 text-primary dark:text-primary-400 font-medium'
                  : 'text-body-color dark:text-dark-6 hover:bg-gray-1 dark:hover:bg-dark-3 hover:text-dark dark:hover:text-white'
              }
            `}
          >
            {item.icon && (
              <Icon 
                name={item.icon} 
                size="sm" 
                className={item.active ? 'text-primary' : ''}
              />
            )}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
