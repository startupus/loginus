import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Фильтрация иконок по поисковому запросу
  const filteredIcons = AVAILABLE_ICONS.filter((icon) =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsExpanded(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const dropdownHeight = 384; // Примерная высота выпадающего списка
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // Если места внизу недостаточно, но есть место сверху - разворачиваем вверх
        const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        
        let top: number;
        let maxHeight: number;
        
        if (shouldOpenUpward) {
          // Разворачиваем вверх
          maxHeight = Math.min(dropdownHeight, spaceAbove - 16);
          top = rect.top - maxHeight - 8;
        } else {
          // Разворачиваем вниз (как раньше)
          maxHeight = Math.min(dropdownHeight, spaceBelow - 16);
          top = rect.bottom + 8;
        }

        setDropdownStyle({
          position: 'fixed',
          top: Math.max(8, top), // Минимум 8px от верха экрана
          left: rect.left,
          width: rect.width,
          maxHeight: maxHeight > 0 ? maxHeight : dropdownHeight,
        });
      }
      return next;
    });
  };

  // Закрытие по клику вне сейчас не используем, чтобы не ломать выбор через портал

  return (
    <div className={`${themeClasses.spacing.spaceY2} relative`} ref={containerRef}>
      {label && (
        <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
          {label}
        </label>
      )}
      
      {/* Поле для отображения выбранной иконки и поиска */}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
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

        {/* Выпадающий список с иконками (через портал в body, чтобы не резался overflow модалки) */}
        {isExpanded && typeof document !== 'undefined' &&
          createPortal(
          <div
            className={`z-[120000] rounded-lg border ${themeClasses.border.default} ${themeClasses.background.surface} shadow-lg overflow-hidden flex flex-col`}
            style={dropdownStyle}
          >
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
                <div className="grid grid-cols-8 gap-2">
                  {filteredIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleIconSelect(iconName)}
                      className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
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
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
      </div>
    </div>
  );
};

