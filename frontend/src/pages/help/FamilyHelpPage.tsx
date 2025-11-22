import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpArticlePage } from './HelpArticlePage';
import { themeClasses } from '../../design-system/utils/themeClasses';

const FamilyHelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelpArticlePage
      title={t('help.family.title', 'Семейная группа')}
      sections={[]}
    >
      <div className={themeClasses.typography.prose}>
        <p className={`${themeClasses.typographySize.bodyLarge} ${themeClasses.text.secondary}`}>
          {t('help.family.content', 'Содержимое страницы семейной группы будет добавлено позже.')}
        </p>
      </div>
    </HelpArticlePage>
  );
};

export default FamilyHelpPage;

