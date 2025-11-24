import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../design-system/composites/Modal';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { Checkbox } from '../../design-system/primitives/Checkbox';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { AuthMethod } from './MethodColumn';
import { getAuthMethodIcon, isHorizontalLogo } from '../../utils/authMethodIcons';
import { preloadModule } from '@/services/i18n/config';

export interface AddAuthMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: 'login' | 'registration' | 'factors';
  onAdd: (method: Omit<AuthMethod, 'name'> & { name?: string }) => void;
  onRemove?: (methodId: string, flow: 'login' | 'registration' | 'factors') => void;
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
  stepType: 'auth-method';
}> = [
  { id: 'phone-email', icon: 'mail', type: 'primary', labelKey: 'phone-email', stepType: 'auth-method' },
  { id: 'github', icon: 'github', type: 'oauth', labelKey: 'github', stepType: 'auth-method' },
  { id: 'telegram', icon: 'message-circle', type: 'oauth', labelKey: 'telegram', stepType: 'auth-method' },
  { id: 'gosuslugi', icon: 'shield', type: 'oauth', labelKey: 'gosuslugi', stepType: 'auth-method' },
  { id: 'tinkoff', icon: 'tinkoff', type: 'oauth', labelKey: 'tinkoff', stepType: 'auth-method' },
  { id: 'yandex', icon: 'user', type: 'oauth', labelKey: 'yandex', stepType: 'auth-method' },
  { id: 'saber', icon: 'user', type: 'oauth', labelKey: 'saber', stepType: 'auth-method' },
  { id: 'vk', icon: 'users', type: 'oauth', labelKey: 'vk', stepType: 'auth-method' },
  { id: 'google', icon: 'globe', type: 'oauth', labelKey: 'google', stepType: 'auth-method' },
  { id: 'apple', icon: 'smartphone', type: 'oauth', labelKey: 'apple', stepType: 'auth-method' },
  { id: 'microsoft', icon: 'monitor', type: 'oauth', labelKey: 'microsoft', stepType: 'auth-method' },
  { id: 'qr', icon: 'qr-code', type: 'alternative', labelKey: 'qr', stepType: 'auth-method' },
  { id: 'password', icon: 'lock', type: 'alternative', labelKey: 'password', stepType: 'auth-method' },
  { id: 'biometric', icon: 'fingerprint', type: 'alternative', labelKey: 'biometric', stepType: 'auth-method' },
  { id: 'sms', icon: 'message-circle', type: 'alternative', labelKey: 'sms', stepType: 'auth-method' },
];

/**
 * Доступные шаги регистрации (поля формы)
 */
