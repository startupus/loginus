import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { personalApi } from '../../services/api/personal';
import { validateAddress } from '../../utils/formValidation';

export type AddressType = 'home' | 'work' | 'other';

export interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  addressType?: AddressType;
}

/**
 * AddAddressModal - модальное окно для добавления адреса
 */
export const AddAddressModal: React.FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  addressType,
}) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<AddressType>(addressType || 'home');
  const [country, setCountry] = useState('Россия');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const addressData = {
      country,
      region,
      city,
      street,
      house,
      apartment,
      postalCode,
    };

    const validation = validateAddress(addressData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await personalApi.addAddress({
        type: selectedType,
        country,
        region,
        city,
        street,
        house,
        apartment: apartment || undefined,
        postalCode: postalCode || undefined,
      });
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      setErrors({ submit: error.message || t('modals.address.error', 'Ошибка при добавлении адреса') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCountry('Россия');
    setRegion('');
    setCity('');
    setStreet('');
    setHouse('');
    setApartment('');
    setPostalCode('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modals.address.title', 'Добавить адрес')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Тип адреса */}
        {!addressType && (
          <div>
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              {t('modals.address.type', 'Тип адреса')}
            </label>
            <div className="flex gap-2">
              {(['home', 'work', 'other'] as AddressType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedType === type
                      ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                      : 'bg-gray-1 dark:bg-dark-3 border-stroke dark:border-dark-3 text-body-color dark:text-dark-6 hover:border-primary/30'
                  }`}
                >
                  {t(`modals.address.types.${type}`, type)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Страна */}
        <div>
          <Input
            label={t('modals.address.country', 'Страна')}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={t('modals.address.countryPlaceholder', 'Россия')}
            error={errors.country}
            fullWidth
            required
          />
        </div>

        {/* Регион */}
        <div>
          <Input
            label={t('modals.address.region', 'Регион/Область')}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder={t('modals.address.regionPlaceholder', 'Московская область')}
            fullWidth
          />
        </div>

        {/* Город */}
        <div>
          <Input
            label={t('modals.address.city', 'Город')}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('modals.address.cityPlaceholder', 'Москва')}
            error={errors.city}
            fullWidth
            required
          />
        </div>

        {/* Улица */}
        <div>
          <Input
            label={t('modals.address.street', 'Улица')}
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder={t('modals.address.streetPlaceholder', 'Ленинский проспект')}
            error={errors.street}
            fullWidth
            required
          />
        </div>

        {/* Дом и квартира в одной строке */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label={t('modals.address.house', 'Дом')}
              value={house}
              onChange={(e) => setHouse(e.target.value)}
              placeholder={t('modals.address.housePlaceholder', '1')}
              error={errors.house}
              fullWidth
              required
            />
          </div>
          <div>
            <Input
              label={t('modals.address.apartment', 'Квартира')}
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder={t('modals.address.apartmentPlaceholder', '10')}
              fullWidth
            />
          </div>
        </div>

        {/* Почтовый индекс */}
        <div>
          <Input
            label={t('modals.address.postalCode', 'Почтовый индекс')}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('modals.address.postalCodePlaceholder', '119991')}
            error={errors.postalCode}
            fullWidth
          />
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-error/10 dark:bg-error/20 border border-error/20 text-error text-sm">
            {errors.submit}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            {t('modals.address.cancel', 'Отмена')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? t('modals.address.saving', 'Сохранение...') : t('modals.address.save', 'Сохранить')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

