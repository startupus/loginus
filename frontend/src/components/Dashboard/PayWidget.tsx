import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';

export interface PayWidgetProps {
  balance: number;
  limit: number;
}

/**
 * PayWidget - виджет Яндекс Пэй
 */
export const PayWidget: React.FC<PayWidgetProps> = ({
  limit,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <WidgetCard
      title={t('dashboard.pay.title', 'Яндекс Пэй')}
      icon={<Icon name="device" size="lg" className="text-primary" />}
    >
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between p-4 rounded-lg bg-primary/5 dark:bg-primary/10 cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          onClick={() => navigate('/pay')}
        >
          <div className="flex items-center gap-3">
            <Icon name="device" size="lg" className="text-primary" />
            <div>
              <p className="text-sm text-body-color dark:text-dark-6">
                {t('dashboard.pay.openCard', 'Открыть карту Пэй')}
              </p>
            </div>
          </div>
          <button 
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: открыть модалку добавления карты
            }}
          >
            +
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-1 dark:bg-dark-3">
          <div>
            <p className="text-sm text-body-color dark:text-dark-6 mb-1">
              {t('dashboard.pay.spendUpTo', 'Тратьте до')}
            </p>
            <p className="text-xl font-bold text-dark dark:text-white">
              {limit.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <button 
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-2 dark:hover:bg-dark-4 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: открыть модалку увеличения лимита
            }}
          >
            +
          </button>
        </div>
      </div>
    </WidgetCard>
  );
};

