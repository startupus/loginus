import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';

const KeyHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.key.title', 'Loginus Ключ')}
      sections={[]}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="text-lg text-text-secondary">
          {t('help.key.content', 'Содержимое страницы Loginus Ключ будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default KeyHelpPage;

