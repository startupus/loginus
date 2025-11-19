import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../primitives/Button';
import { useResendTimer } from '../../../hooks/useResendTimer';

export interface ResendTimerProps {
  /**
   * Начальное количество секунд
   */
  initialSeconds: number;
  
  /**
   * Callback при повторной отправке
   */
  onResend: () => void;
  
  /**
   * Отключено
   */
  disabled?: boolean;
  
  /**
   * Текст перед таймером
   */
  label?: string;
}

/**
 * ResendTimer - компонент таймера для повторной отправки кода
 */
export const ResendTimer: React.FC<ResendTimerProps> = ({
  initialSeconds,
  onResend,
  disabled = false,
  label,
}) => {
  const { t } = useTranslation();
  const { canResend, format } = useResendTimer(initialSeconds);
  
  const defaultLabel = t('auth.verifyCode.resendTimer', 'Повторно код можно будет отправить через');
  const resendButtonText = t('auth.verifyCode.resendButton', 'Не пришёл код? Отправить повторно');

  return (
    <div className="text-center">
      {!canResend ? (
        <p className="text-sm text-body-color dark:text-dark-6">
          {label || defaultLabel} {format}
        </p>
      ) : (
        <Button
          variant="link"
          size="sm"
          onClick={onResend}
          disabled={disabled}
          className="text-primary hover:text-primary dark:text-primary-400"
        >
          {resendButtonText}
        </Button>
      )}
    </div>
  );
};

