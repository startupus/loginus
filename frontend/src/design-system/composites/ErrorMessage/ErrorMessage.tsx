import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../primitives/Icon';
import { Button } from '../../primitives/Button';
import { themeClasses } from '../../utils/themeClasses';

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
      className={`${themeClasses.utility.flexItemsStart} ${themeClasses.spacing.gap3} ${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.background.errorSemiTransparent} ${themeClasses.border.errorSemiTransparent}`}
      role="alert"
    >
      <Icon
        name="alert-circle"
        size="md"
        color="rgb(var(--color-error))"
        className="flex-shrink-0 mt-0.5"
      />
      <div className="flex-1">
        <p className="text-sm text-error font-medium">{error}</p>
        {retryable && onRetry && (
          <Button
            variant="link"
            size="sm"
            onClick={onRetry}
            className="mt-2 text-error hover:text-error/80"
            leftIcon={
              <Icon
                name="refresh-cw"
                size="sm"
                color="rgb(var(--color-error))"
              />
            }
          >
            {t('common.retry', 'Попробовать снова')}
          </Button>
        )}
      </div>
    </div>
  );
};

