import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { preloadModule } from '@/services/i18n/config';
// Прямые импорты для tree-shaking
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { SeparatedList } from '@/design-system/composites/SeparatedList';
import { SecurityListItem } from '@/design-system/composites/SecurityListItem';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { themeClasses } from '@/design-system/utils';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { securityApi } from '@/services/api/security';
import { useModal } from '@/hooks/useModal';
import type { AuthFactor } from '@/components/Modals';
import { Modal } from '@/design-system/composites/Modal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authFlowApi } from '@/services/api/auth-flow';
import { useAuthStore } from '@/store';

// Lazy loading для модалок
const AuthMethodsModal = lazy(() => import('@/components/Modals/AuthMethodsModal').then(m => ({ default: m.AuthMethodsModal })));
const ChangePasswordModal = lazy(() => import('@/components/security/ChangePasswordModal'));
const RecoveryMethodsModal = lazy(() => import('@/components/Modals/RecoveryMethodsModal').then(m => ({ default: m.RecoveryMethodsModal })));

// Предзагрузка модуля profile для быстрого отображения переводов
if (typeof window !== 'undefined') {
  void preloadModule('profile');
}


interface Device {
  id: string;
  name: string;
  type: string;
  lastActive: string;
  isCurrent?: boolean;
  ip?: string;
  location?: string;
}

interface Activity {
  id: string;
  action: string;
  date: string;
  ip: string;
  device: string;
  location?: string;
}

/**
 * SecurityPage - страница управления безопасностью аккаунта
 * Реализована по референсу Yandex ID: https://id.yandex.ru/security
 * 
 * Оптимизация: загрузка устройств не блокирует рендеринг страницы
 */
