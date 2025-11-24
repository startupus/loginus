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

// Lazy loading для модалок
const AuthMethodsModal = lazy(() => import('@/components/Modals/AuthMethodsModal').then(m => ({ default: m.AuthMethodsModal })));

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
  // Моковые данные для даты последнего изменения пароля (14 месяцев назад)
  const passwordLastChanged = '14 месяцев назад';
  
  // Текущий путь аутентификации - вычисляется динамически при каждом рендере для поддержки i18n
  const authPath = useMemo<AuthFactor[]>(() => [
    {
      id: 'password',
      type: 'password',
      name: t('security.factors.password', 'Пароль'),
      description: t('security.factors.passwordDesc', 'Основной способ входа'),
      icon: 'key',
      enabled: true,
      required: true,
      available: true,
    },
  ], [t, i18nInstance.language]);
  
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
            {/* Текущий способ входа - кликабельная ссылка */}
            <SecurityListItem
              icon="key"
              title={t('security.loginMethods.password', 'Обычный пароль')}
              description={t('security.loginMethods.current', 'Текущий способ')}
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
                // TODO: Открыть модалку изменения пароля
                console.log('Change password');
              }}
            />

            {/* Способы восстановления */}
            <SecurityListItem
              icon="refresh-cw"
              title={t('security.loginMethods.recovery', 'Способы восстановления')}
              href={buildPathWithLang('/security/recovery-methods', currentLang)}
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
            // TODO: Реализовать выход везде
            console.log('Logout everywhere');
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
            onSave={(newPath) => {
              setAuthPathState(newPath);
              // TODO: Сохранить путь на сервер
              console.log('New auth path:', newPath);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default SecurityPage;