const AVAILABLE_REGISTRATION_STEPS: Array<{
  id: string;
  icon: string;
  type: 'registration-field';
  labelKey: string;
  stepType: 'field';
  fieldType: 'surname' | 'name' | 'passport' | 'inn' | 'snils' | 'birthdate' | 'gender';
}> = [
  { id: 'surname', icon: 'user', type: 'registration-field', labelKey: 'surname', stepType: 'field', fieldType: 'surname' },
  { id: 'name', icon: 'user', type: 'registration-field', labelKey: 'name', stepType: 'field', fieldType: 'name' },
  { id: 'passport', icon: 'file-text', type: 'registration-field', labelKey: 'passport', stepType: 'field', fieldType: 'passport' },
  { id: 'inn', icon: 'credit-card', type: 'registration-field', labelKey: 'inn', stepType: 'field', fieldType: 'inn' },
  { id: 'snils', icon: 'shield', type: 'registration-field', labelKey: 'snils', stepType: 'field', fieldType: 'snils' },
  { id: 'birthdate', icon: 'calendar', type: 'registration-field', labelKey: 'birthdate', stepType: 'field', fieldType: 'birthdate' },
  { id: 'gender', icon: 'users', type: 'registration-field', labelKey: 'gender', stepType: 'field', fieldType: 'gender' },
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
  const [selectedMethodIds, setSelectedMethodIds] = useState<string[]>([]);

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
  
  // Для registration flow показываем шаги регистрации, для login и factors - методы авторизации
  const availableItems = useMemo(() => {
    if (flow === 'registration') {
      // Объединяем шаги регистрации и методы авторизации
      const allRegistrationItems = [
        ...AVAILABLE_REGISTRATION_STEPS.map(step => ({
          ...step,
          id: step.id,
        })),
        ...AVAILABLE_METHOD_TYPES.map(method => ({
          ...method,
          id: method.id,
        })),
      ];
      
      return allRegistrationItems.map(item => {
        const existingMethod = currentFlowMethods.find(existing => existing.id === item.id);
        const isAdded = !!existingMethod;
        
        return {
          ...item,
          isAdded,
          existingMethod,
        };
      });
    } else {
      // Для login и factors flow показываем только методы авторизации
      return AVAILABLE_METHOD_TYPES.map(method => {
    const existingMethod = currentFlowMethods.find(existing => existing.id === method.id);
    const isAdded = !!existingMethod;
    
    return {
      ...method,
      isAdded,
      existingMethod,
    };
  });
    }
  }, [currentFlowMethods, flow]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMethodIds.length === 0) {
      return;
    }

    // Определяем порядок (максимальный + 1 для текущего потока)
    const maxOrder = currentFlowMethods.length > 0
      ? Math.max(...currentFlowMethods.map(m => m.order))
      : 0;

    // Добавляем все выбранные методы
    selectedMethodIds.forEach((methodId, index) => {
      // Находим выбранный элемент (шаг регистрации или метод авторизации)
      const selectedItem = flow === 'registration'
        ? [...AVAILABLE_REGISTRATION_STEPS, ...AVAILABLE_METHOD_TYPES].find(item => item.id === methodId)
        : AVAILABLE_METHOD_TYPES.find(m => m.id === methodId);
      
      if (!selectedItem) {
        return;
      }

      // Проверяем, не добавлен ли уже этот элемент
      const isAlreadyAdded = availableItems.find(m => m.id === methodId)?.isAdded;
      if (isAlreadyAdded) {
        return;
      }

      // Добавляем шаг/метод
      const itemToAdd: any = {
        id: selectedItem.id,
        icon: selectedItem.icon,
        type: selectedItem.type,
        flow,
        enabled: true, // По умолчанию включен
        isPrimary: false, // По умолчанию не основной
        order: maxOrder + 1 + index,
        stepType: selectedItem.stepType,
      };

      // Для шагов регистрации добавляем fieldType
      if ('fieldType' in selectedItem) {
        itemToAdd.fieldType = selectedItem.fieldType;
      }

      onAdd(itemToAdd);
    });

    // Закрываем модалку после добавления
    setSelectedMethodIds([]);
    onClose();
  };

  const handleRemove = (methodId: string) => {
    if (onRemove) {
      onRemove(methodId, flow);
      // Если удаляемый метод был выбран, убираем из выбранных
      setSelectedMethodIds(prev => prev.filter(id => id !== methodId));
    }
  };

  const handleClose = () => {
    setSelectedMethodIds([]);
    onClose();
  };

  const handleToggleMethod = (methodId: string) => {
    setSelectedMethodIds(prev => {
      if (prev.includes(methodId)) {
        return prev.filter(id => id !== methodId);
      } else {
        return [...prev, methodId];
      }
    });
  };

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
            disabled={selectedMethodIds.length === 0 || selectedMethodIds.every(id => availableItems.find(m => m.id === id)?.isAdded)}
          >
            {selectedMethodIds.length > 0 
              ? `${t('admin.authFlow.add')} (${selectedMethodIds.length})`
              : t('admin.authFlow.add')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={themeClasses.spacing.spaceY4}>
        {/* Выбор метода */}
        <div>
          <label className={`block text-sm font-medium ${themeClasses.text.primary} ${themeClasses.spacing.mb2}`}>
            {t('admin.authFlow.addMethod.selectMethod')}
            {selectedMethodIds.length > 0 && (
              <span className={`ml-2 text-xs ${themeClasses.text.secondary}`}>
                ({selectedMethodIds.length} {selectedMethodIds.length === 1 ? 'выбран' : 'выбрано'})
              </span>
            )}
          </label>
          <div className={`grid grid-cols-2 ${themeClasses.spacing.gap2}`}>
            {availableItems.map((method) => {
              const isSelected = selectedMethodIds.includes(method.id);
              const isAdded = method.isAdded;
              
              return (
                <div
                  key={method.id}
                  onClick={(e) => {
                    if (!isAdded) {
                      e.stopPropagation();
                      handleToggleMethod(method.id);
                    }
                  }}
                  className={`relative ${themeClasses.utility.flexCol} ${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap2} ${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} border-2 ${themeClasses.utility.transitionAll} duration-200 ${
                    isSelected
                      ? `${themeClasses.active.navItem} border-primary ${themeClasses.text.primary}`
                      : isAdded
                      ? `${themeClasses.card.default} border-success ${themeClasses.text.secondary} opacity-90 ${themeClasses.background.successSemiTransparent} cursor-not-allowed`
                      : `${themeClasses.card.default} ${themeClasses.border.default} ${themeClasses.text.secondary} hover:border-primary/30 dark:hover:border-primary/40 cursor-pointer`
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
                  {!isAdded && (
                    <div 
                      className="absolute top-2 left-2 z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMethod(method.id);
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(checked) => {
                          handleToggleMethod(method.id);
                        }}
                        size="md"
                      />
                    </div>
                  )}
                  <div
                    className={`w-full ${themeClasses.utility.flexCol} ${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap2} ${
                      isAdded ? 'cursor-not-allowed opacity-50' : ''
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
                        // Для шагов регистрации используем другой ключ перевода
                        const translationKey = method.stepType === 'field'
                          ? `admin.authFlow.registrationSteps.${method.labelKey}`
                          : `admin.authFlow.methods.${method.labelKey}`;
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </form>
    </Modal>
  );
};
