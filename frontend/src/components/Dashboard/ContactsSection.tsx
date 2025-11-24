import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface Contact {
  type: 'email' | 'phone' | 'backup-email' | 'external-accounts';
  label: string;
  value: string;
  count?: number;
  href?: string;
  onClick?: () => void;
}

export interface ContactsSectionProps {
  contacts: Contact[];
}

/**
 * ContactsSection - секция контактов пользователя
 * Отображает email, телефоны и связанные аккаунты
 */
export const ContactsSection: React.FC<ContactsSectionProps> = ({
  contacts,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();

  const getIcon = (type: Contact['type']) => {
    switch (type) {
      case 'email':
        return 'mail';
      case 'phone':
        return 'phone';
      case 'backup-email':
        return 'mail';
      case 'external-accounts':
        return 'settings';
      default:
        return 'info';
    }
  };

  const handleContactClick = (contact: Contact) => {
    if (contact.href) {
      navigate(buildPathWithLang(contact.href, currentLang));
    } else if (contact.onClick) {
      contact.onClick();
    }
  };

  return (
    <DataSection
      id="contacts"
      title={t('data.contacts.title', 'Contacts')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact, index) => {
          const isClickable = !!(contact.href || contact.onClick);
          
          return (
            <button
              key={`${contact.type}-${index}`}
              onClick={() => isClickable && handleContactClick(contact)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors duration-200 ${themeClasses.border.default} ${
                isClickable
                  ? `${themeClasses.background.cardHoverSemiTransparent} hover:border-primary/30 dark:hover:border-primary/30 cursor-pointer`
                  : 'cursor-default opacity-60'
              }`}
            >
              {/* Иконка */}
              <div className={`w-10 h-10 rounded-lg ${themeClasses.background.iconContainer} flex items-center justify-center flex-shrink-0`}>
                <Icon name={getIcon(contact.type)} size="sm" className={themeClasses.text.secondary} />
              </div>
              
              {/* Информация */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  {contact.label}
                  {contact.count !== undefined && contact.count > 0 && (
                    <span className={`ml-2 ${themeClasses.text.secondary}`}>
                      {contact.count}
                    </span>
                  )}
                </div>
                {contact.value ? (
                  <div className={`text-xs ${themeClasses.text.secondary} mt-1 truncate`}>
                    {contact.value}
                  </div>
                ) : (
                  <div className={`text-xs ${themeClasses.text.secondary} opacity-60 mt-1`}>
                    {t('data.contacts.notSet', 'Not specified')}
                  </div>
                )}
              </div>
              
              {/* Стрелка для кликабельных элементов */}
              {isClickable && (
                <Icon name="chevron-right" size="sm" className={`${themeClasses.text.secondary} flex-shrink-0`} />
              )}
            </button>
          );
        })}
      </div>
    </DataSection>
  );
};

