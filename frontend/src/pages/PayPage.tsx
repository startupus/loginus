import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts';
import { DataSection, SeparatedList } from '@/design-system/composites';
import { Button, Icon, Badge } from '@/design-system/primitives';
import { paymentApi } from '@/services/api/payment';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  system: string;
  isDefault?: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: 'success' | 'pending' | 'failed';
  merchant: string;
}

const PayPage: React.FC = () => {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [methodsRes, historyRes] = await Promise.all([
          paymentApi.getMethods(),
          paymentApi.getHistory(),
        ]);
        setMethods(methodsRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error('Failed to fetch payment data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <PageTemplate title={t('sidebar.payments', 'Платежи')} showSidebar={true}>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('sidebar.payments', 'Платежи')}
      showSidebar={true}
      contentClassName="space-y-8 max-w-4xl mx-auto"
    >
      {/* Promo Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plus Promo */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
              <Icon name="plus" size="lg" className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('payment.promo.plus.title', 'Подключите Плюс')}</h3>
            <p className="text-white/80 mb-4">{t('payment.promo.plus.description', 'Кино, музыка, книги в одной мультиподписке')}</p>
            <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-gray-100 border-none">
              {t('common.connect', 'Подключить')}
            </Button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Split Promo */}
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
              <Icon name="pie-chart" size="lg" className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('payment.promo.split.title', 'Сплит')}</h3>
            <p className="text-white/80 mb-4">
              {t('payment.promo.split.limit', 'Вам одобрено 150 000 ₽', { amount: '150 000' })}
            </p>
            <Button variant="secondary" size="sm" className="bg-white text-teal-600 hover:bg-gray-100 border-none">
              {t('common.details', 'Подробнее')}
            </Button>
          </div>
          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/4 translate-x-1/4 blur-2xl group-hover:scale-110 transition-transform"></div>
        </div>
      </div>

      {/* Cards Section */}
      <DataSection
        id="cards"
        title={t('payment.methods.title', 'Способы оплаты')}
        description={t('payment.methods.description', 'Ваши карты для оплаты сервисов')}
        action={
            <Button variant="primary" size="sm" className="gap-2">
                <Icon name="credit-card" size="sm" />
                {t('payment.methods.add', 'Открыть карту Пэй')}
            </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Loginus Pay Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-xl shadow-lg relative overflow-hidden aspect-video flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-2">
                    <Icon name="credit-card" size="lg" className="text-white" />
                    <span className="font-bold">Loginus Pay</span>
                  </div>
                  <Badge variant="success" size="sm" className="bg-green-500 text-white border-none">
                      {t('payment.methods.cashback', 'Кешбэк')} 5%
                  </Badge>
              </div>
              <div className="z-10">
                  <div className="text-sm opacity-60 mb-1">{t('payment.methods.balance', 'Баланс')}</div>
                  <div className="text-2xl font-bold">12 450 ₽</div>
              </div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-2xl"></div>
          </div>

          {/* User Cards */}
          {methods.map((method) => (
            <div key={method.id} className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-3 dark:to-dark-2 p-6 rounded-xl border border-stroke dark:border-dark-3 relative overflow-hidden aspect-video flex flex-col justify-between group hover:border-primary transition-colors cursor-pointer">
                <div className="flex justify-between items-start z-10">
                    <Icon name="credit-card" size="lg" className="text-gray-600 dark:text-gray-400" />
                     {method.isDefault && (
                        <Badge variant="primary" size="sm">
                            Main
                        </Badge>
                     )}
                </div>
                <div className="z-10">
                    <div className="text-2xl tracking-widest mb-2 text-dark dark:text-white">•••• {method.last4}</div>
                    <div className="flex justify-between items-end">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{method.expiry}</div>
                        <div className="font-bold uppercase text-gray-400 dark:text-gray-500">{method.system}</div>
                    </div>
                </div>
            </div>
          ))}
          
          {/* Add New Card Button */}
          <button className="border-2 border-dashed border-stroke dark:border-dark-3 rounded-xl p-6 aspect-video flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-3 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
              <Icon name="plus" size="lg" />
            </div>
            <span className="font-medium text-gray-500 group-hover:text-primary transition-colors">
              {t('common.add', 'Добавить')}
            </span>
          </button>
        </div>
      </DataSection>

       {/* Subscriptions Section */}
       <DataSection
        id="subscriptions"
        title={t('payment.subscriptions.title', 'Подписки')}
        description={t('payment.subscriptions.description', 'Управление подписками на сервисы')}
      >
          <div className="bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
             <SeparatedList className="p-4">
                <div className="flex items-center justify-between py-2">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-lg flex items-center justify-center font-bold">
                             <Icon name="plus" size="md" />
                         </div>
                         <div>
                             <div className="font-medium dark:text-white">Loginus Plus</div>
                             <div className="text-sm text-gray-500">Следующее списание 20.11.2025</div>
                         </div>
                     </div>
                     <div className="text-right">
                         <div className="font-medium dark:text-white">299 ₽</div>
                         <div className="text-xs text-green-500">Активна</div>
                     </div>
                </div>
             </SeparatedList>
          </div>
      </DataSection>


      {/* History Section */}
      <DataSection
        id="history"
        title={t('payment.history.title', 'История платежей')}
        description={t('payment.history.description', 'Ваши последние транзакции')}
      >
        <div className="bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
          <SeparatedList className="p-4">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full ${item.status === 'failed' ? 'bg-red-100 text-red-500' : 'bg-gray-100 dark:bg-dark-3 text-gray-600 dark:text-gray-300'}`}>
                    <Icon name={item.status === 'failed' ? 'alert-circle' : 'shopping-bag'} size="sm" />
                  </div>
                  <div>
                    <div className="font-medium dark:text-white">{item.merchant}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()} • {item.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                    <div className={`font-medium ${item.amount > 0 ? 'text-dark dark:text-white' : 'text-green-500'}`}>
                        {item.amount > 0 ? '-' : '+'}{Math.abs(item.amount)} {item.currency}
                    </div>
                     {item.status === 'failed' && (
                         <div className="text-xs text-red-500">{t('common.error', 'Ошибка')}</div>
                     )}
                </div>
              </div>
            ))}
             {history.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  {t('payment.history.empty', 'История пуста')}
                </div>
              )}
          </SeparatedList>
        </div>
      </DataSection>
    </PageTemplate>
  );
};

export default PayPage;
