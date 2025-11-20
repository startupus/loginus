import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Button, Badge } from '../../design-system/primitives';
import { DataSection } from '../../design-system/composites/DataSection';
import { Modal } from '../../design-system/composites/Modal';
import { getSubscriptionName, getSubscriptionFeatures } from '../../utils/i18nMappings';

/**
 * Тип подписки
 */
export type SubscriptionType = 'monthly' | 'annual' | 'premium' | 'free';

/**
 * Модель подписки
 */
export interface Subscription {
  id: string;
  type: SubscriptionType;
  name: string;
  price: string;
  pricePerMonth?: string;
  features: string[];
  badge?: string;
  active: boolean;
  expiresAt?: string;
}

export interface SubscriptionsListProps {
  subscriptions: Subscription[];
  onSubscriptionClick?: (subscription: Subscription) => void;
  onUpgradeClick?: () => void;
}

/**
 * SubscriptionsList - компактный список подписок пользователя
 * Детали отображаются в модальном окне
 */
export const SubscriptionsList: React.FC<SubscriptionsListProps> = ({
  subscriptions,
  onSubscriptionClick,
  onUpgradeClick,
}) => {
  const { t } = useTranslation();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  
  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }
  
  const handleCardClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    onSubscriptionClick?.(subscription);
  };
  
  const handleCloseModal = () => {
    setSelectedSubscription(null);
  };
  
  return (
    <>
    <DataSection
      id="subscriptions"
      title={t('dashboard.subscriptions.title', 'Подписки')}
    >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptions.map((subscription, index) => (
          <button
            key={subscription.id}
            onClick={() => handleCardClick(subscription)}
            className={`
              group relative p-4 rounded-lg border-2 transition-all duration-200
              bg-white dark:bg-dark-2
              border-border dark:border-dark-3
              hover:border-primary hover:shadow-md hover:-translate-y-0.5
              text-left
              ${subscription.active ? 'border-primary shadow-sm' : ''}
            `}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Заголовок с бейджем */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="text-base font-semibold text-text-primary">
                {getSubscriptionName(subscription.type, t, subscription.name)}
              </h3>
              {subscription.active && (
                <Badge variant="success" size="sm" rounded="full">
                  <Icon name="check" size="xs" />
                </Badge>
              )}
              {subscription.badge && !subscription.active && (
                <Badge variant="warning" size="sm" rounded="full">
                  !
                </Badge>
              )}
            </div>
            
            {/* Цена */}
            <div className="mb-3">
              <div className="text-xl font-bold text-primary">
                {subscription.price.split('/')[0]}
              </div>
              {subscription.pricePerMonth && (
                <div className="text-xs text-text-secondary mt-1">
                  {subscription.pricePerMonth}
                </div>
              )}
            </div>
            
            {/* Статус или дата */}
            {subscription.active && subscription.expiresAt && (
              <div className="mb-3">
                <p className="text-xs text-text-secondary">
                  {t('dashboard.subscriptions.activeUntil', { date: subscription.expiresAt, defaultValue: `Активна до ${subscription.expiresAt}` })}
                </p>
              </div>
            )}
            
            {/* Ссылка подробнее */}
            <div className="flex items-center gap-1 text-xs text-primary group-hover:gap-2 transition-all">
              <span>{t('dashboard.subscriptions.details', 'Подробнее')}</span>
              <Icon 
                name="chevron-right" 
                size="sm" 
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </div>
          </button>
        ))}
      </div>
    </DataSection>
      
      {/* Модальное окно с деталями */}
      {selectedSubscription && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title={getSubscriptionName(selectedSubscription.type, t, selectedSubscription.name)}
          size="md"
        >
          <div className="space-y-6">
            {/* Цена и бейджи */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-primary">
                    {selectedSubscription.price}
                  </span>
                  {selectedSubscription.pricePerMonth && (
                    <span className="text-sm text-text-secondary">
                      {selectedSubscription.pricePerMonth}
                    </span>
                  )}
                </div>
                {selectedSubscription.active && selectedSubscription.expiresAt && (
                  <p className="text-sm text-text-secondary">
                    {t('dashboard.subscriptions.activeUntil', { date: selectedSubscription.expiresAt, defaultValue: `Активна до ${selectedSubscription.expiresAt}` })}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {selectedSubscription.active && (
                  <Badge variant="success" size="md">
                    <Icon name="check-circle" size="sm" className="mr-1" />
                    {t('dashboard.subscriptions.active', 'Активна')}
                  </Badge>
                )}
                {selectedSubscription.badge && (
                  <Badge variant="warning" size="md">
                    {selectedSubscription.badge}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Преимущества */}
            {getSubscriptionFeatures(selectedSubscription.type, t, selectedSubscription.features).length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-3">
                  {t('dashboard.subscriptions.includes', 'Что входит в подписку:')}
                </h4>
                <div className="space-y-3">
                  {getSubscriptionFeatures(selectedSubscription.type, t, selectedSubscription.features).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                        <Icon 
                          name="check" 
                          size="sm" 
                          className="text-success" 
                        />
                      </div>
                      <span className="text-sm text-text-secondary flex-1">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Действия */}
            <div className="flex gap-3 pt-4 border-t border-border dark:border-dark-3/50">
              {!selectedSubscription.active && (
                <Button 
                  variant="primary" 
                  size="md" 
                  className="flex-1"
                  onClick={() => {
                    onUpgradeClick?.();
                    handleCloseModal();
                  }}
                >
                  <Icon name="zap" size="sm" className="mr-2" />
                  {t('dashboard.subscriptions.subscribe', 'Оформить подписку')}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="md" 
                className="flex-1"
                onClick={handleCloseModal}
              >
                {t('common.close', 'Закрыть')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
