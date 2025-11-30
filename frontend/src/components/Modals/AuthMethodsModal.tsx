import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { AuthFactorItem } from './AuthFactorItem';
import { securityApi } from '@/services/api/security';

/**
 * Типы факторов аутентификации
 */
export type AuthFactorType = 
  | 'password'
  | 'email-code'
  | 'sms-code'
  | 'telegram'
  | 'github'
  | 'gosuslugi'
  | 'tinkoff'
  | 'yandex'
  | 'saber'
  | 'biometric';

/**
 * Фактор аутентификации
 */
export interface AuthFactor {
  id: string;
  type: AuthFactorType;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  required: boolean; // Обязательный фактор (пароль)
  available: boolean; // Доступен ли фактор (например, подключен ли аккаунт)
}

/**
 * Путь аутентификации - последовательность факторов
 */
export interface AuthPath {
  factors: AuthFactor[];
}

export interface AuthMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: AuthFactor[];
  connectedAccounts: string[]; // ID подключенных внешних аккаунтов
  onSave: (path: AuthFactor[]) => void;
  userId?: string; // ID пользователя для добавления дополнительных факторов
}

/**
 * AuthMethodsModal - модальное окно для настройки способов входа
 * Позволяет пользователю настроить последовательность факторов аутентификации
 * И добавить дополнительные факторы через API
 */
