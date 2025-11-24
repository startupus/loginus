import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../design-system/composites/Modal';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { AuthMethod } from './MethodColumn';
import { getAuthMethodIcon, isHorizontalLogo } from '../../utils/authMethodIcons';
import { preloadModule } from '@/services/i18n/config';

export interface AddAuthMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: 'login' | 'registration';
  onAdd: (method: Omit<AuthMethod, 'name'> & { name?: string }) => void;
  onRemove?: (methodId: string, flow: 'login' | 'registration') => void;
  existingMethods: AuthMethod[];
}

/**
 * Доступные типы методов авторизации
 */
const AVAILABLE_METHOD_TYPES: Array<{
  id: string;
  icon: string;
  type: 'primary' | 'oauth' | 'alternative';
  labelKey: string;
}> = [
  { id: 'phone-email', icon: 'mail', type: 'primary', labelKey: 'phone-email' },
  { id: 'github', icon: 'github', type: 'oauth', labelKey: 'github' },
  { id: 'telegram', icon: 'message-circle', type: 'oauth', labelKey: 'telegram' },
  { id: 'gosuslugi', icon: 'shield', type: 'oauth', labelKey: 'gosuslugi' },
  { id: 'tinkoff', icon: 'tinkoff', type: 'oauth', labelKey: 'tinkoff' },
  { id: 'yandex', icon: 'user', type: 'oauth', labelKey: 'yandex' },
  { id: 'saber', icon: 'user', type: 'oauth', labelKey: 'saber' },
  { id: 'vk', icon: 'users', type: 'oauth', labelKey: 'vk' },
  { id: 'google', icon: 'globe', type: 'oauth', labelKey: 'google' },
  { id: 'apple', icon: 'smartphone', type: 'oauth', labelKey: 'apple' },
  { id: 'microsoft', icon: 'monitor', type: 'oauth', labelKey: 'microsoft' },
  { id: 'qr', icon: 'qr-code', type: 'alternative', labelKey: 'qr' },
  { id: 'password', icon: 'lock', type: 'alternative', labelKey: 'password' },
  { id: 'biometric', icon: 'fingerprint', type: 'alternative', labelKey: 'biometric' },
  { id: 'sms', icon: 'message-circle', type: 'alternative', labelKey: 'sms' },
];

/**
 * AddAuthMethodModal - модальное окно для добавления метода авторизации
 */
