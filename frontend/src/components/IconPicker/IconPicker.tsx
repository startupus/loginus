import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives/Icon';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { Input } from '../../design-system/primitives/Input';

// Список доступных иконок (основные иконки для меню)
const AVAILABLE_ICONS = [
  'home',
  'user',
  'users',
  'settings',
  'shield',
  'lock',
  'key',
  'mail',
  'phone',
  'document',
  'folder',
  'credit-card',
  'wallet',
  'briefcase',
  'chart-bar',
  'grid',
  'menu',
  'help-circle',
  'bell',
  'star',
  'heart',
  'map-pin',
  'car',
  'medical',
  'cloud',
  'globe',
  'zap',
  'camera',
  'award',
  'book',
  'flag',
  'gift',
  'code',
  'palette',
  'plus',
  'edit',
  'trash',
  'upload',
  'link',
  'desktop',
  'smartphone',
  'database',
  'hard-drive',
  'server-off',
  'wrench',
  'arrow-right',
  'arrow-left',
  'chevron-right',
  'chevron-left',
  'chevron-down',
  'refresh-cw',
  'activity',
  'sun',
  'moon',
  'close',
  'check',
] as const;

export interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  label?: string;
}

/**
 * IconPicker - компонент для визуального выбора иконки
 * Показывает сетку доступных иконок для выбора
 */
export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, label }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Фильтрация иконок по поисковому запросу
  const filteredIcons = AVAILABLE_ICONS.filter((icon) =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsExpanded(false);
    setSearchQuery('');
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setSearchQuery('');
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className={themeClasses.spacing.spaceY2} ref={containerRef}>
      {label && (
        <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
          {label}
        </label>
      )}
      
      {/* Поле для отображения выбранной иконки и поиска */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${themeClasses.border.default} ${themeClasses.background.surface} ${themeClasses.text.primary} hover:border-primary transition-colors`}
        >
          {value ? (
            <>
              <Icon name={value as any} size="md" className={themeClasses.text.secondary} />
              <span className="flex-1 text-left">{value}</span>
            </>
          ) : (
            <span className={`flex-1 text-left ${themeClasses.text.secondary}`}>
              {t('common.selectIcon', 'Выберите иконку')}
            </span>
          )}
          <Icon 
            name="chevron-down" 
            size="sm" 
            className={`${themeClasses.text.secondary} transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Выпадающий список с иконками */}
        {isExpanded && (
          <div className={`absolute z-50 w-full mt-2 rounded-lg border ${themeClasses.border.default} ${themeClasses.background.surface} shadow-lg max-h-96 overflow-hidden flex flex-col`}>
            {/* Поиск */}
            <div className="p-3 border-b border-border">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchIcon', 'Поиск иконки...')}
                className="w-full"
              />
            </div>

            {/* Сетка иконок */}
            <div className="overflow-y-auto p-3">
              {filteredIcons.length === 0 ? (
                <div className={`text-center py-8 ${themeClasses.text.secondary}`}>
                  {t('common.noIconsFound', 'Иконки не найдены')}
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {filteredIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleIconSelect(iconName)}
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all ${
                        value === iconName
                          ? `${themeClasses.border.primary} ${themeClasses.background.primary} bg-primary/10`
                          : `${themeClasses.border.default} ${themeClasses.background.surface} hover:border-primary hover:bg-gray-1 dark:hover:bg-dark-3`
                      }`}
                      title={iconName}
                    >
                      <Icon 
                        name={iconName as any} 
                        size="md" 
                        className={value === iconName ? themeClasses.text.primary : themeClasses.text.secondary}
                      />
                      <span className={`text-xs truncate w-full text-center ${
                        value === iconName ? themeClasses.text.primary : themeClasses.text.secondary
                      }`}>
                        {iconName.length > 8 ? `${iconName.slice(0, 6)}...` : iconName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

