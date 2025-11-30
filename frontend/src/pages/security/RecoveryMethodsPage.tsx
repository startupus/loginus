import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageTemplate } from '../../design-system/layouts/PageTemplate';
import { SecurityListItem } from '../../components/security/SecurityListItem';
import { securityApi } from '../../services/api/security';
import { themeClasses } from '../../design-system/utils/themeClasses';

interface RecoveryMethod {
  id: string;
  name: string;
  contact?: string;
  available: boolean;
}

/**
 * RecoveryMethodsPage - страница управления способами восстановления пароля
 */
export const RecoveryMethodsPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: recoveryMethods, isLoading } = useQuery({
    queryKey: ['recovery-methods'],
    queryFn: async () => {
      const response = await securityApi.getRecoveryMethods();
      return response.data.methods as RecoveryMethod[];
    },
  });

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'email':
        return '📧';
      case 'phone':
        return '📱';
      case 'github':
        return '🐙';
      case 'vkontakte':
        return '🔵';
      case 'gosuslugi':
        return '🏛️';
      default:
        return '🔐';
    }
  };

  const getMethodDescription = (method: RecoveryMethod) => {
    if (!method.available) {
      return t('security.recovery.notConfigured', 'Не настроено');
    }
    return method.contact || t('security.recovery.available', 'Доступно');
  };

  return (
    <PageTemplate
      title={t('security.recovery.title', 'Способы восстановления')}
      description={t(
        'security.recovery.description',
        'Выберите способы для восстановления доступа к аккаунту',
      )}
      showBackButton
    >
      <div className="space-y-6">
        {/* Информационный блок */}
        <div className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className={`font-semibold ${themeClasses.text.primary} mb-1`}>
                {t('security.recovery.infoTitle', 'Как работает восстановление?')}
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {t(
                  'security.recovery.infoDescription',
                  'При восстановлении пароля вы можете выбрать один из доступных способов. Код подтверждения будет отправлен на выбранный контакт.',
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Список способов восстановления */}
        <div className="space-y-3">
          <h2 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3`}>
            {t('security.recovery.availableMethods', 'Доступные способы')}
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <p className={themeClasses.text.secondary}>
                {t('common.loading', 'Загрузка...')}
              </p>
            </div>
          ) : recoveryMethods && recoveryMethods.length > 0 ? (
            <div className="space-y-2">
              {recoveryMethods.map((method) => (
                <SecurityListItem
                  key={method.id}
                  icon={getMethodIcon(method.id)}
                  title={method.name}
                  description={getMethodDescription(method)}
                  status={method.available ? 'active' : 'inactive'}
                />
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
                  'Добавьте email или телефон в профиле для настройки способов восстановления',
                )}
              </p>
            </div>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800`}>
          <h3 className={`font-semibold ${themeClasses.text.primary} mb-2`}>
            {t('security.recovery.tipsTitle', 'Советы по безопасности')}
          </h3>
          <ul className={`text-sm ${themeClasses.text.secondary} space-y-1 list-disc list-inside`}>
            <li>
              {t(
                'security.recovery.tip1',
                'Убедитесь, что у вас настроено несколько способов восстановления',
              )}
            </li>
            <li>
              {t(
                'security.recovery.tip2',
                'Используйте актуальные контактные данные',
              )}
            </li>
            <li>
              {t(
                'security.recovery.tip3',
                'Регулярно проверяйте доступность указанных способов',
              )}
            </li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
};

export default RecoveryMethodsPage;

