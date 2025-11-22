import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';
import { themeClasses } from '../../design-system/utils/themeClasses';

const RegistrationHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.registration.title', 'Регистрация аккаунта')}
      sections={[]}
    >
      <div className={themeClasses.typography.prose}>
        <p className={`${themeClasses.typographySize.bodyLarge} ${themeClasses.text.secondary}`}>
          {t('help.registration.content', 'Содержимое страницы регистрации аккаунта будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default RegistrationHelpPage;

