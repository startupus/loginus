import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthPageLayout } from '../../design-system/composites/AuthPageLayout';
import { ContactDisplay } from '../../design-system/composites/ContactDisplay';
import { Button } from '../../design-system/primitives/Button';
import { Logo } from '../../design-system/primitives/Logo';
import { useLanguageStore } from '../../store';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

interface LocationState {
  contact: string;
  type: 'phone' | 'email';
  token: string;
}

/**
 * RegisterPage - страница подтверждения создания аккаунта
 */
export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  const state = location.state as LocationState | null;

  const contact = state?.contact || '';
  const contactType = state?.type || 'phone';

  const handleCreateAccount = () => {
    // Переходим на онбординг
    navigate(buildPathWithLang('/onboarding', currentLang), {
      state: {
        contact,
        type: contactType,
        token: state?.token,
      },
    });
  };

  const handleChangeContact = () => {
    navigate(buildPathWithLang('/auth', currentLang));
  };

  if (!state) {
    navigate(buildPathWithLang('/auth', currentLang));
    return null;
  }

  return (
    <AuthPageLayout
      header={{
        showBack: true,
        onBack: () => {
          const lang = currentLang || 'ru';
          navigate(buildPathWithLang('/auth', lang));
        },
        logo: <Logo size="md" showText={false} />,
      }}
    >
      <div 
        className="w-full space-y-6"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleCreateAccount();
          }
        }}
      >
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark dark:text-white mb-3">
            {t('auth.register.title', 'Создаём ваш аккаунт')}
          </h1>
          <p className="text-base sm:text-lg text-body-color dark:text-dark-6">
            {t('auth.register.subtitle', 'Аккаунта с этим номером не найдено. Мы создадим новый аккаунт автоматически.')}
          </p>
        </div>

        <ContactDisplay
          contact={contact}
          type={contactType}
          showChange
          onChangeClick={handleChangeContact}
        />

        <Button
          variant="primary"
          fullWidth
          onClick={handleCreateAccount}
        >
          {t('auth.register.createAccount', 'Создать аккаунт')}
        </Button>
      </div>
    </AuthPageLayout>
  );
};

export default RegisterPage;
