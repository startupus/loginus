import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from '../design-system/layouts/LandingHeader';
import { Icon } from '../design-system/primitives/Icon';
import { useLanguageStore } from '../store';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';
import { themeClasses } from '../design-system/utils/themeClasses';
import { changeLanguage } from '../services/i18n/config';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { setLanguage, language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  
  // Состояние раскрытых разделов
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Структура меню с вложенными разделами (определяем до useEffect)
  const helpMenuItems = [
    {
      path: '/help',
      label: t('help.sidebar.yourId', 'Ваш Loginus ID'),
      children: undefined,
    },
    {
      path: '/help/authorization',
      label: t('help.sidebar.login', 'Вход'),
      children: [
        { path: '/help/authorization/no-password', label: t('help.sidebar.loginNoPassword', 'Вход без пароля') },
        { path: '/help/authorization/phone', label: t('help.sidebar.loginPhone', 'Вход по номеру телефона') },
        { path: '/help/authorization/otp', label: t('help.sidebar.loginOtp', 'Вход по одноразовому паролю') },
        { path: '/help/authorization/password-plus-otp', label: t('help.sidebar.loginPasswordOtp', 'Вход по паролю + одноразовому паролю') },
        { path: '/help/authorization/social', label: t('help.sidebar.loginSocial', 'Через внешние способы входа') },
        { path: '/help/authorization/profiles', label: t('help.sidebar.loginProfiles', 'Профили в Loginus ID') },
        { path: '/help/troubleshooting/nosms-form', label: t('help.categories.phone.noSms', 'Не приходит смс или уведомление') },
      ],
    },
    {
      path: '/help/registration',
      label: t('help.sidebar.registration', 'Регистрация аккаунта'),
      children: undefined,
    },
    {
      path: '/help/security',
      label: t('help.sidebar.security', 'Защита аккаунта'),
      children: undefined,
    },
    {
      path: '/help/recovery',
      label: t('help.sidebar.recovery', 'Восстановление доступа'),
      children: undefined,
    },
    {
      path: '/help/key',
      label: t('help.sidebar.key', 'Loginus Ключ'),
      children: undefined,
    },
    {
      path: '/help/family',
      label: t('help.sidebar.family', 'Семейная группа'),
      children: undefined,
    },
    {
      path: '/help/data',
      label: t('help.sidebar.data', 'Данные'),
      children: undefined,
    },
    {
      path: '/help/payments',
      label: t('help.sidebar.payments', 'Loginus Пэй'),
      children: undefined,
    },
    {
      path: '/support',
      label: t('help.sidebar.support', 'Служба поддержки'),
      children: undefined,
    },
  ];

  const handleLanguageChange = async () => {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    await changeLanguage(newLang);
    
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/[^/]+/, '') || '/';
    const newPath = buildPathWithLang(pathWithoutLang, newLang);
    navigate(newPath, { replace: true });
  };

  // Определяем активный раздел по текущему пути
  const isActiveSection = (path: string) => {
    const currentPath = location.pathname;
    const helpPath = buildPathWithLang(path, currentLang);
    if (path === '/help') {
      return currentPath === helpPath || currentPath.endsWith('/help');
    }
    return currentPath.startsWith(helpPath);
  };

  // Автоматически раскрываем раздел, если в нем активная страница
  useEffect(() => {
    const currentPath = location.pathname;
    const sectionsToExpand = new Set<string>();

    // Проверяем каждый раздел с подразделами
    helpMenuItems.forEach((item) => {
      if (item.children) {
        const sectionPath = buildPathWithLang(item.path, currentLang);
        // Если текущий путь начинается с пути раздела или совпадает с ним
        if (currentPath.startsWith(sectionPath) || currentPath === sectionPath) {
          sectionsToExpand.add(item.path);
        }
        // Также проверяем подразделы
        item.children.forEach((child) => {
          const childPath = buildPathWithLang(child.path, currentLang);
          if (currentPath.startsWith(childPath) || currentPath === childPath) {
            sectionsToExpand.add(item.path);
          }
        });
      }
    });

    setExpandedSections(sectionsToExpand);
  }, [location.pathname, currentLang]);

  const toggleSection = (path: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
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
      <main className="container mx-auto px-4 pt-32 pb-20 lg:pt-40">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className={`${themeClasses.card.shadow} rounded-lg p-4 sticky top-32`}>
              <h2 className="text-sm font-semibold text-text-secondary uppercase mb-4">
                {t('help.sidebar.title', 'Разделы справки')}
              </h2>
              <ul className="space-y-1">
                {helpMenuItems.map((item) => {
                  const isActive = isActiveSection(item.path);
                  const isExpanded = expandedSections.has(item.path);
                  const hasChildren = item.children && item.children.length > 0;

                  return (
                    <li key={item.path}>
                      {hasChildren ? (
                        <div>
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleSection(item.path)}
                              className="flex-shrink-0 p-1 rounded hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors"
                              aria-label={`${isExpanded ? 'Свернуть' : 'Развернуть'} ${item.label}`}
                              aria-expanded={isExpanded}
                            >
                              <Icon
                                name="chevron-right"
                                size="sm"
                                className={`text-text-secondary transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            <a
                              href={buildPathWithLang(item.path, currentLang)}
                              className={`flex-1 px-2 py-2 text-sm rounded-md transition-colors ${
                                isActive
                                  ? 'font-medium text-text-primary bg-primary/10 dark:bg-primary/20'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-1 dark:hover:bg-dark-3'
                              }`}
                            >
                              {item.label}
                            </a>
                          </div>
                          {isExpanded && item.children && (
                            <ul className="ml-6 mt-1 space-y-1 border-l border-border pl-4">
                              {item.children.map((child) => {
                                const isChildActive = isActiveSection(child.path);
                                return (
                                  <li key={child.path}>
                                    <a
                                      href={buildPathWithLang(child.path, currentLang)}
                                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                        isChildActive
                                          ? 'font-medium text-text-primary bg-primary/10 dark:bg-primary/20'
                                          : 'text-text-secondary hover:text-text-primary hover:bg-gray-1 dark:hover:bg-dark-3'
                                      }`}
                                    >
                                      {child.label}
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <a
                          href={buildPathWithLang(item.path, currentLang)}
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive
                              ? 'font-medium text-text-primary bg-primary/10 dark:bg-primary/20'
                              : 'text-text-secondary hover:text-text-primary hover:bg-gray-1 dark:hover:bg-dark-3'
                          }`}
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

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

