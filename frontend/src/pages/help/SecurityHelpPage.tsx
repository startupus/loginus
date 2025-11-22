import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';

const SecurityHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.security.title', 'Защита аккаунта')}
      sections={[]}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="text-lg text-text-secondary">
          {t('help.security.content', 'Содержимое страницы защиты аккаунта будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default SecurityHelpPage;

