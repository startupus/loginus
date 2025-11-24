import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from '../design-system/layouts/LandingHeader';
import { Button } from '../design-system/primitives/Button';
import { ServiceCard, FeatureCard, FAQItem } from '../design-system/composites';
import { useLanguageStore } from '../store';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';
import { themeClasses } from '../design-system/utils/themeClasses';
import { changeLanguage } from '../services/i18n/config';

/**
 * LandingPage - приветственная страница Loginus ID
 * Создана на базе TailGrids MarketingComponents/Hero
 * Дизайн: чистый, современный, профессиональный
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { setLanguage, language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';

  const handleLanguageChange = async () => {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    await changeLanguage(newLang);
    
    // Обновляем URL с новым языком
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/[^/]+/, '') || '/';
    const newPath = buildPathWithLang(pathWithoutLang, newLang);
    navigate(newPath, { replace: true });
  };

  return (
    <div className={themeClasses.page.container}>
      {/* Header - используем компонент из дизайн-системы */}
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

      {/* Hero Section - с красивым фоном */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-1 via-white to-primary/5 pt-32 pb-20 dark:from-dark dark:via-dark dark:to-dark-2 lg:pt-40 lg:pb-32">
        {/* Background декорации */}
        <div className="absolute top-0 right-0 -z-10 opacity-20">
          <svg width="450" height="556" viewBox="0 0 450 556" fill="none">
            <circle cx="277" cy="63" r="225" fill="url(#paint0_linear)" />
            <defs>
              <linearGradient id="paint0_linear" x1="277" y1="-162" x2="277" y2="288" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(var(--color-primary))" stopOpacity="0.3" />
                <stop offset="1" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="absolute bottom-0 left-0 -z-10 opacity-10">
          <svg width="364" height="201" viewBox="0 0 364 201" fill="none">
            <circle cx="182" cy="182" r="182" fill="url(#paint1_linear)" />
            <defs>
              <linearGradient id="paint1_linear" x1="182" y1="0" x2="182" y2="364" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(var(--color-primary))" stopOpacity="0.3" />
                <stop offset="1" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container mx-auto">
          <div className="flex flex-wrap items-center">
            {/* Left Content */}
            <div className="w-full px-4 lg:w-6/12">
              <div className="max-w-[570px]">
                {/* Badge */}
                <div className={`mb-6 inline-flex items-center gap-2 rounded-full ${themeClasses.background.primarySemiTransparent} px-4 py-2`}>
                  <span className="text-sm font-semibold text-primary">{t('landing.hero.badge', 'Новое')}</span>
                  <span className={`text-sm ${themeClasses.text.secondary}`}>{t('landing.hero.badgeText', 'Двухфакторная аутентификация')}</span>
                </div>
                
                <h1 className={`mb-6 text-5xl font-bold leading-tight ${themeClasses.text.primary} sm:text-6xl lg:text-[64px]`}>
                  {t('landing.hero.title', 'Единый аккаунт')}
                  <br />
                  <span className="text-primary">{t('landing.hero.titleHighlight', 'Loginus ID')}</span>
                </h1>
                
                <p className={`mb-10 text-lg leading-relaxed ${themeClasses.text.secondary}`}>
                  {t('landing.hero.description', 'Быстрая и безопасная авторизация для всех ваших сервисов. Управляйте данными, платежами и семейным доступом в одном месте.')}
                </p>
                
                {/* CTA */}
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    variant="primary"
                    size="xl"
                    leftIcon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    }
                    onClick={() => {
                      const lang = currentLang || 'ru';
                      const path = buildPathWithLang('/auth', lang);
                      navigate(path);
                    }}
                  >
                    {t('landing.hero.ctaLogin', 'Войти через Loginus ID')}
                  </Button>
                  
                  <a
                    href={buildPathWithLang('/about', currentLang)}
                    className={`inline-flex items-center gap-2 px-8 py-4 text-base font-medium ${themeClasses.text.secondary} hover:text-primary transition-colors`}
                  >
                    {t('landing.hero.ctaLearnMore', 'Узнать больше')}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-12 flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>{t('landing.hero.trustSafe', 'Безопасно')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>{t('landing.hero.trustFast', 'Быстро')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>{t('landing.hero.trustConvenient', 'Удобно')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Service Cards с анимацией */}
            <div className="w-full px-4 lg:w-6/12 mt-12 lg:mt-0">
              <div className="relative">
                {/* Декоративный круг */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full blur-3xl"></div>
                
                <div className="relative grid grid-cols-2 gap-6">
                  <ServiceCard 
                    icon={
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                    title={t('landing.services.security.title', 'Безопасность')}
                    description={t('landing.services.security.description', '2FA защита')}
                  />
                  <ServiceCard 
                    icon={
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    title={t('landing.services.fastLogin.title', 'Быстрый вход')}
                    description={t('landing.services.fastLogin.description', '1 клик - и вы внутри')}
                  />
                  <ServiceCard 
                    icon={
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    }
                    title={t('landing.services.everywhere.title', 'Везде с вами')}
                    description={t('landing.services.everywhere.description', 'Web, iOS, Android')}
                  />
                  <ServiceCard 
                    icon={
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    title={t('landing.services.unifiedProfile.title', 'Единый профиль')}
                    description={t('landing.services.unifiedProfile.description', 'Все в одном месте')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className={`mb-4 text-4xl font-bold ${themeClasses.text.primary} lg:text-5xl`}>
              {t('landing.features.title', 'Возможности Loginus ID')}
            </h2>
            <p className={`mx-auto max-w-[600px] text-lg ${themeClasses.text.secondary}`}>
              {t('landing.features.subtitle', 'Единый аккаунт для управления всеми вашими данными и сервисами')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={
                <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              title={t('landing.features.personalData.title', 'Персональные данные')}
              description={t('landing.features.personalData.description', 'Документы, адреса, контакты - всё под рукой')}
            />
            <FeatureCard
              icon={
                <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
              title={t('landing.features.payments.title', 'Платежи')}
              description={t('landing.features.payments.description', 'Безопасное хранение и быстрая оплата')}
            />
            <FeatureCard
              icon={
                <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title={t('landing.features.family.title', 'Семейный доступ')}
              description={t('landing.features.family.description', 'Делитесь подписками с близкими')}
            />
            <FeatureCard
              icon={
                <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title={t('landing.features.security.title', 'Безопасность')}
              description={t('landing.features.security.description', 'Контроль сессий и доступа')}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={`${themeClasses.background.gray} py-20 lg:py-28`}>
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className={`mb-4 text-4xl font-bold ${themeClasses.text.primary} lg:text-5xl`}>
              {t('landing.faq.title', 'Часто задаваемые вопросы')}
            </h2>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              <FAQItem
                question={t('landing.faq.q1', 'Как создать аккаунт?')}
                answer={t('landing.faq.a1', 'При первом входе система автоматически создаст аккаунт. Просто введите телефон или email.')}
              />
              <FAQItem
                question={t('landing.faq.q2', 'Безопасны ли данные?')}
                answer={t('landing.faq.a2', 'Используем современное шифрование и двухфакторную аутентификацию для защиты.')}
              />
              <FAQItem
                question={t('landing.faq.q3', 'Как работает семейный доступ?')}
                answer={t('landing.faq.a3', 'Создайте семейную группу, пригласите участников и делитесь подписками.')}
              />
              <FAQItem
                question={t('landing.faq.q4', 'Как восстановить доступ?')}
                answer={t('landing.faq.a4', 'Используйте форму восстановления через email или телефон в любой момент.')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${themeClasses.background.default} py-10`}>
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div 
                className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-black/5 ${themeClasses.logo.inverted}`}
              >
                <span className="text-sm font-extrabold leading-none">iD</span>
              </div>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {(() => {
                  const projectStartYear = 2025;
                  const currentYear = new Date().getFullYear();
                  const yearRange = currentYear === projectStartYear 
                    ? projectStartYear.toString() 
                    : `${projectStartYear} - ${currentYear}`;
                  // Используем интерполяцию i18n правильно
                  return t('landing.footer.copyright', '© {{year}} Loginus ID. Все права защищены.', { year: yearRange });
                })()}
              </p>
            </div>
            <div className="flex gap-8">
              <a href={buildPathWithLang('/about', currentLang)} className={`text-sm font-medium ${themeClasses.text.secondary} hover:text-primary transition-colors`}>
                {t('landing.footer.about', 'О проекте')}
              </a>
              <a href={buildPathWithLang('/privacy', currentLang)} className={`text-sm font-medium ${themeClasses.text.secondary} hover:text-primary transition-colors`}>
                {t('landing.footer.privacy', 'Конфиденциальность')}
              </a>
              <a href={buildPathWithLang('/terms', currentLang)} className={`text-sm font-medium ${themeClasses.text.secondary} hover:text-primary transition-colors`}>
                {t('landing.footer.terms', 'Условия')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default LandingPage;
