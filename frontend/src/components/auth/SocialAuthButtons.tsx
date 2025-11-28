import React from 'react';
import { useTranslation } from 'react-i18next';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { getAuthMethodIcon, isHorizontalLogo } from '../../utils/authMethodIcons';

interface SocialAuthButtonsProps {
  /**
   * Список ID методов, разрешённых алгоритмом авторизации.
   * Если не передан, показываем все провайдеры.
   */
  enabledMethods?: string[];
}

/**
 * Компонент для отображения альтернативных способов входа через социальные сети
 * Минималистичные квадратные плитки с иконками
 */
export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ enabledMethods }) => {
  const { t } = useTranslation();

  const socialProviders = [
    {
      id: 'github',
      name: t('auth.socialAuth.github', 'Github'),
      span: 1,
      icon: getAuthMethodIcon('github'),
    },
    {
      id: 'telegram',
      name: t('auth.socialAuth.telegram', 'Telegram'),
      span: 1,
      icon: getAuthMethodIcon('telegram'),
    },
    {
      id: 'gosuslugi',
      name: t('auth.socialAuth.gosuslugi', 'Gosuslugi'),
      span: 1,
      icon: getAuthMethodIcon('gosuslugi'),
    },
    {
      id: 'tinkoff',
      name: t('auth.socialAuth.tinkoff', 'Tinkoff id'),
      span: 1,
      icon: getAuthMethodIcon('tinkoff'),
    },
    {
      id: 'qr-code',
      name: t('auth.socialAuth.qrCode', 'QR Code'),
      span: 1,
      icon: getAuthMethodIcon('qr-code'),
    },
    {
      id: 'password',
      name: t('auth.socialAuth.password', 'Password'),
      span: 1,
      icon: getAuthMethodIcon('password'),
    },
    {
      id: 'yandex',
      name: t('auth.socialAuth.yandex', 'Yandex id'),
      span: 3,
      icon: getAuthMethodIcon('yandex'),
    },
    {
      id: 'saber',
      name: t('auth.socialAuth.saber', 'Saber id'),
      span: 3,
      icon: getAuthMethodIcon('saber'),
    },
  ];

  const handleSocialAuth = (providerId: string) => {
    // TODO: Реализовать авторизацию через социальные сети
    console.log(t('auth.socialAuth.loggingIn', 'Logging in through'), providerId);
  };

  const activeProviders = enabledMethods && enabledMethods.length > 0
    ? socialProviders.filter((provider) => {
        const methodId = provider.id === 'qr-code' ? 'qr' : provider.id;
        return enabledMethods.includes(methodId);
      })
    : socialProviders;

  if (activeProviders.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${themeClasses.background.gray2} p-4 border-t ${themeClasses.border.default} rounded-b-lg`}>
      <p className={`text-sm ${themeClasses.text.secondary} mb-3 text-center`}>
        {t('auth.socialAuth.title', 'Или войдите через')}
      </p>
      <div className="grid grid-cols-6 gap-3">
        {activeProviders.map((provider) => {
          // Горизонтальные логотипы требуют большего размера
          const iconSizeClass = isHorizontalLogo(provider.id) ? 'w-full h-full max-w-[95%] max-h-[95%]' : 'w-8 h-8';
          
          return (
            <button
              key={provider.id}
              onClick={() => handleSocialAuth(provider.id)}
              className={`aspect-square flex items-center justify-center p-2 rounded-lg ${themeClasses.border.default} ${themeClasses.card.default} ${themeClasses.active.navItemInactive} transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
              aria-label={t(`auth.socialAuth.${provider.id}`, provider.name)}
              title={provider.name}
            >
              <div className={`${iconSizeClass} ${themeClasses.text.secondary} flex items-center justify-center`}>
                {provider.icon}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

