import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from '../design-system/layouts/LandingHeader';
import { Icon } from '../design-system/primitives/Icon';
import { useLanguageStore } from '../store';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';
import { themeClasses } from '../design-system/utils/themeClasses';
import { changeLanguage } from '../services/i18n/config';
import { HelpSidebar } from './help/HelpSidebar';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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

  const helpCategories = [
    {
      icon: 'shield',
      title: t('help.categories.security.title', 'Защита вашего аккаунта'),
      links: [
        { text: t('help.categories.security.changePassword', 'Почему Loginus просит изменить пароль'), href: '/help/security/force-password-change' },
        { text: t('help.categories.security.loginChallenge', 'Проверка при входе'), href: '/help/security/login-challenge' },
        { text: t('help.categories.security.virusCheck', 'Защита от вирусов'), href: '/help/security/virus-check' },
      ]
    },
    {
      icon: 'key',
      title: t('help.categories.key.title', 'Вход с приложением Loginus Ключ'),
      links: [
        { text: t('help.categories.key.setup', 'Настроить Loginus Ключ'), href: '/help/authorization/twofa-on' },
        { text: t('help.categories.key.external', 'Генерировать пароли для других сайтов'), href: '/help/key/external-websites' },
        { text: t('help.categories.key.appPasswords', 'Создать пароли для приложений'), href: '/help/authorization/app-passwords' },
      ]
    },
    {
      icon: 'smartphone',
      title: t('help.categories.phone.title', 'Номер телефона'),
      links: [
        { text: t('help.categories.phone.noSms', 'Не приходит смс или уведомление'), href: '/help/troubleshooting/nosms-form' },
        { text: t('help.categories.phone.attach', 'Привязать номер телефона'), href: '/help/authorization/phone#confirm' },
        { text: t('help.categories.phone.change', 'Изменить уже привязанный номер'), href: '/help/authorization/phone#change' },
      ]
    },
    {
      icon: 'help-circle',
      title: t('help.categories.recovery.title', 'Восстановление доступа'),
      links: [
        { text: t('help.categories.recovery.cantLogin', 'Не могу войти в аккаунт'), href: '/help/troubleshooting/other-login-problems' },
        { text: t('help.categories.recovery.restore', 'Восстановление доступа'), href: '/help/support-restore' },
        { text: t('help.categories.recovery.forgotLogin', 'Не помню логин или адрес почты'), href: '/help/troubleshooting/forgot-login-email-write' },
      ]
    },
    {
      icon: 'mail',
      title: t('help.categories.email.title', 'Почта и уведомления'),
      links: [
        { text: t('help.categories.email.messages', 'Какие письма и смс присылает Loginus'), href: '/help/messages' },
        { text: t('help.categories.email.additional', 'Дополнительные адреса почты'), href: '/help/authorization/email' },
        { text: t('help.categories.email.recovery', 'Адрес для восстановления доступа'), href: '/help/authorization/email#howtoadd' },
      ]
    },
    {
      icon: 'user',
      title: t('help.categories.data.title', 'Мои данные'),
      links: [
        { text: t('help.categories.data.personal', 'Мои персональные данные'), href: '/help/data/personal' },
        { text: t('help.categories.data.public', 'Мои публичные данные на Loginus'), href: '/help/data/public-data' },
        { text: t('help.categories.data.manage', 'Управление данными'), href: '/help/data' },
      ]
    },
    {
      icon: 'users',
      title: t('help.categories.family.title', 'Семейная группа'),
      links: [
        { text: t('help.categories.family.group', 'Семейная группа'), href: '/help/family' },
        { text: t('help.categories.family.children', 'Детские аккаунты'), href: '/help/family/children' },
      ]
    },
    {
      icon: 'credit-card',
      title: t('help.categories.pay.title', 'Loginus Пэй и платежи'),
      links: [
        { text: t('help.categories.pay.cards', 'Loginus Пэй и банковские карты'), href: '/help/yandex-pay/y-pay' },
        { text: t('help.categories.pay.subscriptions', 'Мои сервисы и подписки'), href: '/help/subscriptions' },
      ]
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

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-20 lg:pt-28">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <HelpSidebar currentPath={location.pathname} />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Header Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-text-primary mb-4 lg:text-5xl">
                {t('help.header.title', 'Ваш Loginus ID')}
              </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
            {t('help.header.description', 'Многие сервисы Loginus доступны только после регистрации: например, без аккаунта не получится воспользоваться многими функциями. Loginus ID — это единый аккаунт на Loginus. Используйте его для авторизации на всех сервисах Loginus.')}
          </p>
          <p className="text-base text-text-secondary leading-relaxed max-w-3xl mt-4">
            {t('help.header.description2', 'Если вам нужно сменить пароль или указать другую фамилию — достаточно обновить информацию в Loginus ID. Изменения автоматически отобразятся во всех сервисах. Здесь же вы сможете привязать к Loginus ID номер телефона и настроить способ входа.')}
          </p>
        </div>

        {/* Help Categories Grid - таблица как в Яндекс ID */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {helpCategories.map((category, index) => (
                <tr key={index} className="border-b border-border last:border-b-0">
                  <td className="py-6 pr-8 align-top w-16">
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon name={category.icon} size="lg" className="text-primary" />
                    </div>
                  </td>
                  <td className="py-6 align-top">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      {category.title}
                    </h3>
                    <ul className="space-y-2">
                      {category.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={buildPathWithLang(link.href, currentLang)}
                            className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                          >
                            <span>{link.text}</span>
                            <Icon name="chevron-right" size="sm" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

            {/* Additional Help Section */}
            <div className="mt-12 p-6 bg-gray-1 dark:bg-dark-2 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                {t('help.additionalHelp.title', 'Не нашли ответ?')}
              </h3>
              <p className="text-text-secondary mb-4">
                {t('help.additionalHelp.description', 'Если вы не нашли ответ на свой вопрос в справке, обратитесь в поддержку.')}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={buildPathWithLang('/support', currentLang)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Icon name="message-circle" size="sm" />
                  <span>{t('help.additionalHelp.contact', 'Связаться с поддержкой')}</span>
                </a>
              </div>
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

export default HelpPage;

