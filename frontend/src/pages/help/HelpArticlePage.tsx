import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from '../../design-system/layouts/LandingHeader';
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
      <main className="container mx-auto px-4 pt-24 pb-20 lg:pt-28">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <HelpSidebar currentPath={location.pathname} />

          {/* Article Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Article */}
              <article className="flex-1 min-w-0 max-w-3xl" ref={contentRef}>
                <h1 className="text-4xl font-bold text-text-primary mb-8 lg:text-5xl">
                  {title}
                </h1>
                {children}

                {/* CTA - Написать в службу поддержки */}
                <div className="mt-12 pt-8 border-t border-border">
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
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm font-medium text-text-secondary mb-4">
                    {t('help.feedback.question', 'Была ли статья полезна?')}
                  </p>
                  {!feedbackSubmitted ? (
                    <div className="flex gap-3">
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
                    <p className="text-sm text-text-secondary">
                      {t('help.feedback.thankYou', 'Спасибо за ваш отзыв!')}
                    </p>
                  )}
                </div>

                {/* Navigation - Предыдущая/Следующая статьи */}
                {(prevArticle || nextArticle) && (
                  <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between gap-4">
                    {prevArticle && (
                      <a
                        href={buildPathWithLang(prevArticle.href, currentLang)}
                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors group"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(buildPathWithLang(prevArticle.href, currentLang));
                        }}
                      >
                        <Icon name="chevron-left" size="sm" className="group-hover:-translate-x-1 transition-transform" />
                        <div>
                          <span className="block text-xs text-text-secondary mb-1">
                            {t('help.navigation.prev', 'Предыдущая')}
                          </span>
                          <span className="font-medium">{prevArticle.title}</span>
                        </div>
                      </a>
                    )}
                    {nextArticle && (
                      <a
                        href={buildPathWithLang(nextArticle.href, currentLang)}
                        className={`flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors group ${
                          !prevArticle ? 'ml-auto' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(buildPathWithLang(nextArticle.href, currentLang));
                        }}
                      >
                        <div className="text-right">
                          <span className="block text-xs text-text-secondary mb-1">
                            {t('help.navigation.next', 'Следующая')}
                          </span>
                          <span className="font-medium">{nextArticle.title}</span>
                        </div>
                        <Icon name="chevron-right" size="sm" className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                )}
              </article>

              {/* Mini Table of Contents - справа от статьи */}
              {sections.length > 0 && (
                <aside className="hidden lg:block w-64 flex-shrink-0">
                  <nav 
                    className="dc-mini-toc sticky top-32"
                    aria-label={t('help.toc.label', 'Навигация по статье')}
                  >
                    <h2 className="dc-mini-toc__title text-sm font-semibold text-text-primary mb-4">
                      {t('help.toc.title', 'В этой статье:')}
                    </h2>
                    <ul className="dc-mini-toc__sections space-y-1" aria-label={t('help.toc.sections', 'Содержание текущей статьи')}>
                      {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                          <li 
                            key={section.id}
                            data-hash={`#${section.id}`}
                            className={`dc-mini-toc__section relative pl-4 ${isActive ? 'dc-mini-toc__section_active' : ''}`}
                          >
                            {/* Левая вертикальная линия - индикатор */}
                            <div 
                              className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all ${
                                isActive 
                                  ? 'bg-primary w-1' 
                                  : 'bg-border opacity-30'
                              }`}
                            />
                            <a
                              href={`#${section.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                scrollToSection(section.id);
                              }}
                              className={`dc-mini-toc__section-link block px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'font-medium text-text-primary'
                                  : 'text-text-secondary hover:text-text-primary'
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
      <footer className={`border-t ${themeClasses.border.default} ${themeClasses.background.default} py-10`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-black/5 !bg-gray-900 text-white dark:!bg-white dark:!text-gray-900"
              >
                <span className="text-sm font-extrabold leading-none">iD</span>
              </div>
              <p className="text-sm text-text-secondary">
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
            <div className="flex gap-8">
              <a href={buildPathWithLang('/about', currentLang)} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                {t('landing.footer.links.about', 'О проекте')}
              </a>
              <a href={buildPathWithLang('/privacy', currentLang)} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                {t('landing.footer.links.privacy', 'Конфиденциальность')}
              </a>
              <a href={buildPathWithLang('/terms', currentLang)} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                {t('landing.footer.links.terms', 'Условия')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

