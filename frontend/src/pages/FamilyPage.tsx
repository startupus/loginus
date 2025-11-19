import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { Button, Icon, Avatar, Badge, Separator } from '@/design-system/primitives';
import { DataSection, SeparatedList } from '@/design-system/composites';
import { familyApi } from '@/services/api/family';
import { getInitials } from '@/utils/stringUtils';

/**
 * FamilyPage - страница управления семьей
 */
const FamilyPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['family-members'],
    queryFn: () => familyApi.getMembers(),
  });

  if (isLoading) {
    return (
      <PageTemplate title={t('sidebar.family', 'Семья')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-body-color dark:text-dark-6">{t('common.loading', 'Загрузка...')}</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  const members = data?.data?.members || [];
  const adults = members.filter((m: any) => m.role !== 'child');
  const children = members.filter((m: any) => m.role === 'child');

  return (
    <PageTemplate 
      title={t('sidebar.family', 'Семья')} 
      showSidebar={true}
      contentClassName="space-y-8 max-w-4xl mx-auto"
    >
        {/* Promo Block */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 text-black">
                {t('family.promo.plus.title', 'Плюса хватит всем')}
              </h2>
              <p className="text-black/80 mb-6 max-w-xl font-medium">
                {t('family.promo.plus.description', 'Подключите до 3 близких к подписке Плюс')}
              </p>
              <Button 
                variant="secondary" 
                className="bg-black text-white hover:bg-gray-900 border-none"
              >
                {t('family.promo.plus.action', 'Расширить за 250 ₽')}
              </Button>
            </div>
            <div className="hidden md:block text-black/20">
               <Icon name="users" size="xl" className="w-32 h-32" />
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
        </div>

        {/* Family Group Section */}
        <DataSection
          id="group"
          title={t('family.group.title', 'Семейная группа')}
          description={t('family.group.description', 'Управляйте доступом близких к сервисам')}
          action={
            <Button variant="primary" size="sm" className="gap-2">
                <Icon name="user-plus" size="sm" />
                {t('family.invite', 'Пригласить')}
            </Button>
          }
        >
          <div className="bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
            <SeparatedList className="p-4">
                {adults.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={member.avatar || undefined}
                                initials={getInitials(member.name)}
                                size="md"
                                rounded
                                showStatus
                                status={member.isOnline ? 'online' : 'offline'}
                            />
                            <div>
                                <div className="font-medium dark:text-white flex items-center gap-2">
                                    {member.name}
                                    {member.role === 'admin' && (
                                        <Badge variant="primary" size="sm">Admin</Badge>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {member.email || member.phone}
                                </div>
                            </div>
                        </div>
                        {member.role !== 'admin' && (
                             <Button variant="ghost" size="sm">
                                <Icon name="more-vertical" size="sm" />
                             </Button>
                        )}
                    </div>
                ))}
                 {adults.length === 0 && (
                     <div className="text-center py-4 text-gray-500">
                         {t('family.empty', 'Нет участников')}
                     </div>
                 )}
            </SeparatedList>
          </div>
        </DataSection>

        {/* Child Accounts Section */}
        <DataSection
          id="children"
          title={t('family.children.title', 'Детские аккаунты')}
          description={t('family.children.description', 'Безопасный интернет и контент для детей')}
           action={
            <Button variant="outline" size="sm" className="gap-2">
                <Icon name="plus" size="sm" />
                {t('family.child.create', 'Создать аккаунт')}
            </Button>
          }
        >
            {children.length > 0 ? (
                 <div className="bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
                    <SeparatedList className="p-4">
                        {children.map((child: any) => (
                            <div key={child.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={child.avatar || undefined}
                                        initials={getInitials(child.name)}
                                        size="md"
                                        rounded
                                        showStatus
                                        status={child.isOnline ? 'online' : 'offline'}
                                    />
                                    <div>
                                        <div className="font-medium dark:text-white">{child.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('family.child.age', { age: child.age || '?' })}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <Icon name="settings" size="sm" />
                                </Button>
                            </div>
                        ))}
                    </SeparatedList>
                 </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-dark-2 rounded-lg border border-dashed border-gray-300 dark:border-dark-3 text-center">
                     <div className="w-12 h-12 bg-info/10 text-info rounded-full flex items-center justify-center mb-4">
                         <Icon name="smile" size="lg" />
                     </div>
                     <h3 className="text-lg font-medium dark:text-white mb-2">{t('family.child.promo.title', 'Создайте детский аккаунт')}</h3>
                     <p className="text-gray-500 max-w-md mb-4">
                         {t('family.child.promo.description', 'Настройте ограничения по возрасту, времени и контенту. Это бесплатно.')}
                     </p>
                     <Button variant="primary" size="sm">
                         {t('family.child.create', 'Создать аккаунт')}
                     </Button>
                </div>
            )}
        </DataSection>

        {/* Group Features Section */}
        <DataSection
          id="features"
          title={t('family.features.title', 'Возможности группы')}
        >
          <div className="bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
            <SeparatedList className="p-4">
              {[
                { icon: 'credit-card', title: t('family.features.pay', 'Семейная оплата'), active: true },
                { icon: 'plus', title: t('family.features.plus', 'Плюс для близких'), active: true },
                { icon: 'mail', title: t('family.features.y360', 'Тариф Яндекс 360'), active: false },
                { icon: 'users', title: t('family.features.roles', 'Роли'), active: true },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 group cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors rounded-lg px-2 -mx-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${feature.active ? 'bg-success/10 text-success' : 'bg-gray-100 dark:bg-dark-3 text-gray-400 dark:text-dark-6'}`}>
                       <Icon name={feature.icon} size="md" />
                    </div>
                    <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                      {feature.title}
                    </div>
                  </div>
                  <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              ))}
              <Separator />
              <button className="flex items-center gap-3 py-2 px-2 -mx-2 w-full text-left text-error hover:bg-error/10 dark:hover:bg-error/20 rounded-lg transition-colors">
                 <div className="p-2 rounded-lg bg-error/10 text-error">
                    <Icon name="trash-2" size="md" />
                 </div>
                 <div className="font-medium">
                    {t('family.features.delete', 'Удалить группу')}
                 </div>
              </button>
            </SeparatedList>
          </div>
        </DataSection>
    </PageTemplate>
  );
};

export default FamilyPage;
