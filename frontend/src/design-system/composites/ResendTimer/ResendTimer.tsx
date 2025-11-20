import React from 'react';
import { useTranslation } from 'react-i18next';
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
        <p className="text-sm text-text-secondary">
          {label || defaultLabel} {format}
        </p>
      ) : (
        <button
          type="button"
          onClick={onResend}
          disabled={disabled}
          className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors disabled:text-text-secondary disabled:no-underline disabled:cursor-not-allowed disabled:opacity-70"
        >
          {resendButtonText}
        </button>
      )}
    </div>
  );
};

