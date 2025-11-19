import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthPageLayout } from '../../design-system/composites/AuthPageLayout';
import { Input } from '../../design-system/primitives/Input';
import { Button } from '../../design-system/primitives/Button';
import { Checkbox } from '../../design-system/primitives/Checkbox';
import { ProgressBar } from '../../design-system/composites/ProgressBar';
import { Logo } from '../../design-system/primitives/Logo';
import { useLanguageStore } from '../../store';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

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
  const totalSteps = 3;

  // Шаг 1: Имя и фамилия
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Шаг 2: Пароль (опционально)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [skipPassword, setSkipPassword] = useState(false);

  // Шаг 3: Согласие
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);

  // Refs для автофокуса
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Автофокус при смене шага
  useEffect(() => {
    if (currentStep === 1) {
      firstNameRef.current?.focus();
    } else if (currentStep === 2) {
      passwordRef.current?.focus();
    }
  }, [currentStep]);

  const isStepValid = () => {
    if (currentStep === 1) {
      return firstName.trim().length > 0 && lastName.trim().length > 0;
    }
    if (currentStep === 2) {
      if (skipPassword) return true;
      return password.length >= 8 && password === confirmPassword;
    }
    if (currentStep === 3) {
      return acceptTerms;
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

  return (
    <AuthPageLayout
      header={{
        showBack: true,
        onBack: handleBack,
        logo: <Logo size="md" showText={false} />,
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
    >
      <div className="w-full space-y-6" onKeyDown={handleKeyDown}>
        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step 1: Имя и фамилия */}
        {currentStep === 1 && (
          <>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                {t('onboarding.step1.title', 'Как вас зовут?')}
              </h1>
              <p className="text-base text-text-secondary">
                {t('onboarding.step1.subtitle', 'Укажите ваше имя и фамилию')}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                ref={firstNameRef}
                label={t('onboarding.step1.firstName', 'Имя')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && firstName.trim()) {
                    lastNameRef.current?.focus();
                  }
                }}
              />

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
            </div>
          </>
        )}

        {/* Step 2: Пароль */}
        {currentStep === 2 && (
          <>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                {t('onboarding.step2.title', 'Создайте пароль')}
              </h1>
              <p className="text-base text-text-secondary">
                {t('onboarding.step2.subtitle', 'Пароль нужен для дополнительной безопасности. Можно пропустить и создать позже.')}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                ref={passwordRef}
                type="password"
                label={t('onboarding.step2.password', 'Пароль')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={t('onboarding.step2.passwordHint', 'Минимум 8 символов')}
                disabled={skipPassword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !skipPassword && password.length >= 8) {
                    confirmPasswordRef.current?.focus();
                  }
                }}
              />

              <Input
                ref={confirmPasswordRef}
                type="password"
                label={t('onboarding.step2.confirmPassword', 'Подтвердите пароль')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={skipPassword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isStepValid()) {
                    handleNext();
                  }
                }}
              />

              <Checkbox
                checked={skipPassword}
                onChange={setSkipPassword}
                label={t('onboarding.step2.skipPassword', 'Пропустить, создать позже')}
              />
            </div>
          </>
        )}

        {/* Step 3: Согласие */}
        {currentStep === 3 && (
          <>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                {t('onboarding.step3.title', 'Почти готово!')}
              </h1>
              <p className="text-base text-text-secondary">
                {t('onboarding.step3.subtitle', 'Осталось принять условия использования')}
              </p>
            </div>

            <div className="space-y-4">
              <Checkbox
                checked={acceptTerms}
                onChange={setAcceptTerms}
                label={
                  <>
                    {t('onboarding.step3.acceptTerms', 'Я принимаю')}{' '}
                    <a href="/terms" className="text-primary hover:underline">
                      {t('onboarding.step3.userAgreement', 'пользовательское соглашение')}
                    </a>{' '}
                    {t('onboarding.step3.and', 'и')}{' '}
                    <a href="/privacy" className="text-primary hover:underline">
                      {t('onboarding.step3.privacyPolicy', 'политику конфиденциальности')}
                    </a>
                  </>
                }
              />

              <Checkbox
                checked={acceptNewsletter}
                onChange={setAcceptNewsletter}
                label={t('onboarding.step3.acceptNewsletter', 'Хочу получать новости и предложения')}
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
            variant="primary"
            onClick={handleNext}
            disabled={!isStepValid()}
            className={currentStep > 1 ? 'flex-1' : 'w-full'}
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
