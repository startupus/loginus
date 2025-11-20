import React from 'react';
import { useTranslation } from 'react-i18next';
import { useContactMasking } from '../../../hooks/useContactMasking';
import { Button } from '../../primitives/Button';
import { themeClasses } from '../../utils/themeClasses';

export interface ContactDisplayProps {
  /**
   * Контакт (телефон или email)
   */
  contact: string;
  
  /**
   * Тип контакта
   */
  type: 'phone' | 'email';
  
  /**
   * Показать в замаскированном виде
   */
  masked?: boolean;
  
  /**
   * Показать кнопку "Изменить"
   */
  showChange?: boolean;
  
  /**
   * Callback при клике "Изменить"
   */
  onChangeClick?: () => void;
  
  /**
   * Размер текста
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ContactDisplay - компонент для отображения контакта (телефон/email)
 */
export const ContactDisplay: React.FC<ContactDisplayProps> = ({
  contact,
  type,
  masked = false,
  showChange = false,
  onChangeClick,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const { masked: maskedContact, full } = useContactMasking(contact, type);

  const displayContact = masked ? maskedContact : full;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-lg ${themeClasses.background.gray} dark:bg-dark-2`}>
      <div className="flex-1">
        <p className={`font-medium ${themeClasses.text.primary} ${sizeClasses[size]}`}>
          {displayContact}
        </p>
      </div>
      {showChange && onChangeClick && (
        <Button
          variant="link"
          size="sm"
          onClick={onChangeClick}
          className="text-primary hover:text-primary/80"
        >
          {t('common.edit', 'Изменить')}
        </Button>
      )}
    </div>
  );
};

