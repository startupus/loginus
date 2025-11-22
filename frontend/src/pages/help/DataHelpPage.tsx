import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';

const DataHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.data.title', 'Данные')}
      sections={[]}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="text-lg text-text-secondary">
          {t('help.data.content', 'Содержимое страницы данных будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default DataHelpPage;

