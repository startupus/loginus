import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../primitives/Icon';
import { themeClasses } from '../../utils/themeClasses';
import type { SidebarItem } from '../Sidebar/Sidebar';

export interface MobileBottomNavProps {
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
 * MobileBottomNav - нижняя навигация для мобильных устройств
 * Отображается только на мобильных устройствах (< xl breakpoint)
 * Стилизована как навигация в мобильных приложениях
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  onNavigate,
  className = '',
}) => {
  const location = useLocation();
  const navigateRouter = useNavigate();
  const { t } = useTranslation();
  const navigate = onNavigate || ((path: string) => {
    navigateRouter(path);
  });

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // Фильтруем только основные пункты меню (без children для упрощения)
  const filteredItems = items.filter(item => !item.children || item.children.length === 0);
  
  // Если пунктов больше 5, показываем первые 4 + "Еще"
  const hasMoreItems = filteredItems.length > 5;
  const mainItems = hasMoreItems 
    ? filteredItems.slice(0, 4)
    : filteredItems.slice(0, 5);
  
  // Остальные пункты для выпадающего меню
  const moreItems = hasMoreItems ? filteredItems.slice(4) : [];

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMoreMenuOpen &&
        moreMenuRef.current &&
        moreButtonRef.current &&
        !moreMenuRef.current.contains(event.target as Node) &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
    };

    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  const handleItemClick = (item: SidebarItem) => {
    // Обработка кастомных типов
    if (item.type === 'external' && item.externalUrl) {
      if (item.openInNewTab) {
        window.open(item.externalUrl, '_blank');
      } else {
        window.location.href = item.externalUrl;
      }
    } else if (item.path) {
      navigate(item.path);
      // Закрываем меню "Еще" после перехода
      setIsMoreMenuOpen(false);
    }
  };

  // Определяем активный пункт на основе текущего пути
  const isItemActive = (item: SidebarItem): boolean => {
    if (item.active !== undefined) {
      return item.active;
    }
    if (item.path) {
      return location.pathname === item.path || location.pathname.includes(item.path);
    }
    return false;
  };

  return (
    <>
      {/* Выпадающее меню "Еще" */}
      {isMoreMenuOpen && moreItems.length > 0 && (
        <div
          ref={moreMenuRef}
          className="xl:hidden fixed left-4 right-4 max-h-[60vh] overflow-y-auto rounded-lg shadow-lg border bg-surface-elevated dark:bg-dark-2"
          style={{
            zIndex: 100,
            bottom: `calc(4rem + env(safe-area-inset-bottom) + 0.5rem)`, // h-16 (64px) + safe-area + отступ
            // Защита от переопределения фона глобальными стилями
            backgroundColor: 'rgb(var(--color-surface-elevated))',
          }}
        >
          <div className="py-2">
            {moreItems.map((item, index) => {
              const isActive = isItemActive(item);
              
              return (
                <button
                  key={item.path || `more-${index}`}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : `${themeClasses.text.secondary} dark:text-dark-6 hover:bg-gray-1 dark:hover:bg-dark-3`
                  }`}
                  aria-label={item.label}
                >
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      size="md"
                      className={isActive ? 'text-primary' : ''}
                    />
                  )}
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {isActive && (
                    <Icon name="check" size="sm" className="text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Затемнение фона при открытом меню */}
      {isMoreMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 z-[90] bg-black/20"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}

      <nav
        className={`xl:hidden fixed bottom-0 left-0 right-0 z-50 ${themeClasses.background.surfaceElevated} border-t ${themeClasses.border.default} ${className}`}
        style={{
          // Добавляем безопасную зону для устройств с вырезом (notch)
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around h-16">
          {mainItems.map((item, index) => {
            const isActive = isItemActive(item);
            
            return (
              <button
                key={item.path || index}
                onClick={() => handleItemClick(item)}
                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? 'text-primary dark:text-primary' 
                    : `${themeClasses.text.secondary} dark:text-dark-6 hover:text-primary`
                }`}
                aria-label={item.label}
              >
                {item.icon && (
                  <Icon
                    name={item.icon}
                    size="md"
                    className={`mb-1 ${isActive ? 'text-primary' : ''}`}
                  />
                )}
                <span className="text-xs font-medium leading-tight text-center px-1">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
          
          {/* Кнопка "Еще" */}
          {hasMoreItems && (
            <button
              ref={moreButtonRef}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 active:scale-95 ${
                isMoreMenuOpen
                  ? 'text-primary dark:text-primary'
                  : `${themeClasses.text.secondary} dark:text-dark-6 hover:text-primary`
              }`}
              aria-label={t('sidebar.more', 'Еще')}
              aria-expanded={isMoreMenuOpen}
            >
              <Icon
                name="more-horizontal"
                size="md"
                className={`mb-1 ${isMoreMenuOpen ? 'text-primary' : ''}`}
              />
              <span className="text-xs font-medium leading-tight text-center px-1">
                {t('sidebar.more', 'Еще')}
              </span>
              {isMoreMenuOpen && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

