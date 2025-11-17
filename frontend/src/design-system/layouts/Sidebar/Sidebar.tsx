import React from 'react';

export interface SidebarItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
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

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  onNavigate,
  className = '',
}) => {
  return (
    <aside
      className={`w-64 bg-white dark:bg-dark-2 border-r border-secondary-200 dark:border-dark-3 min-h-[calc(100vh-64px)] ${className}`}
    >
      <nav className="p-4 space-y-1">
        {items.map(item => (
          <button
            key={item.path}
            onClick={() => onNavigate?.(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
              ${
                item.active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                  : 'text-secondary-600 dark:text-dark-6 hover:bg-secondary-50 dark:hover:bg-dark-3 hover:text-secondary-900 dark:hover:text-white'
              }
            `}
          >
            {item.icon && <span className="inline-flex">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

