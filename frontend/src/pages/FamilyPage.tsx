import React, { useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
// Прямые импорты для tree-shaking
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { Avatar } from '@/design-system/primitives/Avatar';
import { Badge } from '@/design-system/primitives/Badge';
import { DataSection } from '@/design-system/composites/DataSection';
import { SeparatedList } from '@/design-system/composites/SeparatedList';
import { familyApi } from '@/services/api/family';
import { getInitials } from '@/utils/stringUtils';
import { themeClasses } from '@/design-system/utils/themeClasses';

// Lazy loading для модального окна - загружается только при открытии
const InviteFamilyMemberModal = lazy(() => 
  import('@/components/Modals/InviteFamilyMemberModal').then(m => ({ default: m.InviteFamilyMemberModal }))
);

/**
 * Интерфейс члена семьи
 */
interface FamilyMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  role: 'admin' | 'member' | 'child' | 'owner';
  isOnline?: boolean;
  age?: number;
}

/**
 * Константы для стилей - используем стандартизированные классы темы
 */
const LIST_CONTAINER_CLASSES = themeClasses.list.containerDark;
const EMPTY_STATE_CLASSES = themeClasses.state.emptyDark;

/**
 * Компонент для отображения элемента списка членов семьи
 */
interface MemberItemProps {
  member: FamilyMember;
  isChild?: boolean;
  t: (key: string, defaultValue?: string, options?: any) => string;
}

// Мемоизированный компонент для оптимизации рендеринга
const MemberItem: React.FC<MemberItemProps> = React.memo(({ member, isChild = false, t }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-3">
      <Avatar
        src={member.avatar || undefined}
        initials={getInitials(member.name)}
        name={member.name}
        size="md"
        rounded
        showStatus
        status={member.isOnline ? 'online' : 'offline'}
      />
      <div>
        <div className={`font-medium ${themeClasses.text.primary} flex items-center gap-2`}>
          {member.name}
          {member.role === 'admin' && (
            <Badge variant="primary" size="sm">{t('family.role.admin', 'Admin')}</Badge>
          )}
        </div>
        <div className={`text-sm ${themeClasses.text.secondary}`}>
          {isChild 
            ? t('family.child.age', 'Возраст: {{age}} лет', { age: member.age || '?' })
            : member.email || member.phone
          }
        </div>
      </div>
    </div>
    {member.role !== 'admin' && (
      <Button variant="ghost" size="sm">
        <Icon name={isChild ? 'settings' : 'more-vertical'} size="sm" />
      </Button>
    )}
  </div>
), (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  return (
    prevProps.member.id === nextProps.member.id &&
    prevProps.member.name === nextProps.member.name &&
    prevProps.member.email === nextProps.member.email &&
    prevProps.member.role === nextProps.member.role &&
    prevProps.member.isOnline === nextProps.member.isOnline &&
    prevProps.isChild === nextProps.isChild
  );
});

MemberItem.displayName = 'MemberItem';

/**
 * FamilyPage - страница управления семьей
 */
const FamilyPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Мемоизированные обработчики для оптимизации
  const handleOpenModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInviteModalOpen(true);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setIsInviteModalOpen(false);
  }, []);
  
  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['family-members'] });
    setIsInviteModalOpen(false);
  }, [queryClient]);
  
  const { data, isLoading } = useQuery({
    queryKey: ['family-members'],
    queryFn: () => familyApi.getMembers(),
    staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
    gcTime: 10 * 60 * 1000, // 10 минут - время хранения в кэше (было cacheTime)
  });

  // Мемоизация фильтрации для оптимизации
  const { adults, children } = useMemo(() => {
    const members = (data?.data?.members || []) as FamilyMember[];
    return {
      adults: members.filter(m => m.role !== 'child'),
      children: members.filter(m => m.role === 'child'),
    };
  }, [data?.data?.members]);

  // Константы для features
  const groupFeatures = useMemo(() => [
    { icon: 'credit-card' as const, title: t('family.features.pay', 'Семейная оплата'), active: true },
    { icon: 'plus' as const, title: t('family.features.plus', 'Плюс для близких'), active: true },
    { icon: 'mail' as const, title: t('family.features.y360', 'Тариф Яндекс 360'), active: false },
    { icon: 'users' as const, title: t('family.features.roles', 'Роли'), active: true },
  ], [t]);

  if (isLoading) {
    return (
      <PageTemplate title={t('sidebar.family', 'Семья')} showSidebar={true}>
        <div className={themeClasses.state.loading}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className={themeClasses.text.secondary}>{t('common.loading', 'Загрузка...')}</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('sidebar.family', 'Семья')} 
      showSidebar={true}
      contentClassName="space-y-8 max-w-4xl mx-auto"
    >
        {/* Promo Block */}
        <div className={`${themeClasses.promo.container} bg-gradient-to-r from-warning to-warning/80 dark:from-warning/90 dark:to-warning/70`}>
          <div className={themeClasses.promo.content}>
            <div className="flex-1">
              <h2 className={`${themeClasses.promo.title} ${themeClasses.text.white}`}>
                {t('family.promo.plus.title', 'Плюса хватит всем')}
              </h2>
              <p className={`${themeClasses.promo.description} ${themeClasses.text.whiteOpacity}`}>
                {t('family.promo.plus.description', 'Подключите до 3 близких к подписке Плюс')}
              </p>
              <Button 
                variant="secondary" 
                className="bg-text-primary text-background hover:bg-text-primary/90 dark:bg-text-primary dark:text-dark dark:hover:bg-text-primary/90 border-none"
              >
                {t('family.promo.plus.action', 'Расширить за 250 ₽')}
              </Button>
            </div>
            <div className={`hidden md:block ${themeClasses.text.whiteOpacity}`}>
               <Icon name="users" size="xl" className="w-32 h-32" />
            </div>
          </div>
          {/* Decorative circles */}
          <div className={themeClasses.decorative.promoCircle}></div>
          <div className={themeClasses.decorative.promoCircleSmall}></div>
        </div>

        {/* Family Group Section */}
        <DataSection
          id="group"
          title={t('family.group.title', 'Семейная группа')}
          description={t('family.group.description', 'Управляйте доступом близких к сервисам')}
          action={
            <Button 
              variant="primary" 
              size="sm"
              leftIcon={<Icon name="user-plus" size="sm" />}
              onClick={handleOpenModal}
              className="md:min-w-auto"
            >
              <span className="hidden md:inline">{t('family.inviteButton', 'Пригласить')}</span>
            </Button>
          }
        >
          <div className={LIST_CONTAINER_CLASSES}>
            <SeparatedList className="p-4">
              {adults.length > 0 ? (
                adults.map((member) => (
                  <MemberItem key={member.id} member={member} t={t} />
                ))
              ) : (
                <div className={`text-center py-4 ${themeClasses.text.secondary}`}>
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
            <Button variant="outline" size="sm" className="gap-2 md:min-w-auto">
                <Icon name="plus" size="sm" />
                <span className="hidden md:inline">{t('family.child.create', 'Создать аккаунт')}</span>
            </Button>
          }
        >
          {children.length > 0 ? (
            <div className={LIST_CONTAINER_CLASSES}>
              <SeparatedList className="p-4">
                {children.map((child) => (
                  <MemberItem key={child.id} member={child} isChild t={t} />
                ))}
              </SeparatedList>
            </div>
          ) : (
            <div className={EMPTY_STATE_CLASSES}>
                     <div className={themeClasses.iconCircle.info + ' mb-4'}>
                         <Icon name="smile" size="lg" />
                     </div>
                     <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>{t('family.child.promo.title', 'Создайте детский аккаунт')}</h3>
                     <p className={`${themeClasses.text.secondary} max-w-md mb-4`}>
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
          <div className={LIST_CONTAINER_CLASSES}>
            <SeparatedList className="p-4">
              {groupFeatures.map((feature, idx) => (
                <div key={idx} className={themeClasses.list.item}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${feature.active ? 'bg-success/10 text-success' : themeClasses.background.gray2 + ' ' + themeClasses.text.secondary}`}>
                       <Icon name={feature.icon} size="md" />
                    </div>
                    <div className={`font-medium ${themeClasses.text.primary} group-hover:text-primary transition-colors`}>
                      {feature.title}
                    </div>
                  </div>
                  <Icon name="chevron-right" size="sm" className={`${themeClasses.text.secondary} group-hover:text-primary transition-colors`} />
                </div>
              ))}
              <div className={themeClasses.list.item}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-error hover:bg-error/10 dark:hover:bg-error/20 transition-colors gap-3"
                  leftIcon={
                    <div className="p-1.5 bg-error/10 text-error rounded-full flex items-center justify-center shrink-0">
                      <Icon name="trash" size="sm" />
                    </div>
                  }
                >
                  <span className={`font-medium ${themeClasses.text.primary}`}>
                    {t('family.features.delete', 'Удалить группу')}
                  </span>
                </Button>
              </div>
            </SeparatedList>
          </div>
        </DataSection>

        {/* Модальное окно приглашения члена семьи */}
        {isInviteModalOpen && (
          <Suspense fallback={null}>
            <InviteFamilyMemberModal
              isOpen={isInviteModalOpen}
              onClose={handleCloseModal}
              onSuccess={handleSuccess}
            />
          </Suspense>
        )}
    </PageTemplate>
  );
};

export default FamilyPage;
