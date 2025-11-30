import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthPageLayout } from '../../design-system/composites/AuthPageLayout';
import { Logo } from '../../design-system/primitives/Logo';
import { Input } from '../../design-system/primitives/Input';
import { Button } from '../../design-system/primitives/Button';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { apiClient } from '../../services/api/client';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

/**
 * ResetPasswordPage - страница для сброса пароля по токену
 */
export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentLang = useCurrentLanguage() || 'ru';
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Проверяем валидность токена
  const { data: tokenValidation, isLoading: isValidatingToken, error: tokenError } = useQuery({
    queryKey: ['password-reset-token', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Token is required');
      }
      console.log('🔍 [ResetPasswordPage] Validating token:', token);
      const response = await apiClient.get('/password-reset/validate-token', {
        params: { token },
      });
      console.log('✅ [ResetPasswordPage] Token validation response:', response.data);
      // Проверяем структуру ответа - может быть обернут в data
      const validationData = response.data?.data || response.data;
      console.log('✅ [ResetPasswordPage] Parsed validation data:', validationData);
      return validationData;
    },
    enabled: !!token,
    retry: false,
  });

  // Мутация для сброса пароля
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await apiClient.post('/password-reset/reset', data);
      return response.data;
    },
    onSuccess: () => {
      // Перенаправляем на страницу входа
      navigate(buildPathWithLang('/auth', currentLang), {
        state: { message: t('auth.resetPassword.success', 'Пароль успешно изменен. Войдите с новым паролем.') },
      });
    },
    onError: (err: any) => {
      let errorMessage = t('auth.resetPassword.errors.genericError', 'Не удалось сбросить пароль');
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
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    if (!newPassword) {
      setNewPasswordError(t('auth.resetPassword.errors.passwordRequired', 'Введите новый пароль'));
      return;
    }

    if (newPassword.length < 6) {
      setNewPasswordError(t('auth.resetPassword.errors.passwordTooShort', 'Пароль должен содержать минимум 6 символов'));
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t('auth.resetPassword.errors.confirmPasswordRequired', 'Подтвердите пароль'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('auth.resetPassword.errors.passwordMismatch', 'Пароли не совпадают'));
      return;
    }

    if (!token) {
      setError(t('auth.resetPassword.errors.tokenRequired', 'Токен восстановления не найден'));
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword: newPassword.trim(),
    });
  };

  // Если токен не валиден или отсутствует, показываем ошибку
  if (!token) {
    return (
      <AuthPageLayout
        header={{
          logo: <Logo size="md" showText={false} />,
          showBack: true,
          onBack: () => navigate(buildPathWithLang('/', currentLang)),
        }}
        background="default"
      >
        <div className="text-center py-8">
          <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
            {t('auth.resetPassword.invalidToken', 'Неверная ссылка')}
          </h1>
          <p className={`text-base ${themeClasses.text.secondary} mb-6`}>
            {t('auth.resetPassword.invalidTokenMessage', 'Ссылка для восстановления пароля недействительна или отсутствует')}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate(buildPathWithLang('/auth', currentLang))}
          >
            {t('auth.resetPassword.backToLogin', 'Вернуться к входу')}
          </Button>
        </div>
      </AuthPageLayout>
    );
  }

  if (isValidatingToken) {
    return (
      <AuthPageLayout
        header={{
          logo: <Logo size="md" showText={false} />,
          showBack: true,
          onBack: () => navigate(buildPathWithLang('/', currentLang)),
        }}
        background="default"
      >
        <div className="text-center py-8">
          <p className={themeClasses.text.secondary}>{t('auth.loading', 'Загрузка...')}</p>
        </div>
      </AuthPageLayout>
    );
  }

  // Показываем ошибку, если токен не валиден или произошла ошибка при валидации
  // Важно: проверяем tokenValidation только если он загружен (!isValidatingToken)
  // И только если есть явная ошибка или токен явно невалиден
  console.log('🔍 [ResetPasswordPage] Render check:', {
    isValidatingToken,
    tokenValidation,
    tokenError,
    hasTokenValidation: !!tokenValidation,
    tokenValidationValid: tokenValidation?.valid,
  });
  
  if (!isValidatingToken && tokenValidation !== undefined) {
    if (tokenError || !tokenValidation.valid) {
      return (
        <AuthPageLayout
        header={{
          logo: <Logo size="md" showText={false} />,
          showBack: true,
          onBack: () => navigate(buildPathWithLang('/', currentLang)),
        }}
        background="default"
      >
        <div className="text-center py-8">
          <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
            {t('auth.resetPassword.invalidToken', 'Неверная ссылка')}
          </h1>
          <p className={`text-base ${themeClasses.text.secondary} mb-6`}>
            {tokenError 
              ? t('auth.resetPassword.tokenError', 'Ошибка при проверке токена. Попробуйте запросить новую ссылку для восстановления пароля.')
              : t('auth.resetPassword.invalidTokenMessage', 'Ссылка для восстановления пароля недействительна или истекла')}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate(buildPathWithLang('/auth', currentLang))}
          >
            {t('auth.resetPassword.backToLogin', 'Вернуться к входу')}
          </Button>
        </div>
        </AuthPageLayout>
      );
    }
  }

  return (
    <AuthPageLayout
      header={{
        logo: <Logo size="md" showText={false} />,
        showBack: true,
        onBack: () => navigate(buildPathWithLang('/', currentLang)),
      }}
      background="default"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-left mb-6">
          <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
            {t('auth.resetPassword.title', 'Сброс пароля')}
          </h1>
          <p className={`text-base ${themeClasses.text.secondary}`}>
            {t('auth.resetPassword.subtitle', 'Введите новый пароль для вашего аккаунта')}
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setNewPasswordError(null);
            }}
            placeholder={t('auth.resetPassword.newPasswordPlaceholder', 'Новый пароль')}
            error={newPasswordError || undefined}
            autoFocus
            autoComplete="new-password"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newPassword && confirmPassword && !resetPasswordMutation.isPending) {
                handleSubmit();
              }
            }}
          />
          {newPassword && (
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              {t('auth.password.hint', 'Минимум 6 символов')}
            </p>
          )}

          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError(null);
            }}
            placeholder={t('auth.resetPassword.confirmPasswordPlaceholder', 'Подтвердите пароль')}
            error={confirmPasswordError || undefined}
            autoComplete="new-password"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newPassword && confirmPassword && !resetPasswordMutation.isPending) {
                handleSubmit();
              }
            }}
          />

          {error && (
            <div className={`text-sm ${themeClasses.text.error} mt-2`}>
              {error}
            </div>
          )}

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
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(buildPathWithLang('/auth', currentLang))}
            disabled={resetPasswordMutation.isPending}
          >
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={resetPasswordMutation.isPending}
            disabled={!newPassword || !confirmPassword}
          >
            {t('auth.resetPassword.submit', 'Сбросить пароль')}
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
};

export default ResetPasswordPage;

