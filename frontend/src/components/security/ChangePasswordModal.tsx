import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '../../design-system/composites/Modal';
import { Button } from '../../design-system/primitives/Button';
import { Input } from '../../design-system/primitives/Input';
import { securityApi } from '../../services/api/security';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * ChangePasswordModal - модальное окно для изменения пароля
 */
export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await securityApi.changePassword(data);
      console.log('🔍 [ChangePasswordModal] Response:', response);
      return response.data || response;
    },
    onSuccess: (data) => {
      console.log('✅ [ChangePasswordModal] Password changed successfully:', data);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setCurrentPasswordError(null);
      setNewPasswordError(null);
      setConfirmPasswordError(null);
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      let errorMessage = t('security.password.errors.genericError', 'Не удалось изменить пароль');
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        // Определяем, к какому полю относится ошибка
        const message = err.response.data.message.toLowerCase();
        if (message.includes('old password') || message.includes('текущий пароль') || message.includes('current password')) {
          setCurrentPasswordError(errorMessage);
        } else if (message.includes('new password') || message.includes('новый пароль')) {
          setNewPasswordError(errorMessage);
        } else {
          setError(errorMessage);
        }
      } else if (err.message) {
        errorMessage = err.message;
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    },
  });

  const handleSubmit = () => {
    setError(null);
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    // Валидация
    if (!currentPassword) {
      setCurrentPasswordError(t('security.password.errors.currentPasswordRequired', 'Введите текущий пароль'));
      return;
    }

    if (!newPassword) {
      setNewPasswordError(t('security.password.errors.newPasswordRequired', 'Введите новый пароль'));
      return;
    }

    if (newPassword.length < 6) {
      setNewPasswordError(t('security.password.errors.passwordTooShort', 'Пароль должен содержать минимум 6 символов'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('security.password.errors.passwordMismatch', 'Пароли не совпадают'));
      return;
    }

    if (currentPassword === newPassword) {
      setNewPasswordError(t('security.password.errors.samePassword', 'Новый пароль должен отличаться от текущего'));
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('security.password.title', 'Изменить пароль')}
      size="md"
    >
      <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
            {t('security.password.description', 'Введите текущий пароль и новый пароль для изменения')}
          </p>
        </div>

        <Input
          type="password"
          name="current-password-modal"
          id="current-password-modal"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            setCurrentPasswordError(null);
          }}
          placeholder={t('security.password.currentPassword', 'Текущий пароль')}
          error={currentPasswordError || undefined}
          autoFocus
          autoComplete="current-password"
          data-lpignore="true"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />

        <Input
          type="password"
          name="new-password-modal"
          id="new-password-modal"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setNewPasswordError(null);
          }}
          placeholder={t('security.password.newPassword', 'Новый пароль')}
          error={newPasswordError || undefined}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          data-dashlane-ignore="true"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        {newPassword && (
          <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
            {t('security.password.hint', 'Минимум 6 символов')}
          </p>
        )}

        <Input
          type="password"
          name="confirm-password-modal"
          id="confirm-password-modal"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmPasswordError(null);
          }}
          placeholder={t('security.password.confirmPassword', 'Подтвердите новый пароль')}
          error={confirmPasswordError || undefined}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          data-dashlane-ignore="true"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />

        {/* Password strength indicator */}
        {newPassword && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded">
                <div
                  className={`h-full rounded transition-all ${
                    newPassword.length < 6
                      ? 'bg-red-500 w-1/3'
                      : newPassword.length < 10
                      ? 'bg-yellow-500 w-2/3'
                      : 'bg-green-500 w-full'
                  }`}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {newPassword.length < 6
                  ? t('security.password.strength.weak', 'Слабый')
                  : newPassword.length < 10
                  ? t('security.password.strength.medium', 'Средний')
                  : t('security.password.strength.strong', 'Сильный')}
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleClose}
            disabled={changePasswordMutation.isPending}
          >
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={changePasswordMutation.isPending}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            {t('security.password.save', 'Сохранить')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
