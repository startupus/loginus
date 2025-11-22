import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthPageLayout } from '../../design-system/composites/AuthPageLayout';
import { CodeInput, CodeInputRef } from '../../design-system/primitives/CodeInput';
import { Button } from '../../design-system/primitives/Button';
import { Logo } from '../../design-system/primitives/Logo';
import { Icon } from '../../design-system/primitives/Icon';
import { ErrorMessage } from '../../design-system/composites/ErrorMessage';
import { ResendTimer } from '../../design-system/composites/ResendTimer';
import { useContactMasking } from '../../hooks/useContactMasking';
import { authApi } from '../../services/api/auth';
import { useLanguageStore } from '../../store';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

interface LocationState {
  contact: string;
  type: 'phone' | 'email';
  sessionId: string;
  exists: boolean;
  code?: string; // Код для dev режима
}

/**
 * VerifyCodePage - страница ввода кода подтверждения
 */
export const VerifyCodePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  const state = location.state as LocationState | null;

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const codeInputRef = useRef<CodeInputRef>(null);

  const contact = state?.contact || '';
  const contactType = state?.type || 'phone';
  const sessionId = state?.sessionId || '';

  const { masked } = useContactMasking(contact, contactType);

  useEffect(() => {
    if (!state) {
      // Если нет state, перенаправляем на главную страницу авторизации
      navigate(buildPathWithLang('/auth', currentLang));
    }
  }, [state, navigate, currentLang]);

  const handleCodeComplete = async (completeCode: string) => {
    if (!sessionId) {
      setError(t('auth.errors.sessionNotFound', 'Сессия не найдена'));
      // Не очищаем код - оставляем для визуальной проверки
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await authApi.verifyCode(sessionId, completeCode);
      
      // Проверяем структуру ответа
      if (!response.data.success) {
        // Переводим сообщения об ошибках с бэкенда
        const errorCode = response.data.error;
        let errorMessage = response.data.message || t('auth.errors.invalidCode', 'Неправильный код, попробуйте ещё раз');
        
        // Переводим известные коды ошибок
        if (errorCode === 'SESSION_NOT_FOUND') {
          errorMessage = t('auth.errors.sessionNotFoundOrExpired', 'Сессия не найдена или истекла');
        } else if (errorCode === 'CODE_EXPIRED') {
          errorMessage = t('auth.errors.codeExpired', 'Код истёк. Запросите новый');
        } else if (errorCode === 'INVALID_CODE') {
          errorMessage = t('auth.errors.invalidCode', 'Неправильный код, попробуйте ещё раз');
        } else if (response.data.message) {
          // Если сообщение на русском, пытаемся перевести по известным паттернам
          const message = response.data.message;
          if (message.includes('Сессия не найдена') || message.includes('истекла')) {
            errorMessage = t('auth.errors.sessionNotFoundOrExpired', 'Сессия не найдена или истекла');
          } else if (message.includes('истёк') || message.includes('expired')) {
            errorMessage = t('auth.errors.codeExpired', 'Код истёк. Запросите новый');
          } else if (message.includes('Неправильный код') || message.includes('Incorrect code')) {
            errorMessage = t('auth.errors.invalidCode', 'Неправильный код, попробуйте ещё раз');
          }
        }
        
        setError(errorMessage);
        setIsVerifying(false);
        return;
      }

      const { verified, isNewUser, tokens } = response.data.data;

      if (!verified) {
        setError(t('auth.errors.invalidCode', 'Неправильный код, попробуйте ещё раз'));
        // Не очищаем код - оставляем для визуальной проверки с красной обводкой
        setIsVerifying(false);
        return;
      }

      // Сохраняем токены
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Если новый пользователь, переходим на регистрацию/онбординг
      if (isNewUser) {
        navigate(buildPathWithLang('/auth/register', currentLang), {
          state: {
            contact,
            type: contactType,
            token: tokens.accessToken,
          },
        });
      } else {
        // Существующий пользователь - переходим сразу, профиль загружаем в фоне
        const userId = response.data.data.userId || '1';
        const { useAuthStore } = await import('../../store');
        
        // Создаем базовые данные пользователя
        useAuthStore.getState().login(
          {
            id: userId,
            name: contact,
            email: contactType === 'email' ? contact : '',
            phone: contactType === 'phone' ? contact : '',
            avatar: undefined,
          },
          tokens.accessToken,
          tokens.refreshToken
        );
        
        // Переходим на дашборд сразу
        navigate(buildPathWithLang('/dashboard', currentLang));
        
        // Загружаем профиль в фоне без блокировки
        setTimeout(async () => {
          try {
            const { profileApi } = await import('../../services/api/profile');
            const profileResponse = await profileApi.getProfile();
            
            if (profileResponse.data) {
              const userData = profileResponse.data;
              useAuthStore.getState().updateUser({
                id: userId,
                name: userData.name || userData.displayName || contact,
                email: userData.email || '',
                phone: userData.phone || contact,
                avatar: userData.avatar || undefined,
              });
            }
          } catch (error) {
            // Игнорируем ошибку - профиль загрузится на дашборде
            console.warn('Profile load failed, will retry on dashboard');
          }
        }, 100); // Небольшая задержка для плавного перехода
      }
    } catch (err: any) {
      // Переводим сообщения об ошибках с бэкенда
      const errorCode = err.response?.data?.error;
      let errorMessage = err.response?.data?.message || t('auth.errors.genericError', 'Произошла ошибка. Попробуйте ещё раз.');
      
      // Переводим известные коды ошибок
      if (errorCode === 'SESSION_NOT_FOUND') {
        errorMessage = t('auth.errors.sessionNotFoundOrExpired', 'Сессия не найдена или истекла');
      } else if (errorCode === 'CODE_EXPIRED') {
        errorMessage = t('auth.errors.codeExpired', 'Код истёк. Запросите новый');
      } else if (errorCode === 'INVALID_CODE') {
        errorMessage = t('auth.errors.invalidCode', 'Неправильный код, попробуйте ещё раз');
      } else if (err.response?.data?.message) {
        // Если сообщение на русском, пытаемся перевести по известным паттернам
        const message = err.response.data.message;
        if (message.includes('Сессия не найдена') || message.includes('истекла')) {
          errorMessage = t('auth.errors.sessionNotFoundOrExpired', 'Сессия не найдена или истекла');
        } else if (message.includes('истёк') || message.includes('expired')) {
          errorMessage = t('auth.errors.codeExpired', 'Код истёк. Запросите новый');
        } else if (message.includes('Неправильный код') || message.includes('Incorrect code')) {
          errorMessage = t('auth.errors.invalidCode', 'Неправильный код, попробуйте ещё раз');
        }
      }
      
      setError(errorMessage);
      // Не очищаем код - оставляем для визуальной проверки с красной обводкой
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    // Очищаем код и ошибку при нажатии "Попробовать снова"
    setCode('');
    setError(null);
    // Устанавливаем фокус на первое поле ввода
    setTimeout(() => {
      codeInputRef.current?.focus();
    }, 0);
  };

  const handleResend = async () => {
    if (!contact || !contactType) {
      return;
    }

    setCanResend(false);
    setError(null);

    try {
      const response = await authApi.sendCode(contact, contactType, 'sms', sessionId);
      const { sessionId: newSessionId } = response.data.data;

      // Обновляем sessionId в state
      navigate(buildPathWithLang('/auth/verify', currentLang), {
        state: {
          contact,
          type: contactType,
          sessionId: newSessionId,
          exists: state?.exists || false,
        },
        replace: true,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.errors.resendFailed', 'Не удалось отправить код. Попробуйте ещё раз.'));
    }
  };

  const handleBack = () => {
    const lang = currentLang || 'ru';
    navigate(buildPathWithLang('/auth', lang));
  };

  if (!state) {
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
        text: t('auth.footer.text', 'Нажимая «{{button}}», вы принимаете', { 
          button: error ? t('auth.retry', 'Попробовать снова') : t('auth.continue', 'Продолжить') 
        }),
        links: [
          { href: '/terms', text: t('auth.footer.terms', 'пользовательское соглашение') },
          { href: '/privacy', text: t('auth.footer.privacy', 'политику конфиденциальности') },
        ],
        additionalText: t('auth.footer.dataTransfer', 'Передаваемые данные'),
        additionalLink: { href: '/privacy#data', text: t('auth.footer.dataTransfer', 'Передаваемые данные') },
      }}
    >
      <div 
        className="w-full space-y-6"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && code.length === 6 && !isVerifying) {
            handleCodeComplete(code);
          }
        }}
      >
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-1">
            {t('auth.verifyCode.title', 'Введите')}
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            {t('auth.verifyCode.titleField', 'код подтверждения')}
          </h2>
          <div className="space-y-2 mb-4">
            <p className="text-base sm:text-lg text-text-secondary">
              {t('auth.verifyCode.description', 'Мы отправили 6-значный код подтверждения')}
            </p>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Icon name="phone" size="sm" color="rgb(var(--color-primary))" />
              <span>
                {t('auth.verifyCode.subtitle', 'на')} <span className="font-semibold text-text-primary">{masked}</span>
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {t('auth.verifyCode.hint', 'Введите код из SMS сообщения')}
            </p>
          </div>
        </div>

        <CodeInput
          ref={codeInputRef}
          length={6}
          onComplete={handleCodeComplete}
          onChange={(c) => setCode(c)}
          value={code}
          error={error || undefined}
          autoFocus
          disabled={isVerifying}
        />

        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            if (error) {
              handleRetry();
            } else {
              handleCodeComplete(code);
            }
          }}
          loading={isVerifying}
          className="shadow-lg hover:shadow-xl"
        >
          {error ? t('auth.retry', 'Попробовать снова') : t('auth.continue', 'Продолжить')}
        </Button>

        <ResendTimer
          initialSeconds={60}
          onResend={handleResend}
          disabled={!canResend}
        />
      </div>
    </AuthPageLayout>
  );
};

export default VerifyCodePage;
