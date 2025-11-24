/**
 * ProductCarousel - компонент карусели продуктов для выбора темы чата
 * Аналогично Telegram - горизонтальная прокрутка с папками продуктов
 */

import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getServiceIcon } from '@/utils/serviceIcons';
import { LoginusIdLogo } from '../../primitives/LoginusIdLogo';
import { themeClasses } from '../../utils/themeClasses';

export interface ProductFolder {
  /**
   * ID папки
   */
  id: string;
  
  /**
   * Название папки
   */
  name: string;
  
  /**
   * Иконка папки
   */
  icon?: string;
  
  /**
   * Количество непрочитанных (опционально)
   */
  unreadCount?: number;
}

export interface ProductCarouselProps {
  /**
   * Массив папок продуктов
   */
  folders: ProductFolder[];
  
  /**
   * Активная папка
   */
  activeFolderId?: string;
  
  /**
   * Обработчик выбора папки
   */
  onFolderSelect?: (folderId: string) => void;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * ProductCarousel - карусель продуктов для выбора темы чата
 */
export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  folders,
  activeFolderId,
  onFolderSelect,
  className = '',
}) => {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Проверка возможности прокрутки
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      window.addEventListener('resize', checkScrollability);
      return () => {
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [folders]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Добавляем папку "Все" в начало
  const allFolders: ProductFolder[] = [
    {
      id: 'all',
      name: t('support.carousel.all', 'Все'),
      icon: 'folder',
    },
    ...folders,
  ];

  return (
    <div className={`relative p-2 sm:p-4 ${className}`}>
      {/* Стрелка влево */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full ${themeClasses.background.surfaceElevated} shadow-lg ${themeClasses.border.default} ${themeClasses.utility.flexItemsCenter} ${themeClasses.background.hoverGray} ${themeClasses.utility.transitionAll}`}
          aria-label={t('support.carousel.scrollLeft', 'Прокрутить влево')}
        >
          <FiChevronLeft size={16} />
        </button>
      )}

      {/* Контейнер с прокруткой */}
      <div
        ref={scrollContainerRef}
        className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide px-6 sm:px-8 py-2 sm:py-3"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onScroll={checkScrollability}
      >
        {allFolders.map((folder) => {
          const isActive = activeFolderId === folder.id;
          const isLoginusId = folder.id === 'id' || folder.name === 'Loginus ID';
          const FolderIconComponent = getServiceIcon('folder');
          
          return (
            <button
              key={folder.id}
              onClick={() => onFolderSelect?.(folder.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg'
                  : `${themeClasses.background.surfaceElevated} ${themeClasses.background.hoverGray} ${themeClasses.border.default}`
              }`}
            >
              {/* Иконка папки или аватар сервиса */}
              <div className="relative flex-shrink-0">
                {isLoginusId ? (
                  <LoginusIdLogo size={20} />
                ) : (
                  <div className={`w-5 h-5 flex items-center justify-center ${
                    isActive ? 'text-white' : themeClasses.text.secondary
                  }`}>
                    <FolderIconComponent size={20} />
                  </div>
                )}
                {folder.unreadCount && folder.unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full ${
                    isActive 
                      ? 'bg-white text-primary' 
                      : 'bg-primary text-white'
                  }`}>
                    {folder.unreadCount}
                  </span>
                )}
              </div>
              
              {/* Название папки */}
              <span className={`text-sm font-medium whitespace-nowrap ${
                isActive ? 'text-white' : themeClasses.text.primary
              }`}>
                {folder.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Стрелка вправо */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full ${themeClasses.background.surfaceElevated} shadow-lg ${themeClasses.border.default} ${themeClasses.utility.flexItemsCenter} ${themeClasses.background.hoverGray} ${themeClasses.utility.transitionAll}`}
          aria-label={t('support.carousel.scrollRight', 'Прокрутить вправо')}
        >
          <FiChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

