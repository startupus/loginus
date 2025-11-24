import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
// Прямые импорты для tree-shaking
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { SeparatedList } from '@/design-system/composites/SeparatedList';
import { Icon } from '@/design-system/primitives/Icon';
import { Badge } from '@/design-system/primitives/Badge';
import { LoadingState, ErrorState, EmptyState } from '@/design-system/composites';
import { paymentApi } from '@/services/api/payment';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { formatNumber, formatCurrency } from '@/utils/intl/formatters';
import { Link } from 'react-router-dom';
import { preloadModule } from '@/services/i18n/config';

/**
 * Интерфейс платежа из истории
 */
interface PaymentHistoryItem {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
}

/**
 * Компонент баннера с подсказкой (Плюс кешбэк или Сплит баланс)
 */
interface HintBannerProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}

const HintBanner: React.FC<HintBannerProps> = ({ icon, title, value, href }) => {
  const content = (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${themeClasses.background.gray2} hover:opacity-80 transition-opacity cursor-pointer`}>
      <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${themeClasses.text.primary} line-clamp-2`}>
          {title}
        </div>
      </div>
      <div className="flex-shrink-0">
        <span className={`text-base font-medium ${themeClasses.text.primary}`}>
          {value}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
};

/**
 * Компонент элемента списка способов оплаты
 */
interface PaymentMethodItemProps {
  icon: React.ReactNode;
  title: string;
  badge?: number;
  href: string;
}

