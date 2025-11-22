import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';

const PaymentsHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.payments.title', 'Loginus Пэй')}
      sections={[]}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="text-lg text-text-secondary">
          {t('help.payments.content', 'Содержимое страницы Loginus Пэй будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default PaymentsHelpPage;

