import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';
import { themeClasses } from '../../design-system/utils/themeClasses';

const RecoveryHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.recovery.title', 'Восстановление доступа')}
      sections={[]}
    >
      <div className={themeClasses.typography.prose}>
        <p className={`${themeClasses.typographySize.bodyLarge} ${themeClasses.text.secondary}`}>
          {t('help.recovery.content', 'Содержимое страницы восстановления доступа будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default RecoveryHelpPage;

