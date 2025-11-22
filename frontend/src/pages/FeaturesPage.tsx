import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from '../design-system/layouts/LandingHeader';
import { Button } from '../design-system/primitives/Button';
import { FeatureCard } from '../design-system/composites';
import { Icon } from '../design-system/primitives';
import { useLanguageStore } from '../store';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';
import { themeClasses } from '../design-system/utils/themeClasses';
import { changeLanguage } from '../services/i18n/config';

/**
 * FeaturesPage - детальная страница возможностей Loginus ID
 * Подробное описание всех функций и преимуществ системы
 */
const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { setLanguage, language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';

  const handleLanguageChange = async () => {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    await changeLanguage(newLang);
    
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/[^/]+/, '') || '/';
    const newPath = buildPathWithLang(pathWithoutLang, newLang);
    navigate(newPath, { replace: true });
  };

  const mainFeatures = [
    {
      icon: (
        <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: t('features.main.security.title', 'Безопасность и защита данных'),
      description: t('features.main.security.description', 'Многоуровневая защита ваших данных с использованием современных технологий шифрования и двухфакторной аутентификации.'),
      details: [
        t('features.main.security.detail1', 'Шифрование данных по стандарту ГОСТ'),
        t('features.main.security.detail2', 'Двухфакторная аутентификация (2FA)'),
        t('features.main.security.detail3', 'Контроль активных сессий'),
        t('features.main.security.detail4', 'Уведомления о подозрительной активности'),
      ],
    },
    {
      icon: (
        <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('features.main.fastAuth.title', 'Быстрая авторизация'),
      description: t('features.main.fastAuth.description', 'Единый вход во все сервисы экосистемы Loginus без необходимости запоминать множество паролей.'),
      details: [
        t('features.main.fastAuth.detail1', 'Один аккаунт для всех сервисов'),
        t('features.main.fastAuth.detail2', 'Биометрическая авторизация'),
        t('features.main.fastAuth.detail3', 'QR-код для быстрого входа'),
        t('features.main.fastAuth.detail4', 'Социальные сети и провайдеры'),
      ],
    },
    {
      icon: (
        <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: t('features.main.personalData.title', 'Управление персональными данными'),
      description: t('features.main.personalData.description', 'Храните и управляйте всеми своими данными в одном безопасном месте.'),
      details: [
        t('features.main.personalData.detail1', 'Документы и справки'),
        t('features.main.personalData.detail2', 'Адреса и контакты'),
        t('features.main.personalData.detail3', 'Медицинские данные'),
        t('features.main.personalData.detail4', 'Образовательные документы'),
      ],
    },
    {
      icon: (
        <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: t('features.main.payments.title', 'Платежи и подписки'),
      description: t('features.main.payments.description', 'Управляйте платежными методами, подписками и отслеживайте все транзакции.'),
      details: [
        t('features.main.payments.detail1', 'Безопасное хранение карт'),
        t('features.main.payments.detail2', 'Управление подписками'),
        t('features.main.payments.detail3', 'История транзакций'),
        t('features.main.payments.detail4', 'Автоматические платежи'),
      ],
    },
    {
      icon: (
        <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('features.main.family.title', 'Семейный доступ'),
      description: t('features.main.family.description', 'Создавайте семейные группы, управляйте аккаунтами детей и делитесь подписками.'),
      details: [
        t('features.main.family.detail1', 'Семейные группы до 6 человек'),
        t('features.main.family.detail2', 'Детские аккаунты с родительским контролем'),
        t('features.main.family.detail3', 'Общие подписки и покупки'),
        t('features.main.family.detail4', 'Управление доступом для каждого члена'),
      ],
    },
    {
      icon: (
        <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('features.main.privacy.title', 'Конфиденциальность и контроль'),
      description: t('features.main.privacy.description', 'Полный контроль над вашими данными и настройками приватности.'),
      details: [
        t('features.main.privacy.detail1', 'Гранулярные настройки приватности'),
        t('features.main.privacy.detail2', 'Управление доступом приложений'),
        t('features.main.privacy.detail3', 'Экспорт данных в любой момент'),
        t('features.main.privacy.detail4', 'Удаление аккаунта и данных'),
      ],
    },
  ];

  const additionalFeatures = [
    {
      title: t('features.additional.mobile.title', 'Мобильные приложения'),
      description: t('features.additional.mobile.description', 'Доступ ко всем функциям с iOS и Android устройств'),
    },
    {
      title: t('features.additional.api.title', 'API для разработчиков'),
      description: t('features.additional.api.description', 'Интеграция Loginus ID в ваши приложения через OAuth 2.0'),
    },
    {
      title: t('features.additional.support.title', 'Поддержка 24/7'),
      description: t('features.additional.support.description', 'Круглосуточная техническая поддержка и помощь'),
    },
    {
      title: t('features.additional.compliance.title', 'Соответствие стандартам'),
      description: t('features.additional.compliance.description', 'Соответствие ГОСТ, GDPR и другим стандартам безопасности'),
    },
  ];

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-1 via-white to-primary/5 pt-32 pb-20 dark:from-dark dark:via-dark dark:to-dark-2 lg:pt-40 lg:pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-text-primary sm:text-6xl lg:text-[64px]">
              {t('features.hero.title', 'Возможности Loginus ID')}
            </h1>
            <p className="mb-10 text-xl leading-relaxed text-text-secondary max-w-3xl mx-auto">
              {t('features.hero.description', 'Единый аккаунт для управления всеми вашими данными, платежами и сервисами. Безопасно, быстро и удобно.')}
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
                {t('features.hero.cta', 'Начать использовать')}
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => {
                  const lang = currentLang || 'ru';
                  navigate(buildPathWithLang('/', lang));
                }}
              >
                {t('features.hero.back', 'На главную')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className={`py-20 ${themeClasses.page.containerGray}`}>
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4 lg:text-4xl">
              {t('features.main.title', 'Основные возможности')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('features.main.subtitle', 'Всё, что нужно для удобной и безопасной работы с вашими данными')}
            </p>
          </div>

          <div className="space-y-12 max-w-5xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className={`${themeClasses.card.shadow} rounded-xl p-8 ${themeClasses.border.dark} hover:shadow-lg transition-all`}
              >
                {/* Заголовок и описание сверху */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-text-primary mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Детали снизу */}
                <div className="border-t border-border pt-6">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                          <Icon name="check-circle" size="sm" className="text-success" />
                        </div>
                        <span className="text-base text-text-secondary leading-relaxed">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className={`py-20 ${themeClasses.background.surfaceElevated}`}>
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4 lg:text-4xl">
              {t('features.additional.title', 'Дополнительные возможности')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className={`${themeClasses.card.shadow} rounded-xl p-6 ${themeClasses.border.dark} hover:shadow-lg transition-all`}
              >
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-dark dark:to-dark-2">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
              {t('features.cta.title', 'Готовы начать?')}
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              {t('features.cta.description', 'Создайте свой Loginus ID и получите доступ ко всем возможностям уже сегодня.')}
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
              {t('features.cta.button', 'Создать аккаунт')}
            </Button>
          </div>
        </div>
      </section>

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

export default FeaturesPage;

