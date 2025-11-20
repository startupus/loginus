import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon, ScrollButton } from '../../design-system/primitives';
import { DataSection, AddButton } from '../../design-system/composites';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { getAddressLabel } from '../../utils/i18nMappings';

export interface AddressType {
  type: string;
  label: string;
  icon: string;
  added: boolean;
  address?: string;
}

export interface AddressesGridProps {
  addresses: AddressType[];
  onAddAddress?: (type: string) => void;
}

/**
 * AddressesGrid - минималистичная сетка типов адресов
 * Спокойный дизайн без ярких цветов и агрессивных эффектов
 */
export const AddressesGrid: React.FC<AddressesGridProps> = ({
  addresses,
  onAddAddress,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const handleViewAll = () => {
    navigate(buildPathWithLang('/personal/addresses', currentLang));
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  React.useEffect(() => {
    handleScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [addresses]);
  
  return (
    <DataSection
      id="addresses"
      title={t('personalData.addresses.title', 'Адреса')}
      description={t('personalData.addresses.description', 'Для заказа в один клик и чтобы не вводить в Навигаторе')}
      action={
        <button
          onClick={handleViewAll}
          className="text-sm text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1"
        >
          <span>{t('personalData.addresses.viewAll', 'Все адреса')}</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      }
    >
      <div className="relative">
        {/* Кнопка прокрутки влево */}
        {canScrollLeft && (
          <ScrollButton
            direction="left"
            ariaLabel={t('common.scrollLeft', 'Прокрутить влево')}
            onClick={() => scroll('left')}
            variant="accent"
          />
        )}

        {/* Карусель адресов */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onScroll={handleScroll}
        >
          {addresses.map((addressItem, index) => (
            <button
              key={addressItem.type}
              onClick={() => onAddAddress?.(addressItem.type)}
              className="group flex-shrink-0 flex flex-col items-center justify-center gap-3 p-4 rounded-lg bg-gray-1/50 dark:bg-gray-2/50 border border-border dark:border-dark-3/50 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-gray-1 dark:hover:bg-gray-2 transition-all duration-200 animate-fade-in relative w-[140px] h-[140px]"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Иконка */}
              <div className="w-12 h-12 rounded-lg bg-gray-1 dark:bg-gray-2 flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-2 dark:group-hover:bg-gray-3 flex-shrink-0">
                <Icon 
                  name={addressItem.icon} 
                  size="md" 
                  className="text-text-secondary"
                />
              </div>
              
              {/* Название и адрес */}
              <div className="flex flex-col items-center gap-1 w-full min-w-0 flex-1 justify-center">
                <span className="text-xs font-medium text-center text-text-primary group-hover:text-primary transition-colors duration-200">
                  {getAddressLabel(addressItem.type, t, addressItem.label || addressItem.type)}
                </span>
                {addressItem.added && addressItem.address && (
                  <span className="text-[10px] text-center text-text-secondary line-clamp-2 break-words w-full leading-tight">
                    {addressItem.address}
                  </span>
                )}
              </div>
              
              {/* Статус */}
              {addressItem.added && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                </div>
              )}
            </button>
          ))}
          
          {/* Кнопка добавить адрес */}
          {onAddAddress && (
            <div className="flex-shrink-0">
              <AddButton
                label={t('personalData.addresses.addAddress', 'Добавить адрес')}
                onClick={() => onAddAddress('other')}
                variant="vertical"
                size="md"
                borderStyle="solid"
                background="default"
                className="w-[140px] h-[140px] min-h-0"
              />
            </div>
          )}
        </div>

        {/* Кнопка прокрутки вправо */}
        {canScrollRight && (
          <ScrollButton
            direction="right"
            ariaLabel={t('common.scrollRight', 'Прокрутить вправо')}
            onClick={() => scroll('right')}
            variant="accent"
          />
        )}
      </div>
    </DataSection>
  );
};
