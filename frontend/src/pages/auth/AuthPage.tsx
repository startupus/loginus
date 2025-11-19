import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthPageLayout } from '../../design-system/composites/AuthPageLayout';
import { UniversalInput } from '../../design-system/primitives/UniversalInput';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { Logo } from '../../design-system/primitives/Logo';
import { useInputValidation } from '../../hooks/useInputValidation';
import { authApi } from '../../services/api/auth';
import { useLanguageStore } from '../../store';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

/**
 * AuthPage - главная страница авторизации
 * Универсальное поле ввода для телефона или email
 */
export const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isValid, error: validationError, normalizedValue, type } = useInputValidation(contact, {
    type: 'universal',
    validateOnChange: true,
  });

  const handleContinue = async () => {
    if (!isValid || !normalizedValue || !type) {
      setError(validationError || t('auth.errors.invalidInput', 'Введите корректный телефон или email'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Оптимизированный запрос: проверяем аккаунт и отправляем код за один запрос
      const response = await authApi.checkAndSendCode(normalizedValue, type, 'sms');
      const { exists, sessionId, code } = response.data.data;

      // В dev режиме код доступен в state для отображения

      // Переходим на страницу ввода кода
      navigate(buildPathWithLang('/auth/verify', currentLang), {
        state: {
          contact: normalizedValue,
          type,
          sessionId,
          exists,
          code: code || undefined, // Передаем код в state для отображения в dev режиме
        },
      });
    } catch (err: any) {
      // Более детальная обработка ошибок
      let errorMessage = t('auth.errors.genericError', 'Произошла ошибка. Попробуйте ещё раз.');
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = t('auth.errors.timeout', 'Превышено время ожидания. Проверьте подключение к интернету.');
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMessage = t('auth.errors.networkError', 'Ошибка сети. Проверьте подключение к интернету.');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometric = () => {
    // TODO: Реализовать биометрическую авторизацию
  };

  const handleQR = () => {
    // TODO: Реализовать QR-код авторизацию
  };

  return (
    <AuthPageLayout
      header={{
        logo: <Logo size="md" showText={false} />,
        showBack: true,
        onBack: () => {
          const lang = currentLang || 'ru';
          navigate(buildPathWithLang('/', lang));
        },
      }}
      footer={{
        text: t('auth.footer.text', 'Нажимая «Продолжить», вы принимаете'),
        links: [
          { href: '/terms', text: t('auth.footer.terms', 'пользовательское соглашение') },
          { href: '/privacy', text: t('auth.footer.privacy', 'политику конфиденциальности') },
        ],
        additionalText: t('auth.footer.dataTransfer', 'Передаваемые данные'),
        additionalLink: { href: '/privacy#data', text: t('auth.footer.dataTransfer', 'Передаваемые данные') },
      }}
      background="default"
    >
      <div className="w-full space-y-6">
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-1">
            {t('auth.title', 'Введите')}
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            {t('auth.titleField', 'телефон или почту')}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary">
            {t('auth.subtitle', 'Чтобы войти или зарегистрироваться')}
          </p>
        </div>

        <div className="space-y-4">
          <UniversalInput
            value={contact}
            onChange={setContact}
            placeholder={t('auth.phoneOrEmail', 'Телефон или email')}
            error={error || validationError || undefined}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid && !isLoading) {
                handleContinue();
              }
            }}
          />

          <Button
            variant="primary"
            fullWidth
            disabled={!isValid || isLoading}
            onClick={handleContinue}
            loading={isLoading}
          >
            {t('auth.continue', 'Продолжить')}
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            fullWidth
            onClick={handleBiometric}
            className="flex items-center justify-center gap-2"
          >
            <Icon name="fingerprint" size="sm" />
            {t('auth.biometric', 'По лицу или отпечатку')}
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={handleQR}
            className="flex items-center justify-center gap-2"
          >
            <Icon name="qr-code" size="sm" />
            {t('auth.qrCode', 'QR-код')}
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
};

export default AuthPage;
