import React from 'react';
import { Button } from '../../primitives/Button';
import { formatPhone } from '../../../utils/formatting';
import { useTheme } from '../../contexts/ThemeContext';

export interface PhoneVerificationCardProps {
  /**
   * Номер телефона
   */
  phone: string;
  
  /**
   * Callback при подтверждении актуальности
   */
  onConfirm: (isActual: boolean) => void;
}

/**
 * PhoneVerificationCard - карточка проверки актуальности номера телефона
 */
export const PhoneVerificationCard: React.FC<PhoneVerificationCardProps> = ({
  phone,
  onConfirm,
}) => {
  const { isDark } = useTheme();
  const formattedPhone = formatPhone(phone);

  return (
    <div className="relative p-4 rounded-lg bg-primary/5 border border-primary/20 dark:bg-primary/10 dark:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-text-primary'} mb-1`}>
            Этот номер ещё актуален?
          </p>
          <p className="text-base font-semibold text-primary">
            {formattedPhone}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onConfirm(true)}
          >
            Да
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onConfirm(false)}
          >
            Нет
          </Button>
        </div>
      </div>
    </div>
  );
};

