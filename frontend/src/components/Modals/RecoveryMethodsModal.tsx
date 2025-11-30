import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { securityApi } from '@/services/api/security';
import { useAuthStore } from '@/store';

export interface RecoveryMethod {
  id: string;
  name: string;
  contact?: string;
  available: boolean;
  type: 'email' | 'phone' | 'github' | 'telegram' | 'gosuslugi';
  icon: string;
}

export interface RecoveryMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (method: RecoveryMethod) => void;
}

/**
 * RecoveryMethodsModal - модальное окно для выбора способов восстановления пароля
 * Показывает доступные способы на основе данных пользователя (email, phone и т.д.)
 */
export const RecoveryMethodsModal: React.FC<RecoveryMethodsModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Получаем доступные способы восстановления из API
  const { data: recoveryMethodsData, isLoading } = useQuery({
    queryKey: ['recovery-methods'],
    queryFn: async () => {
      const response = await securityApi.getRecoveryMethods();
      // Backend возвращает { success: true, methods: [...] } или { methods: [...] } или массив напрямую
      return response.data?.methods || response.data?.data?.methods || response.data || [];
    },
    enabled: isOpen && !!user,
  });

  // Формируем список доступных способов на основе данных из API и пользователя
  const availableMethods: RecoveryMethod[] = React.useMemo(() => {
    const methods: RecoveryMethod[] = [];
    
    // Добавляем способы из API
    if (Array.isArray(recoveryMethodsData)) {
      recoveryMethodsData.forEach((rm: any) => {
        // Для email считаем доступным, если есть email и он не null/undefined
        // Для обратной совместимости: если verified === undefined, считаем доступным если есть contact
        const isVerified = rm.verified === true || (rm.verified === undefined && !!rm.contact);
        // Для email: если есть email, считаем доступным даже если verified === false (может быть не подтвержден, но email есть)
        const isEmail = rm.type === 'email';
        const isAvailable = isEmail 
          ? (!!rm.contact && (isVerified || rm.verified === false)) // Email доступен если есть contact
          : (isVerified && !!rm.contact); // Для других способов нужна верификация
        
        methods.push({
          id: rm.type || rm.id,
          name: rm.name || (rm.type === 'email' ? t('security.recovery.email', 'Email') : 
                           rm.type === 'phone_telegram' ? t('security.recovery.phone', 'Телефон') : 
                           rm.type || 'Unknown'),
          contact: rm.contact,
          available: isAvailable,
          type: rm.type === 'phone_telegram' ? 'phone' : (rm.type as any) || 'email',
          icon: rm.icon || (rm.type === 'email' ? 'mail' : rm.type === 'phone_telegram' ? 'smartphone' : 'key'),
        });
      });
    }
    
    // Если нет данных из API, формируем на основе данных пользователя
    if (methods.length === 0) {
      if (user?.email) {
        methods.push({
          id: 'email',
          name: t('security.recovery.email', 'Email'),
          contact: user.email,
          available: !!user.emailVerified,
          type: 'email',
          icon: 'mail',
        });
      }
      if (user?.phone) {
        methods.push({
          id: 'phone',
          name: t('security.recovery.phone', 'Телефон'),
          contact: user.phone,
          available: !!user.phoneVerified,
          type: 'phone',
          icon: 'smartphone',
        });
      }
    }
    
    return methods;
  }, [recoveryMethodsData, user, t]);

  const handleSelectMethod = (method: RecoveryMethod) => {
    if (!method.available) {
      return;
    }
    onSelect?.(method);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('security.recovery.modalTitle', 'Выберите способ восстановления')}
      size="md"
    >
      <div className="space-y-6">
        {/* Описание */}
        <div className={`p-4 rounded-lg ${themeClasses.background.tertiary}`}>
          <p className={themeClasses.text.secondary}>
            {t(
              'security.recovery.modalDescription',
              'Выберите способ, на который мы отправим ссылку для восстановления пароля. Доступны только те способы, которые вы указали при регистрации.'
            )}
          </p>
        </div>

        {/* Список доступных способов */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>
            {t('security.recovery.availableMethods', 'Доступные способы')}
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <p className={themeClasses.text.secondary}>{t('common.loading', 'Загрузка...')}</p>
            </div>
          ) : availableMethods.length > 0 ? (
            <div className="space-y-3">
              {availableMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectMethod(method)}
                  disabled={!method.available}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    method.available
                      ? `${themeClasses.border.default} hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer`
                      : 'opacity-40 cursor-not-allowed border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className={themeClasses.iconContainer.gray}>
                    <Icon name={method.icon} size="md" className={themeClasses.text.secondary} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${themeClasses.text.primary}`}>
                      {method.name}
                    </div>
                    {method.contact && (
                      <div className={`text-sm ${themeClasses.text.secondary} mt-1`}>
                        {method.contact}
                      </div>
                    )}
                    {!method.available && (
                      <div className={`text-sm ${themeClasses.text.secondary} mt-1`}>
                        {t('security.recovery.notConfigured', 'Не настроено')}
                      </div>
                    )}
                  </div>
                  {method.available && (
                    <Icon name="chevron-right" size="sm" className={themeClasses.text.secondary} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={themeClasses.text.secondary}>
                {t('security.recovery.noMethods', 'Нет доступных способов восстановления')}
              </p>
              <p className={`text-sm ${themeClasses.text.secondary} mt-2`}>
                {t(
                  'security.recovery.addMethodHint',
                  'Добавьте email или телефон в профиле для настройки способов восстановления'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            {t('common.cancel', 'Отмена')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecoveryMethodsModal;