export const AddAuthMethodModal: React.FC<AddAuthMethodModalProps> = ({
  isOpen,
  onClose,
  flow,
  onAdd,
  onRemove,
  existingMethods,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  // Предзагрузка модуля admin для переводов
  useEffect(() => {
    const loadAdminModule = async () => {
      try {
        await preloadModule('admin');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AddAuthMethodModal] Failed to preload admin module:', error);
        }
      }
    };

    loadAdminModule();

    // Перезагружаем модуль при смене языка
    const handleLanguageChanged = async () => {
      try {
        await preloadModule('admin');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AddAuthMethodModal] Failed to reload admin module on language change:', error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Получаем методы текущего потока (login или registration)
  const currentFlowMethods = useMemo(() => {
    return existingMethods.filter(m => m.flow === flow);
  }, [existingMethods, flow]);
  
  // Показываем все методы, но помечаем какие уже добавлены в текущий поток
  // Используем useMemo для пересчета при изменении existingMethods
  const allMethods = useMemo(() => {
    return AVAILABLE_METHOD_TYPES.map(method => {
      const existingMethod = currentFlowMethods.find(existing => existing.id === method.id);
      const isAdded = !!existingMethod;
      
      return {
        ...method,
        isAdded,
        existingMethod,
      };
    });
  }, [currentFlowMethods]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethodId) {
      return;
    }

    const selectedMethod = AVAILABLE_METHOD_TYPES.find(m => m.id === selectedMethodId);
    if (!selectedMethod) {
      return;
    }

    // Проверяем, не добавлен ли уже этот метод
    const isAlreadyAdded = allMethods.find(m => m.id === selectedMethodId)?.isAdded;
    if (isAlreadyAdded) {
      return;
    }

    // Определяем порядок (максимальный + 1 для текущего потока)
    const maxOrder = currentFlowMethods.length > 0
      ? Math.max(...currentFlowMethods.map(m => m.order))
      : 0;

    // Добавляем метод
    onAdd({
      id: selectedMethodId,
      icon: selectedMethod.icon,
      type: selectedMethod.type,
      flow,
      enabled: true, // По умолчанию включен
      isPrimary: false, // По умолчанию не основной
      order: maxOrder + 1,
    });

    // Сбрасываем выбранный метод, но НЕ закрываем модальное окно
    // Это позволяет добавлять несколько методов подряд без закрытия модального окна
    setSelectedMethodId('');
  };

  const handleRemove = (methodId: string) => {
    if (onRemove) {
      onRemove(methodId, flow);
      // Если удаляемый метод был выбран, сбрасываем выбор
      if (selectedMethodId === methodId) {
        setSelectedMethodId('');
      }
    }
  };

  const handleClose = () => {
    setSelectedMethodId('');
    onClose();
  };

  const selectedMethod = AVAILABLE_METHOD_TYPES.find(m => m.id === selectedMethodId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('admin.authFlow.addMethod.title')}
      size="md"
      showCloseButton={true}
      footer={
        <div className={`${themeClasses.utility.flex} ${themeClasses.spacing.gap3} ${themeClasses.utility.justifyEnd}`}>
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedMethodId || allMethods.find(m => m.id === selectedMethodId)?.isAdded}
          >
            {t('admin.authFlow.add')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={themeClasses.spacing.spaceY4}>
        {/* Выбор метода */}
        <div>
          <label className={`block text-sm font-medium ${themeClasses.text.primary} ${themeClasses.spacing.mb2}`}>
            {t('admin.authFlow.addMethod.selectMethod')}
          </label>
          <div className={`grid grid-cols-2 ${themeClasses.spacing.gap2}`}>
            {allMethods.map((method) => {
              const isSelected = selectedMethodId === method.id;
              const isAdded = method.isAdded;
              
              return (
                <div
                  key={method.id}
                  className={`relative ${themeClasses.utility.flexCol} ${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap2} ${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} border-2 ${themeClasses.utility.transitionAll} duration-200 ${
                    isSelected
                      ? `${themeClasses.active.navItem} border-primary ${themeClasses.text.primary}`
                      : isAdded
                      ? `${themeClasses.card.default} border-success ${themeClasses.text.secondary} opacity-90 ${themeClasses.background.successSemiTransparent}`
                      : `${themeClasses.card.default} ${themeClasses.border.default} ${themeClasses.text.secondary} hover:border-primary/30 dark:hover:border-primary/40`
                  }`}
                >
                  {isAdded && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(method.id);
                      }}
                      className={`absolute top-2 right-2 ${themeClasses.spacing.p1} ${themeClasses.utility.roundedLg} ${themeClasses.background.destructive} ${themeClasses.text.destructiveForeground} hover:opacity-90 ${themeClasses.utility.transitionColors} ${themeClasses.card.shadow} z-10`}
                      title={t('common.delete', 'Удалить')}
                    >
                      <Icon name="trash" size="xs" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAdded) {
                        setSelectedMethodId(method.id);
                      }
                    }}
                    disabled={isAdded}
                    className={`w-full ${themeClasses.utility.flexCol} ${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap2} ${
                      isAdded ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                  >
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
                      <Icon 
                        name={method.icon as any} 
                        size="md" 
                        className={isSelected ? 'text-primary' : isAdded ? `${themeClasses.text.secondary} opacity-50` : themeClasses.text.secondary}
                      />
                    )}
                    <span className={`text-sm ${themeClasses.typographySize.medium} text-center`}>
                      {(() => {
                        const translationKey = `admin.authFlow.methods.${method.labelKey}`;
                        const translation = t(translationKey);
                        
                        // Проверяем, что перевод - строка и не равен ключу перевода
                        if (typeof translation === 'string' && translation !== translationKey) {
                          return translation;
                        }
                        
                        // Fallback: используем labelKey с первой заглавной буквой
                        // Преобразуем "vk" -> "Vk", "qr-code" -> "Qr Code"
                        return method.labelKey
                          .split('-')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ');
                      })()}
                    </span>
                    {isAdded && (
                      <span className={`text-xs ${themeClasses.text.success} font-medium`}>
                        {t('admin.authFlow.addMethod.added', 'Добавлен')}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </form>
    </Modal>
  );
};
