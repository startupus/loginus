import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';
import { themeClasses } from '../../design-system/utils/themeClasses';

const SecurityHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.security.title', 'Защита аккаунта')}
      sections={[]}
    >
      <div className={themeClasses.typography.prose}>
        <p className={`${themeClasses.typographySize.bodyLarge} ${themeClasses.text.secondary}`}>
          {t('help.security.content', 'Содержимое страницы защиты аккаунта будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default SecurityHelpPage;

