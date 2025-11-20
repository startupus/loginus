import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { themeClasses } from '../../utils/themeClasses';

export interface FooterProps {
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * Footer - Футер приложения
 */
export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const currentLang = useCurrentLanguage();
  
  return (
    <footer className={`${themeClasses.background.surfaceElevated} mt-auto ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-text-secondary">
            © 2001–{currentYear} {t('footer.copyright', 'Loginus')}
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <a
              href={buildPathWithLang('/help', currentLang)}
              className="text-sm text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
            >
              {t('footer.support', 'Справка')}
            </a>
            <a
              href={buildPathWithLang('/oauth', currentLang)}
              className="text-sm text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
            >
              {t('footer.oauth', 'Loginus ID для сайта')}
            </a>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
            >
              {t('footer.terms', 'Условия использования')}
            </a>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
            >
              {t('footer.privacy', 'Конфиденциальность')}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

