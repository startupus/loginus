import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from '../design-system/layouts/LandingHeader';
import { Button } from '../design-system/primitives/Button';
import { Icon } from '../design-system/primitives';
import { useLanguageStore } from '../store';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';
import { useTheme } from '../design-system/contexts/ThemeContext';

/**
 * AboutPage - информационная страница о Loginus ID
 * Рассказывает о системе, её возможностях и преимуществах
 */
const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { setLanguage, language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  const { isDark } = useTheme();

  const handleLanguageChange = () => {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    
    // Обновляем URL с новым языком
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/[^/]+/, '') || '/';
    const newPath = buildPathWithLang(pathWithoutLang, newLang);
    navigate(newPath, { replace: true });
  };

  const features = [
    {
      icon: 'shield',
      title: t('about.features.security.title', 'Безопасность данных'),
      description: t('about.features.security.description', 'Защита персональных данных по стандарту ГОСТ. Шифрование всех данных и безопасное хранение.'),
    },
    {
      icon: 'key',
      title: t('about.features.auth.title', 'Единый вход'),
      description: t('about.features.auth.description', 'Один аккаунт для всех сервисов Loginus. Быстрая авторизация без повторного ввода пароля.'),
    },
    {
      icon: 'users',
      title: t('about.features.family.title', 'Семейный доступ'),
      description: t('about.features.family.description', 'Управление семейной группой, детскими аккаунтами и общими подписками.'),
    },
    {
      icon: 'credit-card',
      title: t('about.features.payments.title', 'Платежи и подписки'),
      description: t('about.features.payments.description', 'Управление платежными методами, подписками и историей транзакций.'),
    },
    {
      icon: 'file-text',
      title: t('about.features.documents.title', 'Документы'),
      description: t('about.features.documents.description', 'Хранение и управление важными документами в защищенном хранилище.'),
    },
    {
      icon: 'settings',
      title: t('about.features.control.title', 'Полный контроль'),
      description: t('about.features.control.description', 'Управление доступом к данным, настройками приватности и безопасностью.'),
    },
  ];

  const benefits = [
    {
      title: t('about.benefits.speed.title', 'Быстро'),
      description: t('about.benefits.speed.description', 'Мгновенный вход во все сервисы без повторной авторизации'),
    },
    {
      title: t('about.benefits.safety.title', 'Безопасно'),
      description: t('about.benefits.safety.description', 'Защита данных по стандарту ГОСТ и двухфакторная аутентификация'),
    },
    {
      title: t('about.benefits.convenience.title', 'Удобно'),
      description: t('about.benefits.convenience.description', 'Все ваши данные и настройки в одном месте'),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark">
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
          { label: t('landing.nav.features', 'Возможности'), href: buildPathWithLang('/', currentLang) + '#features' },
          { label: t('landing.nav.faq', 'FAQ'), href: buildPathWithLang('/', currentLang) + '#faq' },
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-1 via-white to-primary/5 pt-32 pb-20 dark:from-dark dark:via-dark dark:to-dark-2 lg:pt-40 lg:pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-text-primary sm:text-6xl lg:text-[64px]">
              {t('about.hero.title', 'О Loginus ID')}
            </h1>
            <p className="mb-10 text-xl leading-relaxed text-text-secondary max-w-3xl mx-auto">
              {t('about.hero.description', 'Loginus ID — это единый аккаунт для всех сервисов Loginus. Быстрая и безопасная авторизация, управление данными, платежами и семейным доступом в одном месте.')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="primary"
                size="xl"
                onClick={() => {
                  const lang = currentLang || 'ru';
                  const path = buildPathWithLang('/auth', lang);
                  navigate(path);
                }}
              >
                {t('about.hero.cta', 'Создать аккаунт')}
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => {
                  const lang = currentLang || 'ru';
                  navigate(buildPathWithLang('/', lang));
                }}
              >
                {t('about.hero.back', 'На главную')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Loginus ID Section */}
      <section className="py-20 bg-white dark:bg-dark-2">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
              {t('about.what.title', 'Что такое Loginus ID?')}
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                {t('about.what.description1', 'Loginus ID — это единая система идентификации и авторизации для всех сервисов Loginus. Создав один аккаунт, вы получаете доступ ко всем возможностям экосистемы Loginus.')}
              </p>
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                {t('about.what.description2', 'Система разработана с учетом требований безопасности и защиты персональных данных. Все данные хранятся в зашифрованном виде и защищены по стандарту ГОСТ.')}
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                {t('about.what.description3', 'С Loginus ID вы можете управлять персональными данными, документами, платежами, семейным доступом и многим другим из единого интерфейса.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-gray-1 dark:bg-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">
            {t('about.features.title', 'Основные возможности')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-2 rounded-xl p-6 border border-gray-2 dark:border-dark-3/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon name={feature.icon} size="lg" className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-dark-2">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">
              {t('about.benefits.title', 'Почему Loginus ID?')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="check-circle" size="xl" className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-text-secondary">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-dark dark:to-dark-2">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
              {t('about.cta.title', 'Готовы начать?')}
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              {t('about.cta.description', 'Создайте свой Loginus ID и получите доступ ко всем возможностям экосистемы Loginus.')}
            </p>
            <Button
              variant="primary"
              size="xl"
              onClick={() => {
                const lang = currentLang || 'ru';
                const path = buildPathWithLang('/auth', lang);
                navigate(path);
              }}
            >
              {t('about.cta.button', 'Создать аккаунт')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-2 bg-white py-10 dark:border-dark-3 dark:bg-dark">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-black/5"
                style={{
                  backgroundColor: isDark ? 'rgb(255, 255, 255)' : 'rgb(var(--color-text-primary))',
                  color: isDark ? 'rgb(15, 23, 42)' : 'rgb(var(--color-background))',
                }}
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

export default AboutPage;

