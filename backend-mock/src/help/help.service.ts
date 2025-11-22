import { Injectable } from '@nestjs/common';

/**
 * Help Service - сервис для работы с данными справки
 * Предоставляет категории, статьи и другую информацию для Help страницы
 */

export interface HelpCategory {
  id: string;
  icon: string;
  title: string;
  links: HelpLink[];
}

export interface HelpLink {
  text: string;
  href: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  sections?: ArticleSection[];
}

export interface ArticleSection {
  id: string;
  title: string;
}

@Injectable()
export class HelpService {
  // Mock данные для категорий справки
  private helpCategories: HelpCategory[] = [
    {
      id: 'security',
      icon: 'shield',
      title: 'Защита вашего аккаунта',
      links: [
        { text: 'Почему Loginus просит изменить пароль', href: '/help/security/force-password-change' },
        { text: 'Проверка при входе', href: '/help/security/login-challenge' },
        { text: 'Защита от вирусов', href: '/help/security/virus-check' },
      ],
    },
    {
      id: 'key',
      icon: 'key',
      title: 'Вход с приложением Loginus Ключ',
      links: [
        { text: 'Настроить Loginus Ключ', href: '/help/authorization/twofa-on' },
        { text: 'Генерировать пароли для других сайтов', href: '/help/key/external-websites' },
        { text: 'Создать пароли для приложений', href: '/help/authorization/app-passwords' },
      ],
    },
    {
      id: 'phone',
      icon: 'smartphone',
      title: 'Номер телефона',
      links: [
        { text: 'Не приходит смс или уведомление', href: '/help/troubleshooting/nosms-form' },
        { text: 'Привязать номер телефона', href: '/help/authorization/phone#confirm' },
        { text: 'Изменить уже привязанный номер', href: '/help/authorization/phone#change' },
      ],
    },
    {
      id: 'recovery',
      icon: 'help-circle',
      title: 'Восстановление доступа',
      links: [
        { text: 'Не могу войти в аккаунт', href: '/help/troubleshooting/other-login-problems' },
        { text: 'Восстановление доступа', href: '/help/support-restore' },
        { text: 'Не помню логин или адрес почты', href: '/help/troubleshooting/forgot-login-email-write' },
      ],
    },
    {
      id: 'email',
      icon: 'mail',
      title: 'Почта и уведомления',
      links: [
        { text: 'Какие письма и смс присылает Loginus', href: '/help/messages' },
        { text: 'Дополнительные адреса почты', href: '/help/authorization/email' },
        { text: 'Адрес для восстановления доступа', href: '/help/authorization/email#howtoadd' },
      ],
    },
    {
      id: 'data',
      icon: 'user',
      title: 'Мои данные',
      links: [
        { text: 'Мои персональные данные', href: '/help/data/personal' },
        { text: 'Мои публичные данные на Loginus', href: '/help/data/public-data' },
        { text: 'Управление данными', href: '/help/data' },
      ],
    },
    {
      id: 'family',
      icon: 'users',
      title: 'Семейная группа',
      links: [
        { text: 'Семейная группа', href: '/help/family' },
        { text: 'Детские аккаунты', href: '/help/family/children' },
      ],
    },
    {
      id: 'pay',
      icon: 'credit-card',
      title: 'Loginus Пэй и платежи',
      links: [
        { text: 'Loginus Пэй и банковские карты', href: '/help/yandex-pay/y-pay' },
        { text: 'Мои сервисы и подписки', href: '/help/subscriptions' },
      ],
    },
  ];

  /**
   * Получить все категории справки
   */
  getCategories(): { success: boolean; data: HelpCategory[] } {
    return {
      success: true,
      data: this.helpCategories,
    };
  }

  /**
   * Получить категорию по ID
   */
  getCategoryById(id: string): { success: boolean; data: HelpCategory | null } {
    const category = this.helpCategories.find((cat) => cat.id === id);
    return {
      success: true,
      data: category || null,
    };
  }
}

