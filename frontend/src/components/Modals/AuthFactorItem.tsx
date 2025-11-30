import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@/design-system/primitives/Icon';
import { Button } from '@/design-system/primitives/Button';
import { themeClasses } from '@/design-system/utils/themeClasses';
import type { AuthFactor } from './AuthMethodsModal';

interface AuthFactorItemProps {
  factor: AuthFactor;
  index: number;
  onRemove: (factorId: string) => void;
  onToggle: (factorId: string) => void;
  isDraggable?: boolean;
}

/**
 * Элемент фактора аутентификации с поддержкой drag & drop
 */
export const AuthFactorItem: React.FC<AuthFactorItemProps> = ({
  factor,
  index,
  onRemove,
  onToggle,
  isDraggable = true,
}) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: factor.id,
    disabled: !isDraggable || factor.required,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 rounded-lg border ${
        factor.enabled
          ? 'bg-primary/5 dark:bg-primary/10 border-primary/30'
          : 'bg-gray-1 dark:bg-dark-3 opacity-60'
      } ${themeClasses.border.default} ${
        !factor.required && isDraggable ? 'cursor-move hover:shadow-md' : ''
      } transition-all`}
    >
      {/* Drag handle */}
      {isDraggable && !factor.required && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary"
        >
          <Icon name="menu" size="sm" />
        </div>
      )}

      {/* Номер фактора */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          factor.enabled
            ? 'bg-primary text-white'
            : 'bg-gray-2 dark:bg-gray-1 text-text-secondary'
        }`}
      >
        {index + 1}
      </div>

      {/* Иконка фактора */}
      <div className={themeClasses.iconContainer.gray}>
        <Icon name={factor.icon} size="md" className={themeClasses.text.secondary} />
      </div>

      {/* Информация о факторе */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h5 className={`font-medium ${themeClasses.text.primary}`}>{factor.name}</h5>
          {factor.required && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-error/10 text-error">
              {t('security.authMethods.required', 'Обязательный')}
            </span>
          )}
        </div>
        <p className={`text-sm ${themeClasses.text.secondary} mt-0.5`}>
          {factor.description}
        </p>
      </div>

      {/* Действия */}
      <div className="flex items-center gap-2">
        {factor.required ? (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-error/10 text-error">
            {t('security.authMethods.required', 'Обязательно')}
          </span>
        ) : (
          <>
            <button
              onClick={() => onToggle(factor.id)}
              disabled={factor.required}
              className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                factor.enabled
                  ? 'bg-primary'
                  : 'bg-gray-3 dark:bg-gray-2'
              } ${factor.required ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={factor.enabled ? t('common.disable', 'Отключить') : t('common.enable', 'Включить')}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  factor.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
            <button
              onClick={() => !factor.required && onRemove(factor.id)}
              disabled={factor.required}
              className={`p-2 hover:bg-error/10 rounded-lg transition-colors text-error ${
                factor.required ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={t('common.remove', 'Удалить')}
            >
              <Icon name="trash" size="sm" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

