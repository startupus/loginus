import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';

const RecoveryHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.recovery.title', 'Восстановление доступа')}
      sections={[]}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="text-lg text-text-secondary">
          {t('help.recovery.content', 'Содержимое страницы восстановления доступа будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default RecoveryHelpPage;

