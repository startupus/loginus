import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// Прямые импорты для tree-shaking
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { SeparatedList } from '@/design-system/composites/SeparatedList';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { useThemeClasses } from '@/design-system/utils';
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

const SecurityPage: React.FC = () => {
  const { t } = useTranslation();
  const { getGradientStyleFromVars, isDark } = useThemeClasses();
  const [devices, setDevices] = useState<Device[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [devicesRes, activityRes] = await Promise.all([
          securityApi.getDevices(),
          securityApi.getActivity(),
        ]);
        setDevices(devicesRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error('Failed to fetch security data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // TODO: Реализовать удаление устройства
  // const handleDeleteDevice = async (id: string) => {
  //   try {
  //     await securityApi.deleteDevice(id);
  //     setDevices(devices.filter(d => d.id !== id));
  //   } catch (error) {
  //     console.error('Failed to delete device', error);
  //   }
  // };

  if (isLoading) {
    return (
      <PageTemplate title={t('security.title', 'Безопасность')} showSidebar={true}>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('security.title', 'Безопасность')}
      showSidebar={true}
      contentClassName="space-y-8 max-w-4xl mx-auto"
    >
      {/* Biometry Promo Block */}
      <div 
        className="rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
        style={getGradientStyleFromVars(
          '--color-primary',
          '--color-info',
          'to right'
        )}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              {t('security.biometry.title', 'Подключите безопасный вход по лицу или отпечатку')}
            </h2>
            <p className="text-white/80 mb-6 max-w-xl">
              {t('security.biometry.description', 'Это быстрее и безопаснее, чем пароль. Мы не храним ваши биометрические данные — они остаются на устройстве.')}
            </p>
            <Button 
              variant={isDark ? 'outline' : 'secondary'}
              className={isDark ? 'border-white/20 text-white hover:bg-white/10 hover:border-white/30' : ''}
            >
              {t('security.biometry.connect', 'Подключить')}
            </Button>
          </div>
          <div className="hidden md:block">
             <Icon name="shield" size="xl" className="w-24 h-24 text-white/20" />
          </div>
        </div>
        {/* Decorative circles */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl ${isDark ? 'bg-white/5' : 'bg-white/10'}`}></div>
        <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl ${isDark ? 'bg-text-primary/5' : 'bg-text-primary/10'}`}></div>
      </div>

      {/* Login Methods Section */}
      <DataSection
        id="login-methods"
        title={t('security.loginMethods.title', 'Способ входа')}
      >
        <div className="bg-background dark:bg-surface rounded-lg border border-border overflow-hidden">
          <SeparatedList className="p-4">
            {/* Current Method */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 text-success rounded-full">
                   <Icon name="check" size="sm" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary">
                    {t('security.loginMethods.current', 'Текущий способ')}
                  </div>
                  <div className="font-medium text-text-primary">
                    {t('security.loginMethods.password', 'Обычный пароль')}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {t('security.password.change', 'Обновить пароль')}
              </Button>
            </div>
            
            {/* Recovery Methods */}
            <a href="/security/recovery-methods" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-1 dark:bg-dark-3 rounded-lg">
                   <Icon name="refresh-cw" size="md" className="text-text-secondary" />
                </div>
                <div className="font-medium text-text-primary group-hover:text-primary transition-colors">
                  {t('security.loginMethods.recovery', 'Способы восстановления')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-text-secondary group-hover:text-primary transition-colors" />
            </a>
          </SeparatedList>
        </div>
      </DataSection>

      {/* Access Control Section */}
      <DataSection
        id="access-control"
        title={t('security.control.title', 'Контроль доступа')}
      >
        <div className="bg-background dark:bg-surface rounded-lg border border-border overflow-hidden mb-4">
          <SeparatedList className="p-4">
            {/* Activity Link */}
            <a href="/security/activity" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-1 dark:bg-dark-3 rounded-lg">
                   <Icon name="activity" size="md" className="text-text-secondary" />
                </div>
                <div>
                  <div className="font-medium text-text-primary group-hover:text-primary transition-colors">
                    {t('security.activity.title', 'История активности')}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {activity.length > 0 ? `${activity.length} событий` : t('security.activity.empty', 'Нет событий')}
                  </div>
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-text-secondary group-hover:text-primary transition-colors" />
            </a>

            {/* Devices Link */}
            <a href="/security/devices" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-1 dark:bg-dark-3 rounded-lg">
                   <Icon name="smartphone" size="md" className="text-text-secondary" />
                </div>
                <div>
                  <div className="font-medium text-text-primary group-hover:text-primary transition-colors">
                    {t('security.devices.title', 'Устройства')}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {devices.length} {t('common.devices', 'устройств')}
                  </div>
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-text-secondary group-hover:text-primary transition-colors" />
            </a>
          </SeparatedList>
        </div>
        
        <Button variant="outline" className="w-full text-error hover:text-error/80 hover:bg-error/10 border-error/30 dark:border-error/30 dark:hover:bg-error/20">
          {t('security.control.logoutAll', 'Выйти везде')}
        </Button>
      </DataSection>

      {/* Data Access Section */}
      <DataSection
        id="data-access"
        title={t('security.access.title', 'Доступ к вашим данным')}
      >
        <div className="bg-background dark:bg-surface rounded-lg border border-border overflow-hidden">
          <SeparatedList className="p-4">
            {/* External Accounts */}
            <a href="/security/external-accounts" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-1 dark:bg-dark-3 rounded-lg">
                   <Icon name="link" size="md" className="text-text-secondary" />
                </div>
                <div className="font-medium text-text-primary group-hover:text-primary transition-colors">
                  {t('security.access.external', 'Добавить внешние аккаунты')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-text-secondary group-hover:text-primary transition-colors" />
            </a>

            {/* Manage Access */}
            <a href="/personal/data-access" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-1 dark:bg-dark-3 rounded-lg">
                   <Icon name="key" size="md" className="text-text-secondary" />
                </div>
                <div className="font-medium text-text-primary group-hover:text-primary transition-colors">
                  {t('security.access.manage', 'Управлять доступами')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-text-secondary group-hover:text-primary transition-colors" />
            </a>

            {/* App Passwords */}
            <a href="/security/app-passwords" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-1 dark:bg-dark-3 rounded-lg">
                   <Icon name="grid" size="md" className="text-text-secondary" />
                </div>
                <div className="font-medium text-text-primary group-hover:text-primary transition-colors">
                  {t('security.access.apps', 'Пароли приложений')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-text-secondary group-hover:text-primary transition-colors" />
            </a>
          </SeparatedList>
        </div>
      </DataSection>
    </PageTemplate>
  );
};

export default SecurityPage;
