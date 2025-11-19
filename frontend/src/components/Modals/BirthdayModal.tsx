import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { validateBirthDate } from '../../utils/formValidation';

export type Gender = 'male' | 'female';

export interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { birthDate: string; gender?: Gender }) => Promise<void>;
}

/**
 * BirthdayModal - модальное окно для добавления дня рождения
 */
export const BirthdayModal: React.FC<BirthdayModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!birthDate) {
      newErrors.birthDate = t('modals.birthday.date', 'Дата рождения') + ' обязательна для заполнения';
    } else {
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
      await onSave({
        birthDate,
        gender: gender || undefined,
      });
      handleClose();
    } catch (error: any) {
      setErrors({ submit: error.message || t('modals.birthday.error', 'Ошибка при добавлении дня рождения') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setBirthDate('');
    setGender('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modals.birthday.title', 'Добавить день рождения')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Дата рождения */}
        <div>
          <Input
            type="date"
            label={t('modals.birthday.date', 'Дата рождения')}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            error={errors.birthDate}
            fullWidth
            required
          />
        </div>

        {/* Пол */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('modals.birthday.gender', 'Пол')}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender(gender === 'male' ? '' : 'male')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                gender === 'male'
                  ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                  : 'bg-gray-1 dark:bg-gray-2 border-border text-text-secondary hover:border-primary/30'
              }`}
            >
              {t('modals.birthday.genders.male', 'Мужской')}
            </button>
            <button
              type="button"
              onClick={() => setGender(gender === 'female' ? '' : 'female')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                gender === 'female'
                  ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                  : 'bg-gray-1 dark:bg-gray-2 border-border text-text-secondary hover:border-primary/30'
              }`}
            >
              {t('modals.birthday.genders.female', 'Женский')}
            </button>
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
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
            {t('modals.birthday.cancel', 'Отмена')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !birthDate}
            className="flex-1"
          >
            {isLoading ? t('modals.birthday.saving', 'Сохранение...') : t('modals.birthday.save', 'Сохранить')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

