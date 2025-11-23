import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface DataManagementItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: string;
  variant?: 'default' | 'danger';
}

export interface DataManagementSectionProps {
  items: DataManagementItem[];
}

/**
 * DataManagementSection - секция управления данными пользователя
 * Отображает настройки доступов, уведомлений и удаление профиля
 */
export const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  items,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();

  const handleItemClick = (item: DataManagementItem) => {
    if (item.href) {
      navigate(buildPathWithLang(item.href, currentLang));
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <DataSection
      id="data-management"
      title={t('data.dataManagement.title', 'Data Management')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const isClickable = !!(item.href || item.onClick);
          const isDanger = item.variant === 'danger';
          
          return (
            <button
              key={item.id}
              onClick={() => isClickable && handleItemClick(item)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors duration-200 ${themeClasses.border.default} ${
                isDanger
                  ? 'border-error/30 dark:border-error/30 bg-error/5 dark:bg-error/10 hover:bg-error/10 dark:hover:bg-error/20 hover:border-error/50 dark:hover:border-error/50'
                  : 'hover:bg-gray-1/50 dark:hover:bg-dark-3/50 hover:border-primary/30 dark:hover:border-primary/30'
              } ${
                isClickable ? 'cursor-pointer' : 'cursor-default opacity-60'
              }`}
            >
              {/* Иконка */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDanger
                  ? 'bg-error/20 dark:bg-error/20'
                  : 'bg-gray-1 dark:bg-dark-3'
              }`}>
                <Icon 
                  name={item.icon} 
                  size="sm" 
                  className={isDanger ? 'text-error' : 'text-text-secondary'} 
                />
              </div>
              
              {/* Информация */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${
                  isDanger ? 'text-error' : 'text-text-primary'
                }`}>
                  {item.label}
                </div>
              </div>
              
              {/* Стрелка для кликабельных элементов */}
              {isClickable && (
                <Icon 
                  name="chevron-right" 
                  size="sm" 
                  className={`flex-shrink-0 ${
                    isDanger ? '!text-error' : 'text-text-secondary'
                  }`} 
                />
              )}
            </button>
          );
        })}
      </div>
    </DataSection>
  );
};

