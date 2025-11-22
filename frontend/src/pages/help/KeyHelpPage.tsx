import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';
import { themeClasses } from '../../design-system/utils/themeClasses';

const KeyHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.key.title', 'Loginus Ключ')}
      sections={[]}
    >
      <div className={themeClasses.typography.prose}>
        <p className={`${themeClasses.typographySize.bodyLarge} ${themeClasses.text.secondary}`}>
          {t('help.key.content', 'Содержимое страницы Loginus Ключ будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default KeyHelpPage;

