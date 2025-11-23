import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface PublicDataItem {
  id: string;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  icon: string;
}

export interface PublicDataSectionProps {
  items: PublicDataItem[];
}

/**
 * PublicDataSection - секция публичных данных пользователя
 * Отображает публичный профиль, отзывы и публичные адреса
 */
export const PublicDataSection: React.FC<PublicDataSectionProps> = ({
  items,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();

  const handleItemClick = (item: PublicDataItem) => {
    if (item.href) {
      if (item.href.startsWith('http://') || item.href.startsWith('https://')) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        navigate(buildPathWithLang(item.href, currentLang));
      }
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <DataSection
      id="public-data"
      title={t('data.publicData.title', 'Public Data')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const isClickable = !!(item.href || item.onClick);
          
          return (
            <button
              key={item.id}
              onClick={() => isClickable && handleItemClick(item)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors duration-200 ${themeClasses.border.default} ${
                isClickable
                  ? 'hover:bg-gray-1/50 dark:hover:bg-dark-3/50 hover:border-primary/30 dark:hover:border-primary/30 cursor-pointer'
                  : 'cursor-default opacity-60'
              }`}
            >
              {/* Иконка */}
              <div className="w-10 h-10 rounded-lg bg-gray-1 dark:bg-dark-3 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size="sm" className="text-text-secondary" />
              </div>
              
              {/* Информация */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-xs text-text-secondary mt-1">
                    {item.description}
                  </div>
                )}
              </div>
              
              {/* Стрелка для кликабельных элементов */}
              {isClickable && (
                <Icon name="chevron-right" size="sm" className="text-text-secondary flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </DataSection>
  );
};

