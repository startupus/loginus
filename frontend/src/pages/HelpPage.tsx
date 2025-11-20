import React from 'react';
import { useTranslation } from 'react-i18next';
// Прямые импорты для tree-shaking
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { Icon } from '@/design-system/primitives/Icon';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const currentLang = useCurrentLanguage();

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
    <PageTemplate 
      title={t('sidebar.help', 'Справка')}
      showSidebar={true}
      contentClassName="max-w-6xl mx-auto"
    >
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          {t('help.header.title', 'Ваш Loginus ID')}
        </h1>
        <p className="text-base text-text-secondary leading-relaxed max-w-3xl">
          {t('help.header.description', 'Многие сервисы Loginus доступны только после регистрации. Loginus ID — это единый аккаунт. Используйте его для авторизации на всех сервисах Loginus.')}
        </p>
      </div>

      {/* Help Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCategories.map((category, index) => (
          <div
            key={index}
            className="bg-background dark:bg-surface rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon name={category.icon} size="lg" className="text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Help Section */}
      <div className="mt-12 p-6 bg-gray-1 dark:bg-gray-2 rounded-lg border border-border">
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
    </PageTemplate>
  );
};

export default HelpPage;

