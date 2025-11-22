import React from 'react';
import { useTranslation } from 'react-i18next';
import { useClientSafe } from '../../contexts';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { themeClasses } from '../../utils/themeClasses';

export interface LandingFooterProps {
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * LandingFooter - Футер для landing страниц (Help, About, Features)
 * Отличается от обычного Footer наличием логотипа и другими ссылками
 */
export const LandingFooter: React.FC<LandingFooterProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { client, hasFeature } = useClientSafe();
  const currentLang = useCurrentLanguage() || 'ru';
  
  // Клиентский брендинг
  const customLogo = client?.branding?.logo;
  const showAboutLink = hasFeature('footer-about-link') !== false; // По умолчанию показываем
  const showPrivacyLink = hasFeature('footer-privacy-link') !== false;
  const showTermsLink = hasFeature('footer-terms-link') !== false;
  
  return (
    <footer className={`${themeClasses.utility.footerBorder} ${themeClasses.border.top} ${themeClasses.background.default} ${themeClasses.utility.footerPadding} ${className}`}>
      <div className={themeClasses.container.standard}>
        <div className={themeClasses.layout.spaceBetween}>
          <div className={`${themeClasses.layout.centered} ${themeClasses.spacing.gap3}`}>
            {customLogo ? (
              <img 
                src={customLogo} 
                alt={client?.name || 'Logo'} 
                className={themeClasses.utility.imageLogo}
              />
            ) : (
              <div className={themeClasses.logo.footer}>
                <span className={`${themeClasses.utility.textSm} ${themeClasses.typographySize.extrabold} ${themeClasses.typographySize.leadingNone}`}>iD</span>
              </div>
            )}
            <p className={`${themeClasses.utility.textSm} ${themeClasses.text.secondary}`}>
              {(() => {
                const projectStartYear = 2025;
                const currentYear = new Date().getFullYear();
                const yearRange = currentYear === projectStartYear 
                  ? projectStartYear.toString() 
                  : `${projectStartYear} - ${currentYear}`;
                return t('landing.footer.copyright', '© {{year}} Loginus ID. Все права защищены.', { year: yearRange });
              })()}
            </p>
          </div>
          <div className={`${themeClasses.utility.flex} ${themeClasses.spacing.gap8}`}>
            {showAboutLink && (
              <a href={buildPathWithLang('/about', currentLang)} className={`${themeClasses.typographySize.bodySmall} ${themeClasses.typographySize.medium} ${themeClasses.link.secondary}`}>
                {t('landing.footer.links.about', 'О проекте')}
              </a>
            )}
            {showPrivacyLink && (
              <a href={buildPathWithLang('/privacy', currentLang)} className={`${themeClasses.typographySize.bodySmall} ${themeClasses.typographySize.medium} ${themeClasses.link.secondary}`}>
                {t('landing.footer.links.privacy', 'Конфиденциальность')}
              </a>
            )}
            {showTermsLink && (
              <a href={buildPathWithLang('/terms', currentLang)} className={`${themeClasses.typographySize.bodySmall} ${themeClasses.typographySize.medium} ${themeClasses.link.secondary}`}>
                {t('landing.footer.links.terms', 'Условия')}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