const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({ icon, title, badge, href }) => {
  const currentLang = useCurrentLanguage();
  const fullHref = buildPathWithLang(href, currentLang);

  return (
    <Link
      to={fullHref}
      className={`flex items-center gap-3 p-4 rounded-lg ${themeClasses.background.default} ${themeClasses.border.default} hover:border-primary transition-colors group`}
    >
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-base font-medium ${themeClasses.text.primary}`}>
          {title}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge !== undefined && badge > 0 && (
          <Badge variant="primary" size="sm">
            {badge}
          </Badge>
        )}
        <Icon name="chevron-right" size="sm" className={`${themeClasses.text.secondary} group-hover:text-primary transition-colors`} />
      </div>
    </Link>
  );
};

/**
 * Компонент элемента истории платежей
 */
interface PaymentHistoryItemComponentProps {
  payment: PaymentHistoryItem;
}

const PaymentHistoryItemComponent: React.FC<PaymentHistoryItemComponentProps> = ({ payment }) => {
  const currentLang = useCurrentLanguage();
  const formattedAmount = formatCurrency(Math.abs(payment.amount), payment.currency, currentLang);
  
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-lg ${themeClasses.background.gray2} flex items-center justify-center flex-shrink-0`}>
          <Icon name="credit-card" size="sm" className={themeClasses.text.secondary} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${themeClasses.text.primary} mb-1`}>
            {payment.title}
          </div>
          <div className={`text-sm ${themeClasses.text.secondary} truncate`}>
            {payment.description}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 text-right ml-4">
        <div className={`font-medium ${themeClasses.text.primary}`}>
          {payment.amount < 0 ? '−' : '+'}{formattedAmount}
        </div>
      </div>
    </div>
  );
};

// Предзагрузка модуля переводов для страницы оплаты
if (typeof window !== 'undefined') {
  void preloadModule('payment');
}

const PayPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = useCurrentLanguage();

  // Предзагрузка и перезагрузка модуля переводов при смене языка
  useEffect(() => {
    const loadPaymentModule = async () => {
      try {
        await preloadModule('payment');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[PayPage] Failed to load payment module:', error);
        }
      }
    };

    loadPaymentModule();

    // Перезагружаем модуль при смене языка
    const handleLanguageChanged = async () => {
      try {
        await preloadModule('payment');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[PayPage] Failed to reload payment module on language change:', error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Загрузка данных о способах оплаты
  const { data: methodsData, isLoading: isLoadingMethods, error: methodsError } = useQuery({
    queryKey: ['payment', 'methods'],
    queryFn: async () => {
      const response = await paymentApi.getMethods();
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    },
  });

  // Загрузка истории платежей
  const { data: historyData, isLoading: isLoadingHistory, error: historyError } = useQuery({
    queryKey: ['payment', 'history'],
    queryFn: async () => {
      const response = await paymentApi.getHistory();
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    },
  });

  // Количество карт
  const cardsCount = methodsData?.length || 0;

  // Обработка ошибок
  if (methodsError || historyError) {
    return (
      <PageTemplate 
        title={t('payment.title', 'Способы оплаты')}
        showSidebar={true}
        showFooter={false}
        contentClassName="p-3 sm:p-6"
      >
        <ErrorState 
          message={t('common.error.loading', 'Ошибка загрузки данных')}
          onRetry={() => window.location.reload()}
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('payment.title', 'Способы оплаты')}
      showSidebar={true}
      showFooter={false}
      contentClassName="p-3 sm:p-6 space-y-6"
    >
      {/* Секция способов оплаты */}
      <DataSection
        id="payment-methods"
        title={t('payment.methods.title', 'Способы оплаты')}
      >
        {isLoadingMethods ? (
          <LoadingState />
        ) : (
          <div className="space-y-3">
            <PaymentMethodItem
              icon={<Icon name="credit-card" size="lg" className={themeClasses.text.primary} />}
              title={t('payment.methods.cards', 'Карты')}
              badge={cardsCount > 0 ? cardsCount : undefined}
              href={buildPathWithLang('/pay/cards', currentLang)}
            />
          </div>
        )}
      </DataSection>

      {/* Секция подсказок (баннеры) */}
      <DataSection
        id="payment-hints"
        title={t('payment.hints.title', 'Полезные сервисы')}
      >
        <div className="space-y-3">
          {/* Баннер Плюс кешбэк */}
          <HintBanner
            icon={
              <div className={`w-11 h-11 rounded-full ${themeClasses.background.surfaceElevated} flex items-center justify-center`}>
                <Icon name="plus" size="lg" className={themeClasses.text.primary} />
              </div>
            }
            title={t('payment.hints.plus.title', 'Кешбэк за покупки баллами Плюса')}
            value={t('payment.hints.plus.value', '0')}
            href="https://plus.yandex.ru/?from=yandexid&clientSource=yandexid&utm_source=yandexid&utm_medium=payment_history&utm_campaign=yandexid_plus&clientSubSource=pay"
          />

          {/* Баннер Сплит баланс */}
          <HintBanner
            icon={
              <div className={`w-11 h-11 rounded-full ${themeClasses.background.surfaceElevated} flex items-center justify-center`}>
                <Icon name="chartBar" size="lg" className="text-success" />
              </div>
            }
            title={t('payment.hints.split.title', 'Баланс Сплита')}
            value={t('payment.hints.split.value', '120 000,00 ₽')}
            href="https://split.yandex.ru/standalone/account"
          />
        </div>
      </DataSection>

      {/* Секция истории платежей */}
      <DataSection
        id="payments-history"
        title={t('payment.history.title', 'История платежей')}
        viewAllLink={{
          label: t('payment.history.allPayments', 'Все платежи'),
          href: '/pay/history',
        }}
      >
        {isLoadingHistory ? (
          <LoadingState />
        ) : !historyData || !Array.isArray(historyData) || historyData.length === 0 ? (
          <EmptyState 
            message={t('payment.history.empty', 'История платежей пуста')}
          />
        ) : (
          <div className={`${themeClasses.background.default} ${themeClasses.border.default} rounded-lg overflow-hidden`}>
            <SeparatedList className="p-4">
              {historyData.map((payment: PaymentHistoryItem) => (
                <PaymentHistoryItemComponent key={payment.id} payment={payment} />
              ))}
            </SeparatedList>
          </div>
        )}
      </DataSection>
    </PageTemplate>
  );
};

export default PayPage;