export const AuthMethodsModal: React.FC<AuthMethodsModalProps> = ({
  isOpen,
  onClose,
  currentPath = [],
  connectedAccounts = [],
  onSave,
  userId,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [authPath, setAuthPath] = useState<AuthFactor[]>(currentPath);
  const [isSaving, setIsSaving] = useState(false);

  // Синхронизация локального состояния с пропсами
  useEffect(() => {
    setAuthPath(currentPath);
  }, [currentPath, isOpen]);

  // Мутация для добавления дополнительного фактора через API
  const addFactorMutation = useMutation({
    mutationFn: async (method: string) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await securityApi.addAuthFactor(method);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-auth-factors'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  // Мутация для удаления дополнительного фактора через API
  const removeFactorMutation = useMutation({
    mutationFn: async (factorId: string) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await securityApi.removeAuthFactor(factorId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-auth-factors'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  // Настройка сенсоров для drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Все доступные факторы аутентификации
  // Исключаем обязательные факторы из списка доступных для добавления
  const mandatoryFactorIds = authPath.filter(f => f.required).map(f => f.id);
  
  const allFactors: AuthFactor[] = [
    {
      id: 'password',
      type: 'password',
      name: t('security.factors.password', 'Пароль'),
      description: t('security.factors.passwordDesc', 'Основной способ входа'),
      icon: 'key',
      enabled: authPath.some(f => f.type === 'password'),
      required: false, // Пароль не обязателен для добавления, так как он уже в обязательных
      available: !mandatoryFactorIds.includes('password'),
    },
    {
      id: 'email-code',
      type: 'email-code',
      name: t('security.factors.emailCode', 'Код на почту'),
      description: t('security.factors.emailCodeDesc', 'Отправим код на ваш email'),
      icon: 'mail',
      enabled: authPath.some(f => f.type === 'email-code'),
      required: false,
      available: true,
    },
    {
      id: 'sms-code',
      type: 'sms-code',
      name: t('security.factors.smsCode', 'СМС-код'),
      description: t('security.factors.smsCodeDesc', 'Отправим код в SMS'),
      icon: 'smartphone',
      enabled: authPath.some(f => f.type === 'sms-code'),
      required: false,
      available: true,
    },
    {
      id: 'telegram',
      type: 'telegram',
      name: 'Telegram',
      description: t('security.factors.telegramDesc', 'Подтверждение через Telegram'),
      icon: 'message-circle',
      enabled: authPath.some(f => f.type === 'telegram'),
      required: false,
      available: connectedAccounts.includes('telegram'),
    },
    {
      id: 'github',
      type: 'github',
      name: 'Github',
      description: t('security.factors.githubDesc', 'Вход через Github аккаунт'),
      icon: 'github',
      enabled: authPath.some(f => f.type === 'github'),
      required: false,
      available: connectedAccounts.includes('github'),
    },
    {
      id: 'gosuslugi',
      type: 'gosuslugi',
      name: t('security.factors.gosuslugi', 'Госуслуги'),
      description: t('security.factors.gosuslugiDesc', 'Подтверждение через Госуслуги'),
      icon: 'shield',
      enabled: authPath.some(f => f.type === 'gosuslugi'),
      required: false,
      available: connectedAccounts.includes('gosuslugi'),
    },
    {
      id: 'tinkoff',
      type: 'tinkoff',
      name: 'Tinkoff ID',
      description: t('security.factors.tinkoffDesc', 'Подтверждение через Tinkoff'),
      icon: 'credit-card',
      enabled: authPath.some(f => f.type === 'tinkoff'),
      required: false,
      available: connectedAccounts.includes('tinkoff'),
    },
    {
      id: 'yandex',
      type: 'yandex',
      name: 'Yandex ID',
      description: t('security.factors.yandexDesc', 'Подтверждение через Yandex'),
      icon: 'globe',
      enabled: authPath.some(f => f.type === 'yandex'),
      required: false,
      available: connectedAccounts.includes('yandex'),
    },
    {
      id: 'saber',
      type: 'saber',
      name: 'Saber ID',
      description: t('security.factors.saberDesc', 'Подтверждение через Saber'),
      icon: 'shield',
      enabled: authPath.some(f => f.type === 'saber'),
      required: false,
      available: connectedAccounts.includes('saber'),
    },
  ];

  // Факторы, включенные в путь
  const enabledFactors = authPath.filter(f => f.enabled);
  
  // Факторы, доступные для добавления (исключаем обязательные и уже добавленные)
  const availableFactors = allFactors.filter(
    f => !authPath.some(p => p.id === f.id) && f.available && !f.required
  );

  const handleAddFactor = async (factor: AuthFactor) => {
    // Если userId указан, добавляем фактор через API
    if (userId) {
      setIsSaving(true);
      try {
        await addFactorMutation.mutateAsync(factor.type);
        setAuthPath([...authPath, { ...factor, enabled: true }]);
      } catch (error) {
        console.error('Failed to add factor:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Локальное добавление без API
      setAuthPath([...authPath, { ...factor, enabled: true }]);
    }
  };

  const handleRemoveFactor = async (factorId: string) => {
    // Не позволяем удалять обязательные факторы
    const factor = authPath.find(f => f.id === factorId);
    if (factor?.required) {
      console.warn('Cannot remove required factor:', factorId);
      return;
    }
    
    // Если userId указан, удаляем фактор через API
    if (userId) {
      setIsSaving(true);
      try {
        await removeFactorMutation.mutateAsync(factorId);
        setAuthPath(authPath.filter(f => f.id !== factorId));
      } catch (error) {
        console.error('Failed to remove factor:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Локальное удаление без API
      setAuthPath(authPath.filter(f => f.id !== factorId));
    }
  };

  const handleToggleFactor = (factorId: string) => {
    setAuthPath(
      authPath.map(f =>
        f.id === factorId ? { ...f, enabled: !f.enabled } : f
      )
    );
  };

  // Обработка завершения перетаскивания
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAuthPath((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Не позволяем перемещать обязательные факторы
        if (items[oldIndex]?.required || items[newIndex]?.required) {
          return items;
        }

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onSave(authPath);
    onClose();
  };

  const handleReset = () => {
    setAuthPath(currentPath);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('security.authMethods.title', 'Настройка способов входа')}
      size="2xl"
    >
      <div className="space-y-6">
        {/* Описание */}
        <div className={`p-4 rounded-lg ${themeClasses.background.tertiary}`}>
          <p className={themeClasses.text.secondary}>
            {t(
              'security.authMethods.description',
              'Настройте последовательность факторов для входа в аккаунт. Вы можете использовать комбинацию пароля, кодов и связанных аккаунтов.'
            )}
          </p>
        </div>

        {/* Текущий путь аутентификации */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>
            {t('security.authMethods.currentPath', 'Путь входа')}
          </h3>
          
          {authPath.length === 0 ? (
            <div className={`p-8 text-center rounded-lg border-2 border-dashed ${themeClasses.border.default}`}>
              <Icon name="alert-circle" size="xl" className={`${themeClasses.text.secondary} mx-auto mb-3`} />
              <p className={themeClasses.text.secondary}>
                {t('security.authMethods.noFactors', 'Добавьте факторы аутентификации')}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={authPath.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {authPath.map((factor, index) => (
                    <AuthFactorItem
                      key={factor.id}
                      factor={factor}
                      index={index}
                      onRemove={handleRemoveFactor}
                      onToggle={handleToggleFactor}
                      isDraggable={!factor.required}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Доступные факторы для добавления */}
        {availableFactors.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>
              {t('security.authMethods.available', 'Доступные факторы')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFactors.map((factor) => (
                <button
                  key={factor.id}
                  onClick={() => handleAddFactor(factor)}
                  disabled={!factor.available}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 border-dashed transition-all text-left ${
                    factor.available
                      ? `${themeClasses.border.default} hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10`
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className={themeClasses.iconContainer.gray}>
                    <Icon name={factor.icon} size="md" className={themeClasses.text.secondary} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${themeClasses.text.primary}`}>
                      {factor.name}
                    </div>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>
                      {factor.description}
                    </div>
                  </div>
                  <Icon name="plus" size="sm" className={themeClasses.text.secondary} />
                </button>
              ))}
            </div>

            {availableFactors.some(f => !f.available) && (
              <p className={`mt-3 text-sm ${themeClasses.text.secondary}`}>
                <Icon name="info" size="sm" className="inline mr-1" />
                {t(
                  'security.authMethods.connectToEnable',
                  'Подключите внешние аккаунты на странице данных, чтобы использовать их для входа'
                )}
              </p>
            )}
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-2 dark:border-dark-2">
          <Button variant="ghost" onClick={handleReset}>
            {t('common.reset', 'Сбросить')}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel', 'Отмена')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={authPath.length === 0 || isSaving}
              loading={isSaving}
            >
              {t('common.save', 'Сохранить')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

