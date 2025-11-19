import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../primitives/Icon';
import { Button } from '../../primitives/Button';

export interface ErrorMessageProps {
  /**
   * Сообщение об ошибке
   */
  error: string | null;
  
  /**
   * Callback при клике "Попробовать снова"
   */
  onRetry?: () => void;
  
  /**
   * Можно ли повторить действие
   */
  retryable?: boolean;
}

/**
 * ErrorMessage - компонент для отображения ошибок авторизации
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  retryable = false,
}) => {
  const { t } = useTranslation();
  
  if (!error) {
    return null;
  }

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg bg-error/10 border border-error/20"
      role="alert"
    >
      <Icon
        name="alert-circle"
        className="w-5 h-5 text-error flex-shrink-0 mt-0.5"
      />
      <div className="flex-1">
        <p className="text-sm text-error font-medium">{error}</p>
        {retryable && onRetry && (
          <Button
            variant="link"
            size="sm"
            onClick={onRetry}
            className="mt-2 text-error hover:text-error/80"
          >
            {t('common.retry', 'Попробовать снова')}
          </Button>
        )}
      </div>
    </div>
  );
};

