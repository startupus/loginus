import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { personalApi } from '../../services/api/personal';
import {
  validateLicensePlate,
  validateVehicleYear,
  validateRequired,
} from '../../utils/formValidation';

export interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * AddVehicleModal - модальное окно для добавления автомобиля
 */
export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [sts, setSts] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const brandValidation = validateRequired(brand, t('modals.vehicle.brand', 'Марка'));
    if (!brandValidation.isValid) {
      newErrors.brand = brandValidation.error || '';
    }

    const modelValidation = validateRequired(model, t('modals.vehicle.model', 'Модель'));
    if (!modelValidation.isValid) {
      newErrors.model = modelValidation.error || '';
    }

    const plateValidation = validateLicensePlate(licensePlate);
    if (!plateValidation.isValid) {
      newErrors.licensePlate = plateValidation.error || '';
    }

    if (year) {
      const yearValidation = validateVehicleYear(year);
      if (!yearValidation.isValid) {
        newErrors.year = yearValidation.error || '';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('brand', brand);
      formData.append('model', model);
      formData.append('licensePlate', licensePlate);
      if (year) formData.append('year', year);
      if (color) formData.append('color', color);
      if (sts) formData.append('sts', sts);
      if (file) formData.append('photo', file);

      await personalApi.addVehicle(formData);
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      setErrors({ submit: error.message || t('modals.vehicle.error', 'Ошибка при добавлении автомобиля') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setBrand('');
    setModel('');
    setLicensePlate('');
    setYear('');
    setColor('');
    setSts('');
    setFile(null);
    setErrors({});
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modals.vehicle.title', 'Добавить автомобиль')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Марка */}
        <div>
          <Input
            label={t('modals.vehicle.brand', 'Марка')}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder={t('modals.vehicle.brandPlaceholder', 'Toyota')}
            error={errors.brand}
            fullWidth
            required
          />
        </div>

        {/* Модель */}
        <div>
          <Input
            label={t('modals.vehicle.model', 'Модель')}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={t('modals.vehicle.modelPlaceholder', 'Camry')}
            error={errors.model}
            fullWidth
            required
          />
        </div>

        {/* Гос. номер */}
        <div>
          <Input
            label={t('modals.vehicle.licensePlate', 'Гос. номер')}
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            placeholder={t('modals.vehicle.licensePlatePlaceholder', 'А123БВ77')}
            error={errors.licensePlate}
            fullWidth
            required
          />
        </div>

        {/* Год выпуска */}
        <div>
          <Input
            type="number"
            label={t('modals.vehicle.year', 'Год выпуска')}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={t('modals.vehicle.yearPlaceholder', '2020')}
            error={errors.year}
            fullWidth
          />
        </div>

        {/* Цвет */}
        <div>
          <Input
            label={t('modals.vehicle.color', 'Цвет')}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder={t('modals.vehicle.colorPlaceholder', 'Черный')}
            fullWidth
          />
        </div>

        {/* СТС */}
        <div>
          <Input
            label={t('modals.vehicle.sts', 'СТС')}
            value={sts}
            onChange={(e) => setSts(e.target.value)}
            placeholder={t('modals.vehicle.stsPlaceholder', 'Ссылка на документ')}
            fullWidth
          />
        </div>

        {/* Загрузка фото */}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            {t('modals.vehicle.uploadPhoto', 'Загрузить фото автомобиля')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="vehicle-photo"
            />
            <label
              htmlFor="vehicle-photo"
              className="flex-1 px-4 py-2 rounded-lg border border-stroke dark:border-dark-3 bg-gray-1 dark:bg-dark-3 text-dark dark:text-white cursor-pointer hover:border-primary transition-colors text-center"
            >
              {file ? file.name : t('modals.vehicle.uploadButton', 'Выбрать файл')}
            </label>
          </div>
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
            {t('modals.vehicle.cancel', 'Отмена')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? t('modals.vehicle.saving', 'Сохранение...') : t('modals.vehicle.save', 'Сохранить')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

