import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives/Icon';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';

interface HelpSidebarProps {
  currentPath: string;
}

export const HelpSidebar: React.FC<HelpSidebarProps> = ({ currentPath }) => {
  const { t } = useTranslation();
  const currentLang = useCurrentLanguage() || 'ru';
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Структура меню с вложенными разделами
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

  // Определяем активный раздел по текущему пути
  const isActiveSection = (path: string) => {
    const helpPath = buildPathWithLang(path, currentLang);
    if (path === '/help') {
      return currentPath === helpPath || currentPath.endsWith('/help');
    }
    return currentPath.startsWith(helpPath);
  };

  // Автоматически раскрываем раздел, если в нем активная страница
  useEffect(() => {
    const sectionsToExpand = new Set<string>();

    helpMenuItems.forEach((item) => {
      if (item.children) {
        const sectionPath = buildPathWithLang(item.path, currentLang);
        if (currentPath.startsWith(sectionPath) || currentPath === sectionPath) {
          sectionsToExpand.add(item.path);
        }
        item.children.forEach((child) => {
          const childPath = buildPathWithLang(child.path, currentLang);
          if (currentPath.startsWith(childPath) || currentPath === childPath) {
            sectionsToExpand.add(item.path);
          }
        });
      }
    });

    setExpandedSections(sectionsToExpand);
  }, [currentPath, currentLang]);

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

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <nav className={`${themeClasses.card.shadow} rounded-lg p-4 sticky top-32`}>
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
  );
};

