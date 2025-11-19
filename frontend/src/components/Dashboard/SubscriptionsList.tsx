import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon, Button } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';
import { WidgetCard } from '../../design-system/composites/WidgetCard';

export interface Subscription {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export interface SubscriptionsListProps {
  subscriptions: Subscription[];
  onSubscriptionClick?: (subscription: Subscription) => void;
}

/**
 * SubscriptionsList - список подписок пользователя
 * Согласно референсу из yandex-id-audit/pages/01-main-dashboard.md
 */
export const SubscriptionsList: React.FC<SubscriptionsListProps> = ({
  subscriptions,
  onSubscriptionClick,
}) => {
  const { t } = useTranslation();
  
  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }
  
  return (
    <DataSection
      id="subscriptions"
      title={t('dashboard.subscriptions.title', 'Подписки')}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subscriptions.map((subscription, index) => (
          <div
            key={subscription.id}
            className="group animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onSubscriptionClick?.(subscription)}
          >
            <WidgetCard variant="default">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    <Icon name={subscription.icon} size="lg" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-dark dark:text-white mb-1">
                      {subscription.name}
                    </h3>
                    <p className="text-sm text-body-color dark:text-dark-6">
                      {subscription.active 
                        ? t('dashboard.subscriptions.active', 'Активна')
                        : t('dashboard.subscriptions.inactive', 'Неактивна')
                      }
                    </p>
                  </div>
                </div>
                <Icon 
                  name="chevron-right" 
                  size="sm" 
                  className="text-body-color dark:text-dark-6 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>
            </WidgetCard>
          </div>
        ))}
      </div>
    </DataSection>
  );
};

