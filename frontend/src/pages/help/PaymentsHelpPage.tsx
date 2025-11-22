import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';
import { themeClasses } from '../../design-system/utils/themeClasses';

const PaymentsHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.payments.title', 'Loginus Пэй')}
      sections={[]}
    >
      <div className={themeClasses.typography.prose}>
        <p className={`${themeClasses.typographySize.bodyLarge} ${themeClasses.text.secondary}`}>
          {t('help.payments.content', 'Содержимое страницы Loginus Пэй будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default PaymentsHelpPage;

