import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { personalApi } from '../../services/api/personal';
import { validateRequired, validateBirthDate } from '../../utils/formValidation';

export type PetType = 'dog' | 'cat' | 'other';
export type PetGender = 'male' | 'female';

export interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * AddPetModal - модальное окно для добавления питомца
 */
export const AddPetModal: React.FC<AddPetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('dog');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<PetGender>('male');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateRequired(name, t('modals.pet.name', 'Имя'));
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || '';
    }

    if (birthDate) {
      const dateValidation = validateBirthDate(birthDate);
      if (!dateValidation.isValid) {
        newErrors.birthDate = dateValidation.error || '';
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
      formData.append('name', name);
      formData.append('type', type);
      if (breed) formData.append('breed', breed);
      if (birthDate) formData.append('birthDate', birthDate);
      formData.append('gender', gender);
      if (file) formData.append('photo', file);

      await personalApi.addPet(formData);
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      setErrors({ submit: error.message || t('modals.pet.error', 'Ошибка при добавлении питомца') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setType('dog');
    setBreed('');
    setBirthDate('');
    setGender('male');
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
      title={t('modals.pet.title', 'Добавить питомца')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Имя */}
        <div>
          <Input
            label={t('modals.pet.name', 'Имя')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('modals.pet.namePlaceholder', 'Барсик')}
            error={errors.name}
            fullWidth
            required
          />
        </div>

        {/* Тип */}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            {t('modals.pet.type', 'Тип')}
          </label>
          <div className="flex gap-2">
            {(['dog', 'cat', 'other'] as PetType[]).map((petType) => (
              <button
                key={petType}
                type="button"
                onClick={() => setType(petType)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  type === petType
                    ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                    : 'bg-gray-1 dark:bg-dark-3 border-stroke dark:border-dark-3 text-body-color dark:text-dark-6 hover:border-primary/30'
                }`}
              >
                {t(`modals.pet.types.${petType}`, petType)}
              </button>
            ))}
          </div>
        </div>

        {/* Порода */}
        <div>
          <Input
            label={t('modals.pet.breed', 'Порода')}
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder={t('modals.pet.breedPlaceholder', 'Персидская')}
            fullWidth
          />
        </div>

        {/* Дата рождения */}
        <div>
          <Input
            type="date"
            label={t('modals.pet.birthDate', 'Дата рождения')}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            error={errors.birthDate}
            fullWidth
          />
        </div>

        {/* Пол */}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            {t('modals.pet.gender', 'Пол')}
          </label>
          <div className="flex gap-2">
            {(['male', 'female'] as PetGender[]).map((petGender) => (
              <button
                key={petGender}
                type="button"
                onClick={() => setGender(petGender)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  gender === petGender
                    ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                    : 'bg-gray-1 dark:bg-dark-3 border-stroke dark:border-dark-3 text-body-color dark:text-dark-6 hover:border-primary/30'
                }`}
              >
                {t(`modals.pet.genders.${petGender}`, petGender)}
              </button>
            ))}
          </div>
        </div>

        {/* Загрузка фото */}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            {t('modals.pet.uploadPhoto', 'Загрузить фото питомца')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="pet-photo"
            />
            <label
              htmlFor="pet-photo"
              className="flex-1 px-4 py-2 rounded-lg border border-stroke dark:border-dark-3 bg-gray-1 dark:bg-dark-3 text-dark dark:text-white cursor-pointer hover:border-primary transition-colors text-center"
            >
              {file ? file.name : t('modals.pet.uploadButton', 'Выбрать файл')}
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
            {t('modals.pet.cancel', 'Отмена')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? t('modals.pet.saving', 'Сохранение...') : t('modals.pet.save', 'Сохранить')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

