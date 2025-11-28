import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AuthPageLayout } from '../../design-system/composites/AuthPageLayout';
import { Input } from '../../design-system/primitives/Input';
import { Button } from '../../design-system/primitives/Button';
import { Checkbox } from '../../design-system/primitives/Checkbox';
import { ProgressBar } from '../../design-system/composites/ProgressBar';
import { Logo } from '../../design-system/primitives/Logo';
import { useLanguageStore } from '../../store';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { authFlowApi, AuthMethod } from '../../services/api/auth-flow';

interface LocationState {
  contact: string;
  type: 'phone' | 'email';
  token: string;
}

/**
 * OnboardingPage - страница онбординга (многошаговая форма)
 */
export const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  const state = location.state as LocationState | null;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Шаг 1: Имя и фамилия
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Шаг 2: Пароль (опционально)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [skipPassword, setSkipPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { data: publicAuthFlow } = useQuery({
    queryKey: ['auth-flow-public'],
    queryFn: async () => {
      try {
        const response = await authFlowApi.getPublicAuthFlow();
        return (response.data as any)?.data || response.data;
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[OnboardingPage] Failed to load public auth flow config:', e);
        }
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const registrationConfig = (publicAuthFlow?.registration || []) as AuthMethod[] | undefined;
  const registrationFields = (registrationConfig || []).filter(
    (m) => m.stepType === 'field' && m.enabled !== false,
  );
  const hasCustomRegistrationConfig = !!registrationConfig && registrationConfig.length > 0;

  const showFirstNameField =
    !hasCustomRegistrationConfig ||
    registrationFields.some((f) => f.fieldType === 'name' || f.id === 'name');

  const showLastNameField =
    !hasCustomRegistrationConfig ||
    registrationFields.some((f) => f.fieldType === 'surname' || f.id === 'surname');

  // Refs для автофокуса и навигации
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const skipPasswordCheckboxRef = useRef<HTMLInputElement>(null);
  const finishButtonRef = useRef<HTMLButtonElement>(null);

  // Автофокус при смене шага
  useEffect(() => {
    if (currentStep === 1) {
      firstNameRef.current?.focus();
    } else if (currentStep === 2) {
      passwordRef.current?.focus();
    }
  }, [currentStep]);

  // Валидация паролей
  useEffect(() => {
    if (currentStep === 2 && !skipPassword) {
      if (confirmPassword.length > 0) {
        if (password !== confirmPassword) {
          setPasswordError(t('onboarding.step2.passwordsDoNotMatch', 'Пароли не совпадают'));
        } else if (password.length < 8) {
          setPasswordError(t('onboarding.step2.passwordTooShort', 'Пароль должен содержать минимум 8 символов'));
        } else {
          setPasswordError(null);
        }
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
    }
  }, [password, confirmPassword, skipPassword, currentStep, t]);

  const isStepValid = () => {
    if (currentStep === 1) {
      const firstOk = !showFirstNameField || firstName.trim().length > 0;
      const lastOk = !showLastNameField || lastName.trim().length > 0;
      return firstOk && lastOk;
    }
    if (currentStep === 2) {
      if (skipPassword) return true;
      return password.length >= 8 && password === confirmPassword && !passwordError;
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      const lang = currentLang || 'ru';
      navigate(buildPathWithLang('/auth', lang));
    }
  };

  const handleFinish = async () => {
    // TODO: Отправить данные на сервер
    // После успешной регистрации создаем пользователя с мок данными и переходим в профиль
    try {
      // Сохраняем токен из state
      const accessToken = state?.token || 'mock_access_token_' + Date.now();
      const refreshToken = 'mock_refresh_token_' + Date.now();
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Создаем мок пользователя в store со стандартными данными
      const { useAuthStore } = await import('../../store');
      const fullName = `${firstName} ${lastName}`.trim() || 'Новый пользователь';
      useAuthStore.getState().login(
        {
          id: 'new_user_' + Date.now(),
          name: fullName,
          email: state?.contact && state.type === 'email' ? state.contact : '',
          phone: state?.contact && state.type === 'phone' ? state.contact : '',
          avatar: undefined,
        },
        accessToken,
        refreshToken
      );
      
      // Переходим в дашборд (профиль)
      const lang = currentLang || 'ru';
      navigate(buildPathWithLang('/dashboard', lang));
    } catch (error) {
      console.error('Error finishing registration:', error);
      const lang = currentLang || 'ru';
      navigate(buildPathWithLang('/dashboard', lang));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isStepValid()) {
      handleNext();
    }
  };

  if (!state) {
    const lang = currentLang || 'ru';
    navigate(buildPathWithLang('/auth', lang));
    return null;
  }

  // Определяем название кнопки для footer
  const buttonLabel = currentStep === totalSteps
    ? t('onboarding.finish', 'Завершить')
    : t('common.next', 'Далее');

  // Формируем текст footer с динамическим названием кнопки
  const footerText = t('auth.footer.text', 'Нажимая «{{button}}», вы принимаете', { button: buttonLabel });

  return (
    <AuthPageLayout
      header={{
        showBack: true,
        onBack: handleBack,
        logo: <Logo size="md" showText={false} />,
      }}
      footer={{
        text: footerText,
        links: [
          { href: '/terms', text: t('auth.footer.terms', 'пользовательское соглашение') },
          { href: '/privacy', text: t('auth.footer.privacy', 'политику конфиденциальности') },
        ],
        additionalText: t('auth.footer.dataTransfer', 'Передаваемые данные'),
        additionalLink: { href: '/privacy#data', text: t('auth.footer.dataTransfer', 'Передаваемые данные') },
      }}
    >
      <div className="w-full space-y-6" onKeyDown={handleKeyDown}>
        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step 1: Имя и фамилия (динамически в зависимости от конфигурации auth flow) */}
        {currentStep === 1 && (
          <>
            <div className="text-center">
              <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text.primary} mb-2`}>
                {t('onboarding.step1.title', 'Как вас зовут?')}
              </h1>
              <p className={`text-base ${themeClasses.text.secondary}`}>
                {t('onboarding.step1.subtitle', 'Укажите ваше имя и фамилию')}
              </p>
            </div>

            <div className="space-y-4">
              {showFirstNameField && (
                <Input
                  ref={firstNameRef}
                  label={t('onboarding.step1.firstName', 'Имя')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && firstName.trim()) {
                      if (showLastNameField) {
                        lastNameRef.current?.focus();
                      } else if (isStepValid()) {
                        handleNext();
                      }
                    }
                  }}
                />
              )}

              {showLastNameField && (
                <Input
                  ref={lastNameRef}
                  label={t('onboarding.step1.lastName', 'Фамилия')}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isStepValid()) {
                      handleNext();
                    }
                  }}
                />
              )}
            </div>
          </>
        )}

        {/* Step 2: Пароль */}
        {currentStep === 2 && (
          <>
            <div className="text-center">
              <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text.primary} mb-2`}>
                {t('onboarding.step2.title', 'Создайте пароль')}
              </h1>
              <p className={`text-base ${themeClasses.text.secondary}`}>
                {t('onboarding.step2.subtitle', 'Пароль нужен для дополнительной безопасности. Можно пропустить и создать позже.')}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                ref={passwordRef}
                type="password"
                label={t('onboarding.step2.password', 'Пароль')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Очищаем ошибку при изменении пароля
                  if (passwordError) {
                    setPasswordError(null);
                  }
                }}
                helperText={t('onboarding.step2.passwordHint', 'Минимум 8 символов')}
                disabled={skipPassword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !skipPassword) {
                    e.preventDefault();
                    confirmPasswordRef.current?.focus();
                  }
                }}
              />

              <Input
                ref={confirmPasswordRef}
                type="password"
                label={t('onboarding.step2.confirmPassword', 'Подтвердите пароль')}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  // Очищаем ошибку при начале ввода
                  if (passwordError) {
                    setPasswordError(null);
                  }
                }}
                error={passwordError || undefined}
                disabled={skipPassword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (skipPassword) {
                      // Если чекбокс включен, форма валидна - переходим к кнопке
                      finishButtonRef.current?.focus();
                    } else {
                      // Если форма валидна, переходим к кнопке, иначе к чекбоксу
                      if (isStepValid()) {
                        finishButtonRef.current?.focus();
                      } else {
                        skipPasswordCheckboxRef.current?.focus();
                      }
                    }
                  }
                }}
              />

              <Checkbox
                ref={skipPasswordCheckboxRef}
                checked={skipPassword}
                onChange={(value) => {
                  setSkipPassword(value);
                  // Очищаем ошибку при включении чекбокса
                  if (value) {
                    setPasswordError(null);
                  }
                }}
                label={t('onboarding.step2.skipPassword', 'Пропустить, создать позже')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Переключаем чекбокс
                    const newValue = !skipPassword;
                    setSkipPassword(newValue);
                    // Очищаем ошибку при включении чекбокса
                    if (newValue) {
                      setPasswordError(null);
                    }
                    // После переключения переходим к кнопке (форма всегда валидна после переключения)
                    setTimeout(() => {
                      finishButtonRef.current?.focus();
                    }, 0);
                  }
                }}
              />
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              {t('common.back', 'Назад')}
            </Button>
          )}
          <Button
            ref={finishButtonRef}
            variant="primary"
            onClick={handleNext}
            disabled={!isStepValid()}
            className={currentStep > 1 ? 'flex-1' : 'w-full'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isStepValid()) {
                e.preventDefault();
                handleNext();
              }
            }}
          >
            {currentStep === totalSteps
              ? t('onboarding.finish', 'Завершить')
              : t('common.next', 'Далее')}
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
};

export default OnboardingPage;
