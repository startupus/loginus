import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { getAddressLabel } from '../../utils/i18nMappings';

export interface AddressType {
  type: string;
  label: string;
  icon: string;
  added: boolean;
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
  
  const handleViewAll = () => {
    navigate(buildPathWithLang('/personal/addresses', currentLang));
  };
  
  return (
    <DataSection
      id="addresses"
      title={t('personalData.addresses.title', 'Адреса')}
      description={t('personalData.addresses.description', 'Для заказа в один клик и чтобы не вводить в Навигаторе')}
      action={
        <button
          onClick={handleViewAll}
          className="text-sm text-body-color dark:text-dark-6 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1"
        >
          <span>{t('personalData.addresses.viewAll', 'Все адреса')}</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {addresses.map((address, index) => (
          <button
            key={address.type}
            onClick={() => onAddAddress?.(address.type)}
            className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-gray-3 dark:hover:border-dark-4 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Иконка */}
            <div className="w-12 h-12 rounded-lg bg-gray-1 dark:bg-dark-3 flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-2 dark:group-hover:bg-dark-4">
              <Icon 
                name={address.icon} 
                size="md" 
                className="text-body-color dark:text-dark-6"
              />
            </div>
            
            {/* Название (локализуется по type) */}
            <span className="text-sm text-center text-body-color dark:text-dark-6 group-hover:text-dark dark:group-hover:text-white transition-colors duration-200">
              {getAddressLabel(address.type, t, address.label)}
            </span>
            
            {/* Статус */}
            {address.added && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </DataSection>
  );
};
