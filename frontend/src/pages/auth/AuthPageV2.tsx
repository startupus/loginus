import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthPageLayout } from '../../design-system/composites/AuthPageLayout';
import { Logo } from '../../design-system/primitives/Logo';
import { authFlowApi } from '../../services/api/auth-flow';
import { useLanguageStore } from '../../store';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';
import { StepRenderer, StepData } from '../../components/auth/StepRenderer';
import { authTokens } from '../../utils/authTokens';
import { useAuthStore } from '../../store';
import { ForgotPasswordModal } from '../../components/Modals/ForgotPasswordModal';
import { useModal } from '../../hooks/useModal';

/**
 * AuthPageV2 - страница авторизации с пошаговым динамическим рендерингом
 * Поддерживает конфигурацию из AuthFlowBuilderPage
 */
export const AuthPageV2: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  const { login } = useAuthStore();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<StepData | null>(null);
  const [tempData, setTempData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [flowType, setFlowType] = useState<'login' | 'registration'>('login');
  const forgotPasswordModal = useModal();
  const [userEmailForRecovery, setUserEmailForRecovery] = useState<string | undefined>(undefined);

  // Загружаем публичную конфигурацию Auth Flow
  const { data: publicAuthFlow } = useQuery({
    queryKey: ['auth-flow-public'],
    queryFn: async () => {
      try {
        const response = await authFlowApi.getPublicAuthFlow();
        return (response.data as any)?.data || response.data;
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AuthPageV2] Failed to load public auth flow config:', e);
        }
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  // Получаем первый шаг из конфигурации
  const getFirstStep = () => {
    if (!publicAuthFlow) return null;
    const steps = flowType === 'login' ? publicAuthFlow.login : publicAuthFlow.registration;
    if (!steps || steps.length === 0) return null;
    const enabledSteps = steps.filter((s: any) => s.enabled !== false).sort((a: any, b: any) => a.order - b.order);
    return enabledSteps.length > 0 ? enabledSteps[0] : null;
  };

  // Мутация для выполнения шага входа
  const loginStepMutation = useMutation({
    mutationFn: async (data: { stepId: string; sessionId?: string; data: any }) => {
      const response = await authFlowApi.loginStep(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Если пользователь не найден, автоматически переключаемся на регистрацию
      if (data.requiresRegistration) {
        setFlowType('registration');
        setTempData({ ...tempData, ...data.tempData });
        // Инициализируем регистрацию с теми же данными
        const registrationSteps = publicAuthFlow?.registration || [];
        const firstRegStep = registrationSteps
          .filter((s: any) => s.enabled !== false)
          .sort((a: any, b: any) => a.order - b.order)[0];
        if (firstRegStep) {
          setCurrentStep({
            id: firstRegStep.id,
            name: firstRegStep.name,
            type: firstRegStep.type,
            stepType: firstRegStep.stepType || '',
          });
          // Создаем новую сессию для регистрации
          const newSessionId = `register-session-${Date.now()}-${Math.random()}`;
          setSessionId(newSessionId);
          // Вызываем первый шаг регистрации напрямую
          // Используем setTimeout, чтобы убедиться, что currentStep обновлен
          setTimeout(() => {
            registerStepMutation.mutate({
              stepId: firstRegStep.id,
              sessionId: newSessionId,
              data: { contact: data.tempData?.contact, type: data.tempData?.type },
            });
          }, 0);
        }
        return;
      }
      
      if (data.completed && data.accessToken) {
        // Вход завершен, сохраняем токены
        authTokens.setAccessToken(data.accessToken);
        if (data.refreshToken) {
          authTokens.setRefreshToken(data.refreshToken);
        }
        // Обновляем authStore
        if (data.user) {
          const userName = data.user.name || 
            `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || 
            data.user.email || 
            'User';
          login(
            {
              id: data.user.id,
              name: userName,
              email: data.user.email || '',
              phone: data.user.phone || '',
              avatar: data.user.avatar || undefined,
              role: (data.user.role as any) || 'user',
              companyId: data.user.companyId || null,
              permissions: data.user.permissions || [],
            },
            data.accessToken,
            data.refreshToken || ''
          );
        }
        navigate(buildPathWithLang('/dashboard', currentLang));
      } else if (data.nextStep) {
        // Переход к следующему шагу
        setSessionId(data.sessionId || sessionId);
        // nextStep может быть строкой или объектом
        const nextStepId = typeof data.nextStep === 'string' ? data.nextStep : data.nextStep.id;
        const steps = publicAuthFlow?.login || [];
        const nextStepInfo = steps.find((s: any) => s.id === nextStepId);
        setCurrentStep({
          id: nextStepId,
          name: nextStepInfo?.name || (typeof data.nextStep === 'object' ? data.nextStep.name : ''),
          type: nextStepInfo?.type || (typeof data.nextStep === 'object' ? data.nextStep.type : ''),
          stepType: nextStepInfo?.stepType || '',
        });
        setTempData({ ...tempData, ...data.tempData });
        setError(null);
      } else if (data.message) {
        setError(data.message);
      }
    },
    onError: (err: any) => {
      let errorMessage = t('auth.errors.genericError', 'Произошла ошибка. Попробуйте ещё раз.');
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    },
  });

  // Мутация для выполнения шага регистрации
  const registerStepMutation = useMutation({
    mutationFn: async (data: { stepId: string; sessionId?: string; data: any }) => {
      const response = await authFlowApi.registerStep(data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.completed && data.accessToken) {
        // Регистрация завершена, сохраняем токены
        authTokens.setAccessToken(data.accessToken);
        if (data.refreshToken) {
          authTokens.setRefreshToken(data.refreshToken);
        }
        // Обновляем authStore
        if (data.user) {
          const userName = data.user.name || 
            `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || 
            data.user.email || 
            'User';
          login(
            {
              id: data.user.id,
              name: userName,
              email: data.user.email || '',
              phone: data.user.phone || '',
              avatar: data.user.avatar || undefined,
              role: (data.user.role as any) || 'user',
              companyId: data.user.companyId || null,
              permissions: data.user.permissions || [],
            },
            data.accessToken,
            data.refreshToken || ''
          );
        }
        navigate(buildPathWithLang('/dashboard', currentLang));
      } else if (data.nextStep) {
        // Переход к следующему шагу
        setSessionId(data.sessionId || sessionId);
        const nextStepId = typeof data.nextStep === 'string' ? data.nextStep : data.nextStep.id;
        const steps = publicAuthFlow?.registration || [];
        const nextStepInfo = steps.find((s: any) => s.id === nextStepId);
        setCurrentStep({
          id: nextStepId,
          name: nextStepInfo?.name || (typeof data.nextStep === 'object' ? data.nextStep.name : ''),
          type: nextStepInfo?.type || (typeof data.nextStep === 'object' ? data.nextStep.type : ''),
          stepType: nextStepInfo?.stepType || '',
        });
        setTempData({ ...tempData, ...data.tempData });
        setError(null);
      } else if (!data.nextStep && data.sessionId && data.tempData) {
        // Если нет следующего шага, но есть sessionId и tempData, значит это первый шаг и он уже обработан
        // Нужно получить следующий шаг из конфигурации
        setSessionId(data.sessionId);
        setTempData({ ...tempData, ...data.tempData });
        const steps = publicAuthFlow?.registration || [];
        const currentStepId = currentStep?.id;
        if (currentStepId) {
          const currentStepIndex = steps.findIndex((s: any) => s.id === currentStepId);
          if (currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
            const nextStepInfo = steps[currentStepIndex + 1];
            setCurrentStep({
              id: nextStepInfo.id,
              name: nextStepInfo.name,
              type: nextStepInfo.type,
              stepType: nextStepInfo.stepType || '',
            });
          }
        }
        setError(null);
      } else if (data.message) {
        setError(data.message);
      }
    },
    onError: (err: any) => {
      let errorMessage = t('auth.errors.genericError', 'Произошла ошибка. Попробуйте ещё раз.');
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    },
  });

  // Инициализируем первый шаг из конфигурации
  useEffect(() => {
    // Не инициализируем, если уже есть шаг или сессия
    if (currentStep || sessionId) return;
    
    // Ждём загрузки конфигурации
    if (!publicAuthFlow) return;
    
    const firstStep = getFirstStep();
    if (firstStep) {
      setCurrentStep({
        id: firstStep.id,
        name: firstStep.name,
        type: firstStep.type,
        stepType: firstStep.stepType,
      });
    }
  }, [publicAuthFlow, flowType, currentStep, sessionId]);

  // Проверяем, есть ли в state данные о типе flow (из навигации)
  useEffect(() => {
    if (location.state?.flowType) {
      setFlowType(location.state.flowType);
    }
  }, [location.state]);

  const handleStepComplete = (data: Record<string, any>) => {
    if (!currentStep) return;

    // Объединяем tempData из предыдущих шагов с данными текущего шага
    const combinedData = { ...tempData, ...data };
    setTempData(combinedData);

    console.log('🔍 [AuthPageV2] handleStepComplete:', {
      stepId: currentStep.id,
      flowType,
      data: JSON.stringify(data),
      tempData: JSON.stringify(tempData),
      combinedData: JSON.stringify(combinedData)
    });

    // Вызываем loginStep или registerStep напрямую (не нужна отдельная инициализация)
    if (flowType === 'login') {
      loginStepMutation.mutate({
        stepId: currentStep.id,
        sessionId: sessionId || undefined,
        data: combinedData,
      });
    } else {
      registerStepMutation.mutate({
        stepId: currentStep.id,
        sessionId: sessionId || undefined,
        data: combinedData,
      });
    }
  };

  const enabledSocialMethodIds =
    publicAuthFlow?.login
      ?.filter((m: any) => m.enabled === true)
      .filter((m: any) =>
        ['github', 'telegram', 'gosuslugi', 'tinkoff', 'qr', 'yandex', 'saber'].includes(m.id),
      )
      .map((m: any) => m.id) || [];

  const isLoading = loginStepMutation.isPending || registerStepMutation.isPending;

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
        text: t('auth.footer.text', 'Нажимая «{{button}}», вы принимаете', {
          button: t('auth.continue', 'Продолжить'),
        }),
        links: [
          { href: '/terms', text: t('auth.footer.terms', 'пользовательское соглашение') },
          { href: '/privacy', text: t('auth.footer.privacy', 'политику конфиденциальности') },
        ],
        additionalText: t('auth.footer.dataTransfer', 'Передаваемые данные'),
        additionalLink: {
          href: '/privacy#data',
          text: t('auth.footer.dataTransfer', 'Передаваемые данные'),
        },
      }}
      background="default"
    >
      <div className="flex flex-col min-h-full">
        <div className="w-full space-y-6 pb-6">
          {currentStep ? (
            <StepRenderer
              step={currentStep}
              onComplete={handleStepComplete}
              isLoading={isLoading}
              error={error}
              tempData={tempData}
              flowType={flowType}
              onForgotPassword={() => {
                // Сохраняем email из tempData для восстановления пароля
                const email = tempData?.contact || tempData?.email;
                setUserEmailForRecovery(email);
                forgotPasswordModal.open();
              }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('auth.loading', 'Загрузка...')}</p>
            </div>
          )}

        </div>

        {enabledSocialMethodIds.length > 0 && (
          <div className="mt-auto -mx-6 sm:-mx-8 -mb-6 sm:-mb-8">
            <SocialAuthButtons enabledMethods={enabledSocialMethodIds} />
          </div>
        )}
      </div>

      {/* Модальное окно восстановления пароля */}
      {forgotPasswordModal.isOpen && (
        <ForgotPasswordModal
          isOpen={forgotPasswordModal.isOpen}
          onClose={forgotPasswordModal.close}
          userEmail={userEmailForRecovery}
          onSuccess={() => {
            forgotPasswordModal.close();
          }}
        />
      )}
    </AuthPageLayout>
  );
};

export default AuthPageV2;

