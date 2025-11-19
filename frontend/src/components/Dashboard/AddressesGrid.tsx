import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';

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
 * AddressesGrid - сетка типов адресов
 */
export const AddressesGrid: React.FC<AddressesGridProps> = ({
  addresses,
  onAddAddress,
}) => {
  const { t } = useTranslation();
  
  return (
    <DataSection
      id="addresses"
      title={t('personalData.addresses.title', 'Адреса')}
      description={t('personalData.addresses.description', 'Для заказа в один клик и чтобы не вводить в Навигаторе')}
      viewAllLink="/personal/addresses"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {addresses.map((address, index) => (
          <Button
            key={address.type}
            variant="outline"
            className="group flex flex-col items-center gap-2 h-auto py-4 transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary"
            onClick={() => onAddAddress?.(address.type)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Icon name={address.icon} size="lg" className="text-primary dark:text-white transition-all duration-200 group-hover:scale-110 group-hover:text-white dark:group-hover:text-white" />
            <span className="text-sm text-primary dark:text-white transition-colors duration-200 group-hover:text-white dark:group-hover:text-white">
              {address.added ? address.label : t('personalData.addresses.addAddress', 'Добавить') + ' ' + address.label}
            </span>
          </Button>
        ))}
      </div>
    </DataSection>
  );
};

