import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { validatePassword } from '../../utils/formValidation';

export interface DeleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (password: string) => Promise<void>;
}

/**
 * DeleteProfileModal - модальное окно для удаления профиля с двухэтапным подтверждением
 */
export const DeleteProfileModal: React.FC<DeleteProfileModalProps> = ({
  isOpen,
  onClose,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep1 = (): boolean => {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors({ password: passwordValidation.error || '' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmChecked) {
      setErrors({ confirm: 'Необходимо подтвердить удаление' });
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(password);
      handleClose();
    } catch (error: any) {
      setErrors({ submit: error.message || t('modals.deleteProfile.error', 'Ошибка при удалении профиля') });
      // Если ошибка пароля, возвращаемся на первый шаг
      if (error.message?.includes('пароль') || error.message?.includes('password')) {
        setStep(1);
        setErrors({ password: t('modals.deleteProfile.invalidPassword', 'Неверный пароль') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPassword('');
    setConfirmChecked(false);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modals.deleteProfile.title', 'Удалить профиль')}
      size="md"
    >
      {step === 1 ? (
        <div className="space-y-4">
          {/* Предупреждение */}
          <div className="p-4 rounded-lg bg-error/10 border border-error/20">
            <p className="font-semibold text-error mb-2">
              {t('modals.deleteProfile.warning', 'Внимание! Это действие необратимо.')}
            </p>
            <p className="text-sm text-text-secondary mb-3">
              {t('modals.deleteProfile.consequences', 'При удалении профиля будут удалены:')}
            </p>
            <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
              <li>{t('modals.deleteProfile.consequence1', 'Все ваши личные данные')}</li>
              <li>{t('modals.deleteProfile.consequence2', 'Документы и загруженные файлы')}</li>
              <li>{t('modals.deleteProfile.consequence3', 'История активности')}</li>
              <li>{t('modals.deleteProfile.consequence4', 'Настройки и предпочтения')}</li>
            </ul>
          </div>

          {/* Пароль */}
          <div>
            <Input
              type="password"
              label={t('modals.deleteProfile.password', 'Пароль')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('modals.deleteProfile.passwordPlaceholder', 'Введите пароль для подтверждения')}
              error={errors.password}
              fullWidth
              required
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              {t('modals.deleteProfile.cancel', 'Отмена')}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleStep1Next}
              disabled={!password}
              className="flex-1"
            >
              {t('common.next', 'Далее')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Финальное подтверждение */}
          <div className="p-4 rounded-lg bg-error/10 border border-error/20">
            <p className="text-sm text-text-secondary mb-4">
              {t('modals.deleteProfile.warning', 'Внимание! Это действие необратимо.')}
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">
                {t('modals.deleteProfile.confirm', 'Я понимаю последствия и хочу удалить профиль')}
              </span>
            </label>
            {errors.confirm && (
              <p className="text-sm text-error mt-2">{errors.confirm}</p>
            )}
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
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="flex-1"
            >
              Назад
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              {t('modals.deleteProfile.cancel', 'Отмена')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !confirmChecked}
              className="flex-1 bg-error hover:bg-error/90"
            >
              {isLoading ? t('modals.deleteProfile.deleting', 'Удаление...') : t('modals.deleteProfile.delete', 'Удалить профиль')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

