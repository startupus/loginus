import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/primitives/Button';
import { Input } from '@/design-system/primitives/Input';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { apiClient } from '@/services/api/client';
import { securityApi } from '@/services/api/security';
import { useAuthStore } from '@/store';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEmail?: string; // Email пользователя, если известен
}

/**
 * ForgotPasswordModal - модальное окно для восстановления пароля
 * Использует выбранный способ восстановления из настроек пользователя
 */
export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [email, setEmail] = useState(userEmail || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Получаем доступные способы восстановления
  const { data: recoveryMethods } = useQuery({
    queryKey: ['recovery-methods'],
    queryFn: async () => {
      if (!user) return null;
      const response = await securityApi.getRecoveryMethods();
      return response.data?.methods || response.data?.data?.methods || response.data || [];
    },
    enabled: isOpen && !!user,
  });

  // Определяем основной способ восстановления на основе выбранного пользователем
  const primaryRecoveryMethod = React.useMemo(() => {
    if (!recoveryMethods || !Array.isArray(recoveryMethods)) {
      return 'email'; // По умолчанию email
    }
    const available = recoveryMethods.filter((m: any) => m.available && m.contact);
    if (available.length === 0) {
      return 'email';
    }
    // Ищем способ, помеченный как primary
    const primaryMethod = available.find((m: any) => m.primary === true);
    if (primaryMethod) {
      return primaryMethod.type === 'phone_telegram' ? 'phone' : primaryMethod.type;
    }
    // Ищем email метод
    const emailMethod = available.find((m: any) => m.type === 'email');
    if (emailMethod) return 'email';
    // Иначе берем первый доступный
    return available[0]?.type === 'phone_telegram' ? 'phone' : (available[0]?.type || 'email');
  }, [recoveryMethods]);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post('/password-reset/forgot', data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
    },
    onError: (err: any) => {
      let errorMessage = t('auth.forgotPassword.errors.genericError', 'Не удалось отправить запрос на восстановление пароля');
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    },
  });

  const handleSubmit = () => {
    setError(null);
    setSuccess(false);

    if (!email || !email.trim()) {
      setError(t('auth.forgotPassword.errors.emailRequired', 'Введите email'));
      return;
    }

    if (!email.includes('@')) {
      setError(t('auth.forgotPassword.errors.invalidEmail', 'Некорректный email'));
      return;
    }

    forgotPasswordMutation.mutate({ email: email.trim() });
  };

  const handleClose = () => {
    setEmail(userEmail || '');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('auth.forgotPassword.title', 'Восстановление пароля')}
      size="md"
    >
      <div className="space-y-4">
        {success ? (
          <>
            <div className="text-center py-4">
              <p className={`text-base ${themeClasses.text.primary} mb-2`}>
                {t('auth.forgotPassword.success.title', 'Проверьте почту')}
              </p>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {t(
                  'auth.forgotPassword.success.message',
                  'Если пользователь с таким email существует, на него будет отправлена ссылка для восстановления пароля'
                )}
              </p>
              {email && (
                <p className={`text-sm ${themeClasses.text.secondary} mt-2 font-medium`}>
                  {email}
                </p>
              )}
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={handleClose}
            >
              {t('common.close', 'Закрыть')}
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
                {primaryRecoveryMethod === 'email'
                  ? t(
                      'auth.forgotPassword.description.email',
                      'Введите email, на который будет отправлена ссылка для восстановления пароля'
                    )
                  : t(
                      'auth.forgotPassword.description.phone',
                      'Введите телефон, на который будет отправлен код для восстановления пароля'
                    )}
              </p>
            </div>

            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder={t('auth.forgotPassword.emailPlaceholder', 'Email')}
              error={error || undefined}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email && !forgotPasswordMutation.isPending) {
                  handleSubmit();
                }
              }}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleClose}
                disabled={forgotPasswordMutation.isPending}
              >
                {t('common.cancel', 'Отмена')}
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                loading={forgotPasswordMutation.isPending}
                disabled={!email || !email.trim()}
              >
                {t('auth.forgotPassword.submit', 'Отправить')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;