const SecurityPage: React.FC = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const currentLang = useCurrentLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesCount, setDevicesCount] = useState<number>(1); // Оптимистичное значение по умолчанию
  const authMethodsModal = useModal();
  const changePasswordModal = useModal();
  const recoveryMethodsModal = useModal();
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  // Моковые данные для даты последнего изменения пароля (14 месяцев назад)
  const passwordLastChanged = '14 месяцев назад';
  
  // Получаем публичную конфигурацию Auth Flow (обязательные факторы)
  const { data: publicAuthFlow } = useQuery({
    queryKey: ['auth-flow-public'],
    queryFn: async () => {
      try {
        const response = await authFlowApi.getPublicAuthFlow();
        return (response.data as any)?.data || response.data;
      } catch (e) {
        console.error('Failed to load public auth flow:', e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Получаем пользовательские настройки (дополнительные факторы)
  const { data: userFlowSettings } = useQuery({
    queryKey: ['user-flow-settings'],
    queryFn: async () => {
      try {
        const response = await authFlowApi.getUserFlowSettings();
        return response.data;
      } catch (e) {
        console.error('Failed to load user flow settings:', e);
        return null;
      }
    },
    enabled: !!user,
  });

  // Формируем текущий путь аутентификации из обязательных факторов и дополнительных
  const authPath = useMemo<AuthFactor[]>(() => {
    const factors: AuthFactor[] = [];
    
    // Добавляем обязательные факторы из публичной конфигурации (factors - это обязательные 2FA факторы)
    if (publicAuthFlow?.factors && Array.isArray(publicAuthFlow.factors)) {
      publicAuthFlow.factors.forEach((factor: any) => {
        // Маппинг типов из backend в типы AuthFactor
        let factorType: AuthFactor['type'] = 'password';
        if (factor.id === 'email-code' || factor.type === 'email-code') factorType = 'email-code';
        else if (factor.id === 'sms-code' || factor.type === 'sms-code') factorType = 'sms-code';
        else if (factor.id === 'telegram' || factor.type === 'telegram') factorType = 'telegram';
        else if (factor.id === 'github' || factor.type === 'github') factorType = 'github';
        else if (factor.id === 'gosuslugi' || factor.type === 'gosuslugi') factorType = 'gosuslugi';
        else if (factor.id === 'tinkoff' || factor.type === 'tinkoff') factorType = 'tinkoff';
        else if (factor.id === 'yandex' || factor.type === 'yandex') factorType = 'yandex';
        else if (factor.id === 'saber' || factor.type === 'saber') factorType = 'saber';
        
        // Получаем правильное название фактора
        let factorName = factor.name;
        if (!factorName) {
          // Маппинг ID факторов на человекочитаемые названия
          const factorNameMap: Record<string, string> = {
            'phone-email': t('security.factors.phoneEmail', 'Телефон или Email'),
            'password': t('security.factors.password', 'Пароль'),
            'email-code': t('security.factors.emailCode', 'Код на почту'),
            'sms-code': t('security.factors.smsCode', 'СМС-код'),
            'telegram': 'Telegram',
            'github': 'Github',
            'gosuslugi': t('security.factors.gosuslugi', 'Госуслуги'),
            'tinkoff': 'Tinkoff ID',
            'yandex': 'Yandex ID',
            'saber': 'Saber ID',
          };
          factorName = factorNameMap[factor.id] || factor.id;
        }
        
        factors.push({
          id: factor.id,
          type: factorType,
          name: factorName,
          description: factor.description || t(`security.factors.${factor.id}Desc`, 'Обязательный фактор'),
          icon: factor.icon || 'key',
          enabled: true,
          required: true,
          available: true,
        });
      });
    }
    
    // Если нет обязательных факторов, добавляем пароль по умолчанию
    if (factors.length === 0) {
      factors.push({
        id: 'password',
        type: 'password',
        name: t('security.factors.password', 'Пароль'),
        description: t('security.factors.passwordDesc', 'Основной способ входа'),
        icon: 'key',
        enabled: true,
        required: true,
        available: true,
      });
    }
    
    // Добавляем дополнительные факторы пользователя
    if (userFlowSettings?.additionalFactors && Array.isArray(userFlowSettings.additionalFactors)) {
      userFlowSettings.additionalFactors.forEach((factor: any) => {
        let factorType: AuthFactor['type'] = 'password';
        if (factor.id === 'email-code' || factor.type === 'email-code') factorType = 'email-code';
        else if (factor.id === 'sms-code' || factor.type === 'sms-code') factorType = 'sms-code';
        else if (factor.id === 'telegram' || factor.type === 'telegram') factorType = 'telegram';
        else if (factor.id === 'github' || factor.type === 'github') factorType = 'github';
        else if (factor.id === 'gosuslugi' || factor.type === 'gosuslugi') factorType = 'gosuslugi';
        else if (factor.id === 'tinkoff' || factor.type === 'tinkoff') factorType = 'tinkoff';
        else if (factor.id === 'yandex' || factor.type === 'yandex') factorType = 'yandex';
        else if (factor.id === 'saber' || factor.type === 'saber') factorType = 'saber';
        
        factors.push({
          id: factor.id,
          type: factorType,
          name: factor.name || t(`security.factors.${factor.id}`, factor.id),
          description: factor.description || t(`security.factors.${factor.id}Desc`, 'Дополнительный фактор'),
          icon: factor.icon || 'key',
          enabled: factor.enabled !== false,
          required: false,
          available: factor.available !== false,
        });
      });
    }
    
    return factors;
  }, [publicAuthFlow, userFlowSettings, t, i18nInstance.language]);
  
  const [authPathState, setAuthPathState] = useState<AuthFactor[]>(authPath);
  
  // Синхронизируем состояние при изменении языка или переводов
  useEffect(() => {
    setAuthPathState(authPath);
  }, [authPath]);

  // Список подключенных аккаунтов (TODO: получать из API)
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  useEffect(() => {
    // Асинхронная загрузка устройств в фоне, не блокирует рендеринг
    let isMounted = true;
    
    const fetchDevices = async () => {
      try {
        const devicesRes = await securityApi.getDevices();
        const devicesList = devicesRes.data?.data || devicesRes.data || [];
        if (isMounted) {
          setDevices(devicesList);
          setDevicesCount(devicesList.length || 1);
        }
      } catch (error) {
        console.error('Failed to fetch security data', error);
        // Оставляем значение по умолчанию при ошибке
      }
    };

    // Загружаем с задержкой через requestIdleCallback для не блокирования рендера
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        fetchDevices();
      }, { timeout: 500 });
    } else {
      setTimeout(fetchDevices, 100);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageTemplate 
        title={t('security.title', 'Безопасность')}
        showSidebar={true}
        contentClassName={themeClasses.container.content}
      >
      {/* Промо-блок "Усиленная защита" */}
      <div className={themeClasses.promo.containerPrimary}>
        <div className={themeClasses.promo.content}>
          <div className="flex-1">
            <h2 className={themeClasses.promo.title}>
              {t('security.enhancedProtection.title', 'Усиленная защита')}
            </h2>
            <p className={themeClasses.promo.description}>
              {t('security.enhancedProtection.description', 'Аккаунт защищён паролем, и есть способы восстановления доступа. Добавьте второй фактор для входа и получите максимальную защиту')}
            </p>
            <div className={themeClasses.promo.subtitleContainer}>
              <Icon name="shield" size="md" className={themeClasses.promo.subtitle} />
              <span className={themeClasses.promo.subtitle}>
                {t('security.enhancedProtection.subtitle', 'С двухфакторным входом надёжнее')}
              </span>
            </div>
            <Button 
              variant="outline"
              className={themeClasses.promo.button}
              onClick={authMethodsModal.open}
            >
              {t('security.enhancedProtection.action', 'Защитить по максимуму')}
            </Button>
          </div>
          <div className="hidden md:block">
            <Icon name="shield" size="xl" className={themeClasses.promo.icon} />
          </div>
        </div>
        {/* Decorative circles */}
        <div className={themeClasses.decorative.promoCircle}></div>
        <div className={themeClasses.decorative.promoCircleSmall}></div>
      </div>

      {/* Секция "Способ входа" */}
      <DataSection
        id="enter-methods"
        title={t('security.loginMethods.title', 'Способ входа')}
        description={t('security.loginMethods.description', 'Как вы заходите на сервисы Loginus')}
      >
        <div className={themeClasses.list.container}>
          <SeparatedList className="p-4">
            {/* Текущий способ входа - одна кнопка, открывающая модальное окно */}
            <SecurityListItem
              icon="key"
              title={t('security.loginMethods.current', 'Текущий способ')}
              description={t('security.loginMethods.currentDesc', 'Настройки окна входа и факторов авторизации')}
              onClick={() => {
                // Обновляем состояние перед открытием модалки для актуальных переводов
                setAuthPathState(authPath);
                authMethodsModal.open();
              }}
            />

            {/* Кнопка обновления пароля с информацией о дате */}
            <SecurityListItem
              icon="refresh-cw"
              title={t('security.password.change', 'Обновить пароль')}
              description={t('security.password.lastChanged', 'Менялся {{time}}', { time: passwordLastChanged })}
              onClick={() => {
                changePasswordModal.open();
              }}
            />

            {/* Способы восстановления */}
            <SecurityListItem
              icon="refresh-cw"
              title={t('security.loginMethods.recovery', 'Способы восстановления')}
              onClick={() => {
                recoveryMethodsModal.open();
              }}
            />
          </SeparatedList>
        </div>
      </DataSection>

      {/* Секция "Контроль доступа" */}
      <DataSection
        id="access-manager"
        title={t('security.control.title', 'Контроль доступа')}
        description={t('security.control.description', 'Как используется ваш профиль')}
      >
        <div className={`${themeClasses.list.container} mb-4`}>
          <SeparatedList className="p-4">
            {/* Ссылка на события */}
            <SecurityListItem
              icon="activity"
              title={t('security.activity.title', 'События')}
              description={t('security.activity.description', 'Вся активность в аккаунте за 180 дней')}
              href={buildPathWithLang('/security/activity', currentLang)}
            />

            {/* Ссылка на устройства с счетчиком */}
            <SecurityListItem
              icon="smartphone"
              title={t('security.devices.title', 'Ваши устройства')}
              description={t('security.devices.description', 'На которых вы вошли в Loginus')}
              badge={devicesCount}
              href={buildPathWithLang('/security/devices', currentLang)}
            />
          </SeparatedList>
        </div>
        
        {/* Кнопка "Выйти везде" */}
        <Button 
          variant="outline" 
          fullWidth
          className={themeClasses.button.error}
          leftIcon={<Icon name="logout" size="sm" />}
          rightIcon={<Icon name="chevron-right" size="sm" />}
          onClick={() => {
            setShowLogoutAllModal(true);
          }}
        >
          {t('security.control.logoutAll', 'Выйти везде')}
        </Button>
      </DataSection>

      {/* Секция "Доступ к вашим данным" */}
      <DataSection
        id="external-accesses"
        title={t('security.access.title', 'Доступ к вашим данным')}
        description={t('security.access.description', 'Сайты и приложения, которым вы разрешили доступ к данным аккаунта')}
      >
        <div className={themeClasses.list.container}>
          <SeparatedList className="p-4">
            {/* Добавить внешние аккаунты */}
            <SecurityListItem
              icon="link"
              title={t('security.access.external', 'Добавить внешние аккаунты')}
              href={buildPathWithLang('/security/external-accounts', currentLang)}
            />

            {/* Управлять доступами */}
            <SecurityListItem
              icon="key"
              title={t('security.access.manage', 'Управлять доступами')}
              href={buildPathWithLang('/personal/data-access', currentLang)}
            />

            {/* Пароли приложений */}
            <SecurityListItem
              icon="grid"
              title={t('security.access.apps', 'Пароли приложений')}
              href={buildPathWithLang('/security/app-passwords', currentLang)}
            />
          </SeparatedList>
        </div>
      </DataSection>
      </PageTemplate>
      
      {/* Модальное окно настройки способов входа */}
      {authMethodsModal.isOpen && (
        <Suspense fallback={null}>
          <AuthMethodsModal
            isOpen={authMethodsModal.isOpen}
            onClose={authMethodsModal.close}
            currentPath={authPathState}
            connectedAccounts={connectedAccounts}
            userId={user?.id}
            onSave={(newPath) => {
              setAuthPathState(newPath);
              // Обновляем кэш после сохранения
              queryClient.invalidateQueries({ queryKey: ['user-flow-settings'] });
            }}
          />
        </Suspense>
      )}

      {/* Модальное окно изменения пароля */}
      {changePasswordModal.isOpen && (
        <Suspense fallback={null}>
          <ChangePasswordModal
            isOpen={changePasswordModal.isOpen}
            onClose={changePasswordModal.close}
            onSuccess={() => {
              // Обновляем дату последнего изменения пароля
              // TODO: Получить актуальную дату с сервера
            }}
          />
        </Suspense>
      )}

      {/* Модальное окно способов восстановления */}
      {recoveryMethodsModal.isOpen && (
        <Suspense fallback={null}>
          <RecoveryMethodsModal
            isOpen={recoveryMethodsModal.isOpen}
            onClose={recoveryMethodsModal.close}
            onSelect={async (method) => {
              try {
                console.log('📧 [SecurityPage] Выбран способ восстановления:', method);
                // Сохраняем выбранный способ восстановления
                const response = await securityApi.setupRecoveryMethod({ method: method.type });
                console.log('✅ [SecurityPage] Способ восстановления сохранен:', response);
                // Обновляем кэш
                queryClient.invalidateQueries({ queryKey: ['recovery-methods'] });
                // Показываем уведомление об успехе
                // TODO: Добавить toast уведомление
                alert(t('security.recovery.methodSaved', `Способ восстановления "${method.name}" успешно сохранен`));
              } catch (error: any) {
                console.error('❌ [SecurityPage] Ошибка сохранения способа восстановления:', error);
                // Показываем ошибку пользователю
                const errorMessage = error?.response?.data?.message || error?.message || t('security.recovery.saveError', 'Не удалось сохранить способ восстановления');
                alert(errorMessage);
              }
            }}
          />
        </Suspense>
      )}

      {/* Модальное окно подтверждения выхода везде */}
      {showLogoutAllModal && (
        <LogoutAllModal
          isOpen={showLogoutAllModal}
          onClose={() => setShowLogoutAllModal(false)}
        />
      )}
    </>
  );
};

// Компонент модального окна для выхода везде
const LogoutAllModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await securityApi.logoutAllDevices();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      onClose();
      // Редирект на страницу входа, так как все сессии будут завершены
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1500);
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('security.devices.confirmLogoutTitle', 'Выйти на всех устройствах?')}
      size="sm"
    >
      <div className="space-y-4">
        <p className={themeClasses.text.secondary}>
          {t(
            'security.devices.confirmLogoutDescription',
            'Все активные сессии будут завершены, включая текущую. Вам потребуется повторно войти в систему.',
          )}
        </p>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => logoutAllMutation.mutate()}
            loading={logoutAllMutation.isPending}
          >
            {t('security.devices.confirmLogout', 'Да, выйти везде')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SecurityPage;
