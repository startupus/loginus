import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';

const FamilyHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.family.title', 'Семейная группа')}
      sections={[]}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="text-lg text-text-secondary">
          {t('help.family.content', 'Содержимое страницы семейной группы будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default FamilyHelpPage;

