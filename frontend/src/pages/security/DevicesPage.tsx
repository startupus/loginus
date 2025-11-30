import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTemplate } from '../../design-system/layouts/PageTemplate';
import { Button } from '../../design-system/primitives/Button';
import { Modal } from '../../design-system/composites/Modal';
import { securityApi } from '../../services/api/security';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { formatDistanceToNow, ru, enUS } from '../../utils/dateUtils';

interface Device {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  isRevoked: boolean;
  isCurrent?: boolean;
}

/**
 * DevicesPage - страница управления устройствами пользователя
 */
export const DevicesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await securityApi.getDevices();
      // Backend возвращает массив напрямую или в response.data
      const devicesData = Array.isArray(response.data) ? response.data : (response.data?.devices || response.data?.data || []);
      // Преобразуем формат backend в формат frontend
      return devicesData.map((d: any) => ({
        id: d.id,
        userId: d.userId || '',
        userAgent: d.userAgent || `${d.device} - ${d.browser}`,
        ipAddress: d.ip || d.ipAddress || 'Unknown',
        lastUsedAt: d.lastActivity || d.lastUsedAt || d.createdAt,
        createdAt: d.createdAt || d.lastActivity || new Date().toISOString(),
        isRevoked: d.isRevoked || false,
        isCurrent: d.current || d.isCurrent || false,
      })) as Device[];
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await securityApi.logoutAllDevices();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setShowLogoutAllModal(false);
      // Редирект на страницу входа, так как все сессии будут завершены
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1500);
    },
  });

  const getDeviceType = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return { icon: '📱', name: 'Mobile' };
    if (userAgent.includes('Tablet')) return { icon: '📱', name: 'Tablet' };
    if (userAgent.includes('Windows')) return { icon: '💻', name: 'Windows' };
    if (userAgent.includes('Mac')) return { icon: '🍎', name: 'macOS' };
    if (userAgent.includes('Linux')) return { icon: '🐧', name: 'Linux' };
    return { icon: '💻', name: 'Desktop' };
  };

  const getBrowser = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ru' ? ru : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  // Генерируем уникальный идентификатор устройства (как в Steam)
  const getDeviceId = (deviceId: string) => {
    // Используем первые 8 символов хеша от deviceId для создания короткого уникального ID
    const hash = deviceId.split('').reduce((acc, char) => {
      const hash = ((acc << 5) - acc) + char.charCodeAt(0);
      return hash & hash;
    }, 0);
    return Math.abs(hash).toString(36).substring(0, 8).toUpperCase();
  };

  const activeDevices = devices?.filter((d) => !d.isRevoked) || [];
  const currentDevice = activeDevices.find((d) => d.isCurrent);
  const otherDevices = activeDevices.filter((d) => !d.isCurrent);

  return (
    <PageTemplate
      title={t('security.devices.title', 'Ваши устройства')}
      description={t(
        'security.devices.description',
        'Управление устройствами, с которых выполнен вход в аккаунт',
      )}
      showBackButton
    >
      <div className="space-y-6">
        {/* Текущее устройство */}
        {currentDevice && (
          <div className="space-y-3">
            <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              {t('security.devices.currentDevice', 'Текущее устройство')}
            </h2>
            <DeviceCard device={currentDevice} isCurrent />
          </div>
        )}

        {/* Другие устройства */}
        <div className="space-y-3">
          <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            {t('security.devices.otherDevices', 'Другие устройства')}
            {otherDevices.length > 0 && (
              <span className={`ml-2 text-sm ${themeClasses.text.secondary}`}>
                ({otherDevices.length})
              </span>
            )}
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <p className={themeClasses.text.secondary}>{t('common.loading', 'Загрузка...')}</p>
            </div>
          ) : otherDevices.length > 0 ? (
            <div className="space-y-2">
              {otherDevices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={themeClasses.text.secondary}>
                {t('security.devices.noOtherDevices', 'Нет других активных устройств')}
              </p>
            </div>
          )}
        </div>

        {/* Информация */}
        <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800`}>
          <h3 className={`font-semibold ${themeClasses.text.primary} mb-2`}>
            {t('security.devices.infoTitle', 'Информация')}
          </h3>
          <ul className={`text-sm ${themeClasses.text.secondary} space-y-1 list-disc list-inside`}>
            <li>
              {t(
                'security.devices.info1',
                'Каждое устройство получает уникальный идентификатор при входе',
              )}
            </li>
            <li>
              {t(
                'security.devices.info2',
                'Если вы видите незнакомое устройство, немедленно выйдите везде и смените пароль',
              )}
            </li>
            <li>
              {t(
                'security.devices.info3',
                'Сессии автоматически завершаются через 7 дней неактивности',
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Модалка подтверждения выхода */}
      <Modal
        isOpen={showLogoutAllModal}
        onClose={() => setShowLogoutAllModal(false)}
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
              onClick={() => setShowLogoutAllModal(false)}
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
    </PageTemplate>
  );

  function DeviceCard({ device, isCurrent = false }: { device: Device; isCurrent?: boolean }) {
    const deviceType = getDeviceType(device.userAgent);
    const browser = getBrowser(device.userAgent);
    const uniqueDeviceId = getDeviceId(device.id);

    return (
      <div
        className={`p-4 rounded-lg border ${themeClasses.card.background} ${
          isCurrent
            ? 'border-blue-500 dark:border-blue-600'
            : themeClasses.card.border
        }`}
      >
        <div className="flex items-start space-x-3">
          <span className="text-3xl">{deviceType.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`font-semibold ${themeClasses.text.primary}`}>
                  {deviceType.name} • {browser}
                  {isCurrent && (
                    <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                      {t('security.devices.current', 'Текущее')}
                    </span>
                  )}
                </h3>
                <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
                  🌐 {device.ipAddress}
                </p>
                <p className={`text-xs ${themeClasses.text.secondary} mt-1 font-mono`}>
                  ID: {uniqueDeviceId}
                </p>
              </div>
            </div>
            <div className={`text-xs ${themeClasses.text.secondary} mt-2`}>
              <div>
                🕒 {t('security.devices.lastUsed', 'Последняя активность')}:{' '}
                {formatDate(device.lastUsedAt)}
              </div>
              <div className="mt-1">
                📅 {t('security.devices.firstLogin', 'Первый вход')}:{' '}
                {formatDate(device.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default DevicesPage;

