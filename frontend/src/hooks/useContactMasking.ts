import { useMemo } from 'react';
import { maskPhone, maskEmail, getLastDigits } from '../utils/masking';

export interface UseContactMaskingReturn {
  /**
   * Замаскированный контакт
   */
  masked: string;
  
  /**
   * Полный контакт
   */
  full: string;
  
  /**
   * Последние 4 цифры (для телефона)
   */
  lastDigits: string;
}

/**
 * Хук для маскирования контактов (телефон/email)
 */
export function useContactMasking(
  contact: string,
  type: 'phone' | 'email'
): UseContactMaskingReturn {
  return useMemo(() => {
    if (!contact) {
      return {
        masked: '',
        full: '',
        lastDigits: '',
      };
    }

    if (type === 'phone') {
      return {
        masked: maskPhone(contact),
        full: contact,
        lastDigits: getLastDigits(contact, 4),
      };
    }

    return {
      masked: maskEmail(contact),
      full: contact,
      lastDigits: '',
    };
  }, [contact, type]);
}

