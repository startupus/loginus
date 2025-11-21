import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
// Прямые импорты для tree-shaking
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { SeparatedList } from '@/design-system/composites/SeparatedList';
import { SecurityListItem } from '@/design-system/composites/SecurityListItem';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { Spinner } from '@/design-system/primitives/Spinner';
import { useThemeClasses, themeClasses } from '@/design-system/utils';
import { securityApi } from '@/services/api/security';

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
 */
const SecurityPage: React.FC = () => {
  const { t } = useTranslation();
  const { getGradientStyleFromVars } = useThemeClasses();
  const [devices, setDevices] = useState<Device[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Моковые данные для даты последнего изменения пароля (14 месяцев назад)
  const passwordLastChanged = '14 месяцев назад';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [devicesRes, activityRes] = await Promise.all([
          securityApi.getDevices(),
          securityApi.getActivity(),
        ]);
        setDevices(devicesRes.data?.data || devicesRes.data || []);
        setActivity(activityRes.data?.data || activityRes.data || []);
      } catch (error) {
        console.error('Failed to fetch security data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <PageTemplate title={t('security.title', 'Безопасность')} showSidebar={true}>
        <div className={themeClasses.state.loading}>
          <Spinner size="lg" color="primary" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('security.title', 'Безопасность')}
      showSidebar={true}
      contentClassName={themeClasses.container.content}
    >
      {/* Промо-блок "Усиленная защита" */}
      <div 
        className={themeClasses.promo.container}
        style={getGradientStyleFromVars(
          '--color-primary',
          '--color-info',
          'to right'
        )}
      >
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
            <Link to="/security/enter-methods">
              <Button 
                variant="outline"
                className={themeClasses.promo.button}
              >
                {t('security.enhancedProtection.action', 'Защитить по максимуму')}
              </Button>
            </Link>
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
              href="/security/enter-methods"
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
              href="/security/recovery-methods"
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
              href="/security/activity"
            />

            {/* Ссылка на устройства с счетчиком */}
            <SecurityListItem
              icon="smartphone"
              title={t('security.devices.title', 'Ваши устройства')}
              description={t('security.devices.description', 'На которых вы вошли в Loginus')}
              badge={devices.length || 1}
              href="/security/devices"
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
              href="/security/external-accounts"
            />

            {/* Управлять доступами */}
            <SecurityListItem
              icon="key"
              title={t('security.access.manage', 'Управлять доступами')}
              href="/personal/data-access"
            />

            {/* Пароли приложений */}
            <SecurityListItem
              icon="grid"
              title={t('security.access.apps', 'Пароли приложений')}
              href="/security/app-passwords"
            />
          </SeparatedList>
        </div>
      </DataSection>
    </PageTemplate>
  );
};

export default SecurityPage;
