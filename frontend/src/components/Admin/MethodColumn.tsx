import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { EmptyState } from '../../design-system/composites/EmptyState';
import { Switch } from '../../design-system/composites/Switch';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { getAuthMethodIcon, isHorizontalLogo } from '../../utils/authMethodIcons';

export interface AuthMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  isPrimary: boolean;
  order: number;
  type: 'primary' | 'oauth' | 'alternative';
  flow: 'login' | 'registration';
}

interface MethodColumnProps {
  title: string;
  methods: AuthMethod[];
  flow: 'login' | 'registration';
  draggedItem: string | null;
  onAddMethod: () => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string, flow: 'login' | 'registration') => void;
  onDragEnd: () => void;
  onTogglePrimary: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onRemoveMethod: (id: string, flow: 'login' | 'registration') => void;
  canTogglePrimary?: (id: string) => boolean;
}

/**
 * MethodColumn - компонент для отображения колонки с методами авторизации
 * Использует компоненты из дизайн-системы: Switch, EmptyState, Button, Icon, Badge
 */
export const MethodColumn: React.FC<MethodColumnProps> = ({
  title,
  methods,
  flow,
  draggedItem,
  onAddMethod,
  onDragStart,
  onDragOver,
  onDragEnd,
  onTogglePrimary,
  onToggleEnabled,
  onRemoveMethod,
  canTogglePrimary,
}) => {
  const { t } = useTranslation();
  
  // Проверяем, можно ли снять primary с метода
  const canToggle = (methodId: string) => {
    if (canTogglePrimary) {
      return canTogglePrimary(methodId);
    }
    return true;
  };

  return (
    <div>
      <div className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.utility.justifyBetween} ${themeClasses.spacing.mb4} relative z-10`}>
        <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
          {title}
        </h3>
        <div className="relative z-10">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="plus" size="sm" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddMethod();
            }}
            className="hidden sm:flex relative z-10"
            type="button"
          >
            {t('admin.authFlow.add')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddMethod();
            }}
            iconOnly
            className="sm:hidden relative z-10"
            type="button"
          >
            <Icon name="plus" size="sm" />
          </Button>
        </div>
      </div>
      <div className={themeClasses.spacing.spaceY3}>
        {methods.length === 0 ? (
          <EmptyState
            icon="inbox"
            title={t('admin.authFlow.noMethods', 'Нет методов')}
            variant="default"
          />
        ) : (
          methods.map((method) => (
            <div
              key={method.id}
              draggable
              onDragStart={() => onDragStart(method.id)}
              onDragOver={(e) => onDragOver(e, method.id, flow)}
              onDragEnd={onDragEnd}
              className={`${themeClasses.card.default} ${themeClasses.spacing.p4} cursor-move hover:shadow-lg ${themeClasses.utility.transitionAll} ${
                draggedItem === method.id ? 'opacity-50' : ''
              } ${!method.enabled ? 'opacity-60' : ''}`}
            >
              <div className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.utility.justifyBetween}`}>
                <div className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap3}`}>
                  <Icon name="grip-vertical" size="sm" className={themeClasses.text.secondary} />
                  {/* Используем getAuthMethodIcon для специальных иконок (tinkoff, yandex, saber и др.), 
                      иначе используем компонент Icon */}
                  {getAuthMethodIcon(method.id) ? (
                    <div className={`flex items-center justify-center ${
                      isHorizontalLogo(method.id) 
                        ? 'w-12 h-5 [&>svg]:w-full [&>svg]:h-full' 
                        : 'w-5 h-5 [&>svg]:w-full [&>svg]:h-full'
                    }`}>
                      {getAuthMethodIcon(method.id)}
                    </div>
                  ) : (
                    <Icon name={method.icon as any} size="md" className={themeClasses.text.primary} />
                  )}
                  <div>
                    <p className={`font-medium ${themeClasses.text.primary}`}>{method.name}</p>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>
                      {t('admin.authFlow.order')}: {method.order}
                    </p>
                  </div>
                </div>
                <div className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap3}`}>
                  <Switch
                    checked={method.enabled}
                    onChange={() => onToggleEnabled(method.id)}
                    size="sm"
                  />
                  {method.isPrimary && (
                    <button
                      onClick={() => canToggle(method.id) && onTogglePrimary(method.id)}
                      disabled={!canToggle(method.id)}
                      title={canToggle(method.id) 
                        ? t('admin.authFlow.primaryOnStartPage') 
                        : t('admin.authFlow.cannotRemovePrimary', 'Хотя бы один метод должен быть основным')}
                      className={`${themeClasses.spacing.p1} ${themeClasses.utility.roundedLg} ${themeClasses.utility.transitionColors} ${themeClasses.text.warning} ${
                        !canToggle(method.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <Icon name="star" size="sm" />
                    </button>
                  )}
                  {!method.isPrimary && method.type !== 'primary' && (
                    <button
                      onClick={() => onTogglePrimary(method.id)}
                      title={t('admin.authFlow.primaryOnStartPage')}
                      className={`${themeClasses.spacing.p1} ${themeClasses.utility.roundedLg} ${themeClasses.utility.transitionColors} ${themeClasses.text.secondary} cursor-pointer`}
                    >
                      <Icon name="star" size="sm" />
                    </button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    iconOnly
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveMethod(method.id, flow);
                    }}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                    title={t('common.delete', 'Удалить')}
                    type="button"
                  >
                    <Icon name="trash" size="sm" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
