import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from '../../design-system/layouts/LandingHeader';
import { LandingFooter } from '../../design-system/layouts/LandingFooter';
import { Icon } from '../../design-system/primitives/Icon';
import { Button } from '../../design-system/primitives/Button';
import { useLanguageStore } from '../../store';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { changeLanguage } from '../../services/i18n/config';
import { HelpSidebar } from './HelpSidebar';

export interface ArticleSection {
  id: string;
  title: string;
}

export interface HelpArticlePageProps {
  title: string;
  sections: ArticleSection[];
  children: React.ReactNode;
  prevArticle?: {
    title: string;
    href: string;
  };
  nextArticle?: {
    title: string;
    href: string;
  };
}

export const HelpArticlePage: React.FC<HelpArticlePageProps> = ({
  title,
  sections,
  children,
  prevArticle,
  nextArticle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { setLanguage, language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  const [activeSection, setActiveSection] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = async () => {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    await changeLanguage(newLang);
    
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/[^/]+/, '') || '/';
    const newPath = buildPathWithLang(pathWithoutLang, newLang);
    navigate(newPath, { replace: true });
  };

  // Отслеживание активной секции при скролле
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const sections = contentRef.current.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 150; // Offset для sticky header

      let currentSection = '';
      sections.forEach((section) => {
        const element = section as HTMLElement;
        if (element.offsetTop <= scrollPosition) {
          currentSection = element.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Прокрутка к секции при клике на мини-оглавление
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      
      // Обновляем URL без перезагрузки страницы
      window.history.pushState(null, '', `#${sectionId}`);
    }
  };

  return (
    <div className={themeClasses.page.container}>
      {/* Header */}
      <LandingHeader
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLang}
        showThemeSwitcher={true}
        showLoginButton={true}
        onLoginClick={() => {
          const lang = currentLang || 'ru';
          const path = buildPathWithLang('/auth', lang);
          navigate(path);
        }}
        navItems={[
          { label: t('landing.nav.about', 'О Loginus ID'), href: buildPathWithLang('/about', currentLang) },
          { label: t('landing.nav.features', 'Возможности'), href: buildPathWithLang('/features', currentLang) },
          { label: t('landing.nav.help', 'Справка'), href: buildPathWithLang('/help', currentLang) },
        ]}
      />

      {/* Main Content */}
      <main className={themeClasses.layout.mainContent}>
        <div className={`${themeClasses.layout.flexRow} ${themeClasses.container.maxWidth}`}>
          {/* Sidebar Navigation */}
          <HelpSidebar currentPath={location.pathname} />

          {/* Article Content */}
          <div className={`${themeClasses.utility.flex1} ${themeClasses.utility.minW0}`}>
            <div className={themeClasses.layout.flexRow}>
              {/* Main Article */}
              <article className={`${themeClasses.utility.flex1} ${themeClasses.utility.minW0} ${themeClasses.utility.maxW3xl}`} ref={contentRef}>
                <h1 className={`${themeClasses.typographySize.h1} ${themeClasses.text.primary} ${themeClasses.spacing.mb8}`}>
                  {title}
                </h1>
                {children}

                {/* CTA - Написать в службу поддержки */}
                <div className={`${themeClasses.spacing.mt12} ${themeClasses.spacing.pt8} ${themeClasses.border.top}`}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const lang = currentLang || 'ru';
                      navigate(buildPathWithLang('/support', lang));
                    }}
                    leftIcon={<Icon name="message-circle" size="sm" />}
                  >
                    {t('help.cta.contactSupport', 'Написать в службу поддержки')}
                  </Button>
                </div>

                {/* Feedback - Была ли статья полезна? */}
                <div className={`${themeClasses.spacing.mt8} ${themeClasses.spacing.pt8} ${themeClasses.border.top}`}>
                  <p className={`${themeClasses.typographySize.bodySmall} ${themeClasses.typographySize.medium} ${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
                    {t('help.feedback.question', 'Была ли статья полезна?')}
                  </p>
                  {!feedbackSubmitted ? (
                    <div className={`${themeClasses.utility.flex} ${themeClasses.spacing.gap3}`}>
                      <Button
                        variant={wasHelpful === true ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setWasHelpful(true);
                          setFeedbackSubmitted(true);
                          // TODO: Отправить фидбек на сервер
                        }}
                      >
                        {t('help.feedback.yes', 'Да')}
                      </Button>
                      <Button
                        variant={wasHelpful === false ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setWasHelpful(false);
                          setFeedbackSubmitted(true);
                          // TODO: Отправить фидбек на сервер
                        }}
                      >
                        {t('help.feedback.no', 'Нет')}
                      </Button>
                    </div>
                  ) : (
                    <p className={`${themeClasses.typographySize.bodySmall} ${themeClasses.text.secondary}`}>
                      {t('help.feedback.thankYou', 'Спасибо за ваш отзыв!')}
                    </p>
                  )}
                </div>

                {/* Navigation - Предыдущая/Следующая статьи */}
                {(prevArticle || nextArticle) && (
                  <div className={`${themeClasses.spacing.mt8} ${themeClasses.spacing.pt8} ${themeClasses.border.top} ${themeClasses.utility.flexColSmRow} ${themeClasses.utility.justifyBetween} ${themeClasses.spacing.gap3}`}>
                    {prevArticle && (
                      <a
                        href={buildPathWithLang(prevArticle.href, currentLang)}
                        className={`${themeClasses.layout.centered} ${themeClasses.spacing.gap3} ${themeClasses.typographySize.bodySmall} ${themeClasses.text.secondary} ${themeClasses.text.hoverPrimary} ${themeClasses.utility.transitionColors} group`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(buildPathWithLang(prevArticle.href, currentLang));
                        }}
                      >
                        <Icon name="chevron-left" size="sm" className={`${themeClasses.utility.groupHoverTranslateXLeft} ${themeClasses.utility.transitionTransform}`} />
                        <div>
                          <span className={`block ${themeClasses.typographySize.bodyXSmall} ${themeClasses.text.secondary} ${themeClasses.spacing.mb3}`}>
                            {t('help.navigation.prev', 'Предыдущая')}
                          </span>
                          <span className={themeClasses.typographySize.medium}>{prevArticle.title}</span>
                        </div>
                      </a>
                    )}
                    {nextArticle && (
                      <a
                        href={buildPathWithLang(nextArticle.href, currentLang)}
                        className={`${themeClasses.layout.centered} ${themeClasses.spacing.gap3} ${themeClasses.typographySize.bodySmall} ${themeClasses.text.secondary} ${themeClasses.text.hoverPrimary} ${themeClasses.utility.transitionColors} group ${
                          !prevArticle ? themeClasses.spacing.mlAuto : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(buildPathWithLang(nextArticle.href, currentLang));
                        }}
                      >
                        <div className={themeClasses.layout.textRight}>
                          <span className={`block ${themeClasses.typographySize.bodyXSmall} ${themeClasses.text.secondary} ${themeClasses.spacing.mb3}`}>
                            {t('help.navigation.next', 'Следующая')}
                          </span>
                          <span className={themeClasses.typographySize.medium}>{nextArticle.title}</span>
                        </div>
                        <Icon name="chevron-right" size="sm" className={`${themeClasses.utility.groupHoverTranslateXRight} ${themeClasses.utility.transitionTransform}`} />
                      </a>
                    )}
                  </div>
                )}
              </article>

              {/* Mini Table of Contents - справа от статьи */}
              {sections.length > 0 && (
                <aside className={`${themeClasses.utility.hiddenLgBlock} ${themeClasses.utility.w64} ${themeClasses.utility.flexShrink0}`}>
                  <nav 
                    className={`dc-mini-toc ${themeClasses.utility.sticky}`}
                    aria-label={t('help.toc.label', 'Навигация по статье')}
                  >
                    <h2 className={`dc-mini-toc__title ${themeClasses.typographySize.bodySmall} ${themeClasses.typographySize.semibold} ${themeClasses.text.primary} ${themeClasses.spacing.mb4}`}>
                      {t('help.toc.title', 'В этой статье:')}
                    </h2>
                    <ul className={`dc-mini-toc__sections ${themeClasses.spacing.spaceY1}`} aria-label={t('help.toc.sections', 'Содержание текущей статьи')}>
                      {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                          <li 
                            key={section.id}
                            data-hash={`#${section.id}`}
                            className={`dc-mini-toc__section relative ${themeClasses.spacing.pl4} ${isActive ? 'dc-mini-toc__section_active' : ''}`}
                          >
                            {/* Левая вертикальная линия - индикатор */}
                            <div 
                              className={`${themeClasses.utility.absolute} ${themeClasses.utility.left0} ${themeClasses.utility.top0} ${themeClasses.utility.bottom0} ${themeClasses.utility.w0_5} transition-all ${
                                isActive 
                                  ? `${themeClasses.background.primary} ${themeClasses.utility.w1}` 
                                  : `${themeClasses.background.border} ${themeClasses.utility.opacity30}`
                              }`}
                            />
                            <a
                              href={`#${section.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                scrollToSection(section.id);
                              }}
                                    className={`dc-mini-toc__section-link block ${themeClasses.spacing.px3} ${themeClasses.spacing.py2} ${themeClasses.typographySize.bodySmall} ${themeClasses.utility.transitionColors} ${
                                isActive
                                  ? `${themeClasses.typographySize.medium} ${themeClasses.text.primary}`
                                  : `${themeClasses.text.secondary} ${themeClasses.text.hoverPrimary}`
                              }`}
                            >
                              {section.title}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="dc-mini-toc__bottom"></div>
                  </nav>
                </aside>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

