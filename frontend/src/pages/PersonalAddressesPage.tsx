import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { Button, Icon } from '../design-system/primitives';
import { DataSection } from '../design-system/composites/DataSection';
import { personalApi } from '../services/api/personal';

/**
 * PersonalAddressesPage - страница управления адресами
 */
const PersonalAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['personal-addresses'],
    queryFn: () => personalApi.getAddresses(),
  });

  if (isLoading) {
    return (
      <PageTemplate title={t('personalData.addresses.title', 'Адреса')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-body-color dark:text-dark-6">{t('common.loading', 'Загрузка...')}</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  const addresses = data?.data?.addresses || [];

  return (
    <PageTemplate title={t('personalData.addresses.title', 'Адреса')} showSidebar={true}>
      <div className="space-y-6">
        <DataSection
          id="addresses"
          title={t('personalData.addresses.title', 'Адреса')}
          description={t('personalData.addresses.description', 'Для заказа в один клик и чтобы не вводить в Навигаторе')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((address: any) => (
              <div
                key={address.type}
                className="p-6 rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-4">
                  <Icon name={address.icon || 'map-pin'} size="xl" className="text-primary" />
                  <div className="text-center">
                    <h3 className="font-semibold text-dark dark:text-white mb-1">
                      {address.label || address.type}
                    </h3>
                    {address.added ? (
                      <p className="text-sm text-body-color dark:text-dark-6">
                        {address.address || t('common.edit', 'Редактировать')}
                      </p>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-2"
                      >
                        {t('personalData.addresses.addAddress', 'Добавить адрес')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DataSection>
      </div>
    </PageTemplate>
  );
};

export default PersonalAddressesPage;

