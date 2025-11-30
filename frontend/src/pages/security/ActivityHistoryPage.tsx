import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageTemplate } from '../../design-system/layouts/PageTemplate';
import { securityApi } from '../../services/api/security';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { formatDistanceToNow, ru, enUS } from '../../utils/dateUtils';

interface ActivityEvent {
  id: string;
  userId: string;
  action: string;
  service: string;
  resource: string;
  statusCode: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/**
 * ActivityHistoryPage - страница истории активности пользователя
 */
export const ActivityHistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['activity-history', page, limit],
    queryFn: async () => {
      const response = await securityApi.getActivityHistory({ page, limit });
      // Backend может возвращать данные в разных форматах
      const responseData = response.data || response;
      return responseData;
    },
  });

  // Обрабатываем разные форматы ответа
  // Backend возвращает { activity: [...] }, но мы ожидаем activities
  const activitiesData = data?.activities || data?.activity || data?.data || (Array.isArray(data) ? data : []);
  // Убеждаемся, что activitiesData - это массив
  const activitiesArray = Array.isArray(activitiesData) ? activitiesData : [];
  const activities = activitiesArray.map((a: any) => ({
    id: a.id,
    userId: a.userId || '',
    action: a.action,
    service: a.service || 'Auth',
    resource: a.resource || '',
    statusCode: a.statusCode || 200,
    ipAddress: a.ip || a.ipAddress || 'Unknown',
    userAgent: a.userAgent || a.device || 'Unknown',
    createdAt: a.createdAt || a.date || new Date().toISOString(),
  })) as ActivityEvent[];
  const totalCount = data?.totalCount || data?.total || activities.length;
  const totalPages = Math.ceil(totalCount / limit);

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return '🔐';
    if (action.includes('logout')) return '🚪';
    if (action.includes('password')) return '🔑';
    if (action.includes('update')) return '✏️';
    if (action.includes('delete')) return '🗑️';
    if (action.includes('create')) return '➕';
    return '📋';
  };

  const getActionName = (action: string) => {
    const translations: Record<string, string> = {
      login: t('security.activity.actions.login', 'Вход в систему'),
      logout: t('security.activity.actions.logout', 'Выход из системы'),
      password_changed: t('security.activity.actions.passwordChanged', 'Смена пароля'),
      email_changed: t('security.activity.actions.emailChanged', 'Смена email'),
      phone_changed: t('security.activity.actions.phoneChanged', 'Смена телефона'),
      profile_updated: t('security.activity.actions.profileUpdated', 'Обновление профиля'),
      two_factor_enabled: t('security.activity.actions.twoFactorEnabled', '2FA включена'),
      two_factor_disabled: t('security.activity.actions.twoFactorDisabled', '2FA отключена'),
    };
    return translations[action] || action;
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 dark:text-green-400';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600 dark:text-yellow-400';
    if (statusCode >= 500) return 'text-red-600 dark:text-red-400';
    return themeClasses.text.secondary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ru' ? ru : enUS;
    
    return {
      relative: formatDistanceToNow(date, { addSuffix: true, locale }),
      absolute: date.toLocaleString(i18n.language === 'ru' ? 'ru-RU' : 'en-US'),
    };
  };

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return '📱 Mobile';
    if (userAgent.includes('Tablet')) return '📱 Tablet';
    return '💻 Desktop';
  };

  return (
    <PageTemplate
      title={t('security.activity.title', 'История активности')}
      description={t(
        'security.activity.description',
        'Все действия, выполненные в вашем аккаунте',
      )}
      showBackButton
    >
      <div className="space-y-6">
        {/* Список событий */}
        <div className="space-y-3">
          <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            {t('security.activity.recentEvents', 'Последние события')}
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <p className={themeClasses.text.secondary}>{t('common.loading', 'Загрузка...')}</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((activity) => {
                const dateInfo = formatDate(activity.createdAt);
                return (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border ${themeClasses.card.background} ${themeClasses.card.border} hover:border-blue-500 transition-colors`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getActionIcon(activity.action)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold ${themeClasses.text.primary}`}>
                              {getActionName(activity.action)}
                            </h3>
                            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
                              {activity.service && (
                                <span className="mr-2">
                                  📦 {activity.service}
                                </span>
                              )}
                              {activity.resource && (
                                <span className="mr-2">
                                  📄 {activity.resource}
                                </span>
                              )}
                            </p>
                          </div>
                          <span className={`text-sm font-medium ${getStatusColor(activity.statusCode)}`}>
                            {activity.statusCode}
                          </span>
                        </div>

                        <div className={`text-xs ${themeClasses.text.secondary} mt-2 space-y-1`}>
                          <div title={dateInfo.absolute}>
                            🕒 {dateInfo.relative}
                          </div>
                          <div>
                            🌐 {activity.ipAddress}
                          </div>
                          <div>
                            {getDeviceInfo(activity.userAgent)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={themeClasses.text.secondary}>
                {t('security.activity.noEvents', 'Нет событий')}
              </p>
            </div>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 pt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg border ${themeClasses.card.border} ${themeClasses.card.background} ${
                page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'
              }`}
            >
              {t('common.previous', 'Назад')}
            </button>
            <span className={themeClasses.text.secondary}>
              {t('common.page', 'Страница')} {page} {t('common.of', 'из')} {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg border ${themeClasses.card.border} ${themeClasses.card.background} ${
                page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'
              }`}
            >
              {t('common.next', 'Далее')}
            </button>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default ActivityHistoryPage;

