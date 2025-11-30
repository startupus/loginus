import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UniversalInput } from '../../design-system/primitives/UniversalInput';
import { Input } from '../../design-system/primitives/Input';
import { Button } from '../../design-system/primitives/Button';
import { CodeInput } from '../../design-system/primitives/CodeInput';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface StepData {
  id: string;
  name?: string;
  type?: string;
  stepType?: string;
  requiresVerification?: boolean;
}

export interface StepRendererProps {
  step: StepData;
  onComplete: (data: Record<string, any>) => void;
  isLoading?: boolean;
  error?: string | null;
  tempData?: Record<string, any>;
  flowType?: 'login' | 'registration';
  onForgotPassword?: () => void; // Callback для открытия модального окна восстановления пароля
}

/**
 * StepRenderer - универсальный компонент для рендеринга шагов аутентификации
 * Поддерживает различные типы полей: phone-email, password, code, name и т.д.
 */
export const StepRenderer: React.FC<StepRendererProps> = ({
  step,
  onComplete,
  isLoading = false,
  error = null,
  tempData = {},
  flowType = 'login',
  onForgotPassword,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Очищаем значение при изменении шага
  useEffect(() => {
    setValue('');
    setPasswordConfirm('');
    setLocalError(null);
  }, [step.id]);

  // Определяем, является ли шаг шагом для ввода кода
  const isCodeStep = React.useMemo(() => {
    const stepId = step.id?.toLowerCase() || '';
    const stepType = step.type?.toLowerCase() || '';
    const stepStepType = step.stepType?.toLowerCase() || '';
    const stepName = step.name?.toLowerCase() || '';
    
    return stepId === 'sms-code' || 
           stepId === 'email-code' || 
           stepType === 'code' ||
           stepStepType === 'code' ||
           stepName.includes('код') || 
           stepName.includes('code') ||
           stepName.includes('sms');
  }, [step.id, step.type, step.stepType, step.name]);

  const handleSubmit = () => {
    // Для кодов проверяем длину, а не просто наличие значения
    if (isCodeStep) {
      if (!value || value.length !== 6) {
        setLocalError(t('auth.errors.codeRequired', 'Введите полный код из 6 цифр'));
        return;
      }
    } else if (!value && step.id !== 'qr') {
      setLocalError(t('auth.errors.fieldRequired', 'Поле обязательно для заполнения'));
      return;
    }

    let dataToSend: Record<string, any> = {};

    switch (step.id) {
      case 'phone-email':
        // Определяем тип (email или phone)
        const type = value.includes('@') ? 'email' : 'phone';
        dataToSend = { contact: value, type };
        break;

      case 'password':
        // Включаем userId из tempData, если он есть
        const isRegistration = flowType === 'registration';
        
        if (isRegistration) {
          // При регистрации проверяем оба поля
          if (!value) {
            setLocalError(t('auth.password.required', 'Пароль обязателен для заполнения'));
            return;
          }
          if (!passwordConfirm) {
            setLocalError(t('auth.password.confirmRequired', 'Подтверждение пароля обязательно'));
            return;
          }
          if (value !== passwordConfirm) {
            setLocalError(t('auth.password.mismatch', 'Пароли не совпадают'));
            return;
          }
          dataToSend = { 
            password: value,
            passwordConfirm: passwordConfirm
          };
        } else {
          // При входе только один пароль
          dataToSend = { 
            password: value,
            ...(tempData?.userId && { userId: tempData.userId })
          };
        }
        break;

      case 'sms-code':
      case 'email-code':
      case 'sms': // Поддержка старого формата
      case 'email': // Поддержка старого формата
        dataToSend = { code: value };
        break;

      case 'first-name':
      case 'name':
        if (!value || !value.trim()) {
          setLocalError(t('auth.errors.fieldRequired', 'Поле обязательно для заполнения'));
          return;
        }
        dataToSend = { firstName: value.trim() };
        console.log('🔍 [StepRenderer] first-name step, dataToSend:', dataToSend);
        break;

      case 'last-name':
      case 'surname':
        if (!value || !value.trim()) {
          setLocalError(t('auth.errors.fieldRequired', 'Поле обязательно для заполнения'));
          return;
        }
        dataToSend = { lastName: value.trim() };
        break;

      case 'inn':
        dataToSend = { inn: value };
        break;

      case 'github':
      case 'telegram':
      case 'gosuslugi':
      case 'vkontakte':
        // Для OAuth методов обычно требуется редирект
        // Пока просто передаем метод
        dataToSend = { method: step.id };
        break;
      
      default:
        // Если это шаг для ввода кода (определен по типу или имени), отправляем как код
        if (isCodeStep) {
          dataToSend = { code: value };
        } else {
          dataToSend = { value };
        }
        break;
    }

    onComplete(dataToSend);
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'phone-email':
        return (
          <>
            <div className="text-left mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-1`}>
                {t('auth.title', 'Введите')}
              </h1>
              <h2 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                {t('auth.titleField', 'телефон или почту')}
              </h2>
              <p className={`text-base sm:text-lg ${themeClasses.text.secondary}`}>
                {t('auth.subtitle', 'Чтобы войти или зарегистрироваться')}
              </p>
            </div>
            <UniversalInput
              value={value}
              onChange={setValue}
              placeholder={t('auth.phoneOrEmail', 'Телефон или email')}
              error={(error || localError) || undefined}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value && !isLoading) {
                  handleSubmit();
                }
              }}
            />
          </>
        );

      case 'password':
        const isRegistration = flowType === 'registration';
        return (
          <>
            <div className="text-left mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                {t('auth.password.title', 'Введите пароль')}
              </h1>
              <p className={`text-base sm:text-lg ${themeClasses.text.secondary} mb-2`}>
                {isRegistration
                  ? t('auth.password.registrationSubtitle', 'Для завершения регистрации')
                  : t('auth.password.subtitle', 'Для завершения входа')}
              </p>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {t('auth.password.requirements', 'Пароль должен содержать минимум 6 символов')}
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t('auth.password.placeholder', 'Пароль')}
                error={(error || localError) || undefined}
                autoFocus
                autoComplete={isRegistration ? 'new-password' : 'current-password'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && value && !isLoading) {
                    if (isRegistration && passwordConfirm) {
                      handleSubmit();
                    } else if (!isRegistration) {
                      handleSubmit();
                    }
                  }
                }}
              />
              {isRegistration && (
                <Input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder={t('auth.password.confirmPlaceholder', 'Повторите пароль')}
                  error={(error || localError) || undefined}
                  autoComplete="new-password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && value && passwordConfirm && !isLoading) {
                      handleSubmit();
                    }
                  }}
                />
              )}
              {!isRegistration && (
                <button
                  type="button"
                  onClick={() => {
                    onForgotPassword?.();
                  }}
                  className={`text-sm ${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors text-left`}
                >
                  {t('auth.password.forgot', 'Забыли пароль?')}
                </button>
              )}
            </div>
          </>
        );

      case 'sms-code':
      case 'email-code':
        // Определяем тип контакта для правильного отображения
        const contactType = tempData?.type || (tempData?.contact?.includes('@') ? 'email' : 'phone');
        return (
          <>
            <div className="text-left mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                {t('auth.code.title', 'Введите код')}
              </h1>
              <p className={`text-base sm:text-lg ${themeClasses.text.secondary}`}>
                {t('auth.code.subtitle', 'Код отправлен на ваш контакт')}
              </p>
              {tempData.contact && (
                <p className={`text-sm ${themeClasses.text.secondary} mt-2`}>
                  {tempData.contact}
                </p>
              )}
            </div>
            <CodeInput
              value={value}
              onChange={(code) => {
                setValue(code);
                // Автоматически отправляем код, когда он полностью введен
                if (code.length === 6 && !isLoading) {
                  handleSubmit();
                }
              }}
              onComplete={(code) => {
                setValue(code);
                // Автоматически отправляем код при полном заполнении
                if (!isLoading) {
                  handleSubmit();
                }
              }}
              length={6}
              error={(error || localError) || undefined}
              autoFocus
            />
          </>
        );

      case 'first-name':
      case 'name':
        return (
          <>
            <div className="text-left mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                {t('auth.firstName.title', 'Введите имя')}
              </h1>
              <p className={`text-base sm:text-lg ${themeClasses.text.secondary}`}>
                {t('auth.firstName.subtitle', 'Для завершения регистрации')}
              </p>
            </div>
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('auth.firstName.placeholder', 'Имя')}
              error={(error || localError) || undefined}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value && !isLoading) {
                  handleSubmit();
                }
              }}
            />
          </>
        );

      case 'last-name':
      case 'surname':
        return (
          <>
            <div className="text-left mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                {t('auth.lastName.title', 'Введите фамилию')}
              </h1>
              <p className={`text-base sm:text-lg ${themeClasses.text.secondary}`}>
                {t('auth.lastName.subtitle', 'Для завершения регистрации')}
              </p>
            </div>
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('auth.lastName.placeholder', 'Фамилия')}
              error={(error || localError) || undefined}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value && !isLoading) {
                  handleSubmit();
                }
              }}
            />
          </>
        );

      case 'inn':
        return (
          <>
            <div className="text-left mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                {t('auth.inn.title', 'Введите ИНН')}
              </h1>
              <p className={`text-base sm:text-lg ${themeClasses.text.secondary}`}>
                {t('auth.inn.subtitle', 'Для завершения регистрации')}
              </p>
            </div>
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('auth.inn.placeholder', 'ИНН')}
              error={(error || localError) || undefined}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value && !isLoading) {
                  handleSubmit();
                }
              }}
            />
          </>
        );

      case 'github':
      case 'telegram':
      case 'gosuslugi':
      case 'vkontakte':
        return (
          <>
            <div className="text-left mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                {t(`auth.oauth.${step.id}.title`, `Войти через ${step.name || step.id}`)}
              </h1>
              <p className={`text-base sm:text-lg ${themeClasses.text.secondary}`}>
                {t(`auth.oauth.${step.id}.subtitle`, 'Вы будете перенаправлены для авторизации')}
              </p>
            </div>
          </>
        );

      default:
        // Если это шаг для ввода кода (определен по типу или имени), используем CodeInput
        if (isCodeStep) {
          const contactType = tempData?.type || (tempData?.contact?.includes('@') ? 'email' : 'phone');
          return (
            <>
              <div className="text-left mb-6">
                <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                  {t('auth.code.title', 'Введите код')}
                </h1>
                <p className={`text-base sm:text-lg ${themeClasses.text.secondary}`}>
                  {t('auth.code.subtitle', 'Код отправлен на ваш контакт')}
                </p>
                {tempData.contact && (
                  <p className={`text-sm ${themeClasses.text.secondary} mt-2`}>
                    {tempData.contact}
                  </p>
                )}
              </div>
              <CodeInput
                value={value}
                onChange={(code) => {
                  setValue(code);
                  // Очищаем ошибку при вводе
                  if (localError) {
                    setLocalError(null);
                  }
                  // Автоматически отправляем код, когда он полностью введен
                  if (code.length === 6 && !isLoading) {
                    handleSubmit();
                  }
                }}
                onComplete={(code) => {
                  setValue(code);
                  // Очищаем ошибку при полном заполнении
                  if (localError) {
                    setLocalError(null);
                  }
                  // Автоматически отправляем код при полном заполнении
                  if (!isLoading) {
                    handleSubmit();
                  }
                }}
                length={6}
                error={error || undefined}
                autoFocus
              />
            </>
          );
        }
        
        // Для неизвестных шагов используем обычный Input
        return (
          <>
            <div className="text-left mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-3`}>
                {step.name || t('auth.step.title', 'Шаг авторизации')}
              </h1>
            </div>
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('auth.step.placeholder', 'Введите значение')}
              error={(error || localError) || undefined}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value && !isLoading) {
                  handleSubmit();
                }
              }}
            />
          </>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderStepContent()}

      <Button
        variant="primary"
        fullWidth
        disabled={isLoading || (!value && step.id !== 'qr')}
        onClick={handleSubmit}
        loading={isLoading}
      >
        {t('auth.continue', 'Продолжить')}
      </Button>
    </div>
  );
};

