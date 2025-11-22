import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';

const RegistrationHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.registration.title', 'Регистрация аккаунта')}
      sections={[]}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="text-lg text-text-secondary">
          {t('help.registration.content', 'Содержимое страницы регистрации аккаунта будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default RegistrationHelpPage;

