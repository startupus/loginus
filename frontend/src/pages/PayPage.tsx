import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Прямые импорты для tree-shaking
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { SeparatedList } from '@/design-system/composites/SeparatedList';
import { Icon } from '@/design-system/primitives/Icon';
import { Badge } from '@/design-system/primitives/Badge';
import { paymentApi } from '@/services/api/payment';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { buildPathWithLang } from '@/utils/routing';

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
  const { lang } = useParams<{ lang: string }>();
  const fullHref = buildPathWithLang(href, lang || 'ru');

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
          {payment.amount < 0 ? '−' : '+'}{Math.abs(payment.amount).toLocaleString('ru-RU')} {payment.currency}
        </div>
      </div>
    </div>
  );
};

const PayPage: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  // Загрузка данных о способах оплаты
  const { data: methodsData } = useQuery({
    queryKey: ['payment', 'methods'],
    queryFn: async () => {
      try {
        const response = await paymentApi.getMethods();
        return response.data || [];
      } catch (error) {
        console.error('[PayPage] Error loading payment methods:', error);
        return [];
      }
    },
  });

  // Загрузка истории платежей
  const { data: historyData } = useQuery({
    queryKey: ['payment', 'history'],
    queryFn: async () => {
      try {
        const response = await paymentApi.getHistory();
        return response.data || [];
      } catch (error) {
        console.error('[PayPage] Error loading payment history:', error);
        return [];
      }
    },
  });

  // Моки данных для истории платежей (согласно референсу)
  const mockHistory: PaymentHistoryItem[] = useMemo(() => [
    {
      id: '1',
      title: t('payment.history.items.plusSubscription', 'Подписка Плюса'),
      description: t('payment.history.items.matchFootball', 'МАТЧ! ФУТБОЛ'),
      amount: -380,
      currency: '₽',
    },
    {
      id: '2',
      title: t('payment.history.items.plusSubscription', 'Подписка Плюса'),
      description: t('payment.history.items.alicePro', 'Дополнительная опция Алиса Про'),
      amount: -100,
      currency: '₽',
    },
    {
      id: '3',
      title: t('payment.history.items.plusSubscription', 'Подписка Плюса'),
      description: t('payment.history.items.travelers', 'Дополнительная опция Путешественникам'),
      amount: -200,
      currency: '₽',
    },
  ], [t]);

  // Используем моки, если нет данных из API
  const history = historyData && historyData.length > 0 ? historyData : mockHistory;

  // Количество карт (из референса - 8)
  const cardsCount = methodsData?.length || 8;

  return (
    <PageTemplate 
      title={t('payment.title', 'Способы оплаты')}
      showSidebar={true}
      showFooter={false}
      contentClassName="p-3 sm:p-6 space-y-6"
    >
      {/* Секция способов оплаты */}
      <section className={`${themeClasses.card.rounded} p-6 sm:p-8`}>
        <h2 className={`text-xl sm:text-2xl font-semibold ${themeClasses.text.primary} mb-6`}>
          {t('payment.methods.title', 'Способы оплаты')}
        </h2>
        
        <div className="space-y-3">
          <PaymentMethodItem
            icon={<Icon name="credit-card" size="lg" className={themeClasses.text.primary} />}
            title={t('payment.methods.cards', 'Карты')}
            badge={cardsCount}
            href="/pay/cards"
          />
        </div>
      </section>

      {/* Секция подсказок (баннеры) */}
      <section className={`${themeClasses.card.rounded} p-6 sm:p-8`} data-testid="hints">
        <div className="space-y-3">
          {/* Баннер Плюс кешбэк */}
          <HintBanner
            icon={
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                {/* Иконка Яндекс Плюса - используем простую иконку */}
                <Icon name="plus" size="lg" className="text-black" />
              </div>
            }
            title={t('payment.hints.plus.title', 'Кешбэк за покупки баллами Плюса')}
            value={t('payment.hints.plus.value', '0')}
            href="https://plus.yandex.ru/?from=yandexid&clientSource=yandexid&utm_source=yandexid&utm_medium=payment_history&utm_campaign=yandexid_plus&clientSubSource=pay"
          />

          {/* Баннер Сплит баланс */}
          <HintBanner
            icon={
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                {/* Иконка Сплита - используем простую иконку */}
                <Icon name="chartBar" size="lg" className="text-green-600" />
              </div>
            }
            title={t('payment.hints.split.title', 'Баланс Сплита')}
            value={t('payment.hints.split.value', '120 000,00 ₽')}
            href="https://split.yandex.ru/standalone/account"
          />
        </div>
      </section>

      {/* Секция истории платежей */}
      <section className={`${themeClasses.card.rounded} p-6 sm:p-8`} data-testid="payments-history">
        <h2 
          id="payments-history"
          className={`text-xl sm:text-2xl font-semibold ${themeClasses.text.primary} mb-6`}
        >
          <a
            href="#payments-history"
            className="hover:text-primary dark:hover:text-primary transition-colors"
          >
            {t('payment.history.title', 'История платежей')}
          </a>
        </h2>

        <div className={`${themeClasses.background.default} ${themeClasses.border.default} rounded-lg overflow-hidden`}>
          <SeparatedList className="p-4">
            {history.map((payment) => (
              <PaymentHistoryItemComponent key={payment.id} payment={payment} />
            ))}
          </SeparatedList>
        </div>

        {/* Ссылка "Все платежи" */}
        <div className={`mt-6 pt-4 border-t ${themeClasses.border.dark}`}>
          <Link
            to={buildPathWithLang('/pay/history', lang || 'ru')}
            className={`inline-flex items-center gap-2 text-sm ${themeClasses.text.primary} hover:text-primary transition-colors`}
          >
            <span>{t('payment.history.allPayments', 'Все платежи')}</span>
            <Icon name="chevron-right" size="sm" />
          </Link>
        </div>
      </section>
    </PageTemplate>
  );
};

export default PayPage;
