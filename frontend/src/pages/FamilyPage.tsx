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
import { Separator } from '@/design-system/primitives/Separator';
import { PetsSection } from '@/components/Dashboard/PetsSection';
import { familyApi } from '@/services/api/family';
import { personalApi } from '@/services/api/personal';
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
  email?: string | null;
  phone?: string;
  avatar?: string | null;
  role: 'admin' | 'member' | 'child' | 'owner' | 'pending';
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

// Мемоизированный компонент для отображения элемента списка членов семьи
const MemberItem: React.FC<MemberItemProps> = React.memo(({ member, isChild = false, t }) => {
  const isPending = member.role === 'pending';
  const isAdmin = member.role === 'admin';
  const isChildMember = member.role === 'child';
  
  // Формируем текст роли/описания
  let roleText = '';
  if (isPending) {
    roleText = ''; // Для pending не показываем описание
  } else if (isAdmin) {
    roleText = `${t('family.role.admin', 'Админ')} • ${member.email || member.phone || ''}`;
  } else if (isChildMember) {
    roleText = ''; // Для детей не показываем email
  } else {
    roleText = member.email || member.phone || '';
  }
  
  // Определяем иконку для бейджа
  let badgeIcon: 'crown' | 'help-circle' | 'clock' | null = null;
  if (isAdmin || member.role === 'owner') {
    badgeIcon = 'crown';
  } else if (isPending) {
    badgeIcon = 'clock';
  } else if (member.role === 'member') {
    badgeIcon = 'help-circle';
  }
  
  return (
    <button
      className={`${themeClasses.list.item} w-full`}
      onClick={() => {
        if (!isPending) {
          // TODO: открыть модалку редактирования участника
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar
            src={member.avatar || undefined}
            initials={getInitials(member.name)}
            name={member.name}
            size="md"
            rounded
            showStatus={!isPending}
            status={member.isOnline ? 'online' : 'offline'}
          />
          {badgeIcon && (
            <div className="absolute -bottom-1 -right-1 bg-background dark:bg-dark-2 rounded-full p-0.5">
              <Icon 
                name={badgeIcon} 
                size="xs" 
                className="text-text-secondary"
              />
            </div>
          )}
        </div>
        <div className="flex-1 text-left">
          <div className={`font-medium ${themeClasses.text.primary} flex items-center gap-2`}>
            {member.name}
          </div>
          {roleText && (
            <div className={`text-sm ${themeClasses.text.secondary}`}>
              {roleText}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}, (prevProps, nextProps) => {
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

  // Разделяем участников и pending invites
  const { members, pendingInvites } = useMemo(() => {
    const all = (data?.data?.members || []) as FamilyMember[];
    return {
      members: all.filter(m => m.role !== 'pending'),
      pendingInvites: all.filter(m => m.role === 'pending'),
    };
  }, [data?.data?.members]);

  // Загружаем данные питомцев
  const { data: petsData } = useQuery({
    queryKey: ['pets'],
    queryFn: () => personalApi.getPets(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const pets = petsData?.data?.data || [];

  // Константы для features группы
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
          <div className={themeClasses.state.loadingSpinner}>
            <div className={themeClasses.state.loadingSpinnerElement}></div>
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
        <div className={themeClasses.promo.containerWarning}>
          <div className={themeClasses.promo.content}>
            <div className="flex-1">
              <h2 className={`${themeClasses.promo.title} ${themeClasses.text.white}`}>
                {t('family.promo.plus.title', 'Плюса хватит всем')}
              </h2>
              <p className={`${themeClasses.promo.description} ${themeClasses.text.whiteOpacity}`}>
                {t('family.promo.plus.description', 'Одной подписки мало? Добавьте ещё 2 близких и 5 устройств')}
              </p>
              <Button 
                variant="secondary" 
                className={themeClasses.promo.buttonInverted}
              >
                {t('family.promo.plus.action', 'Расширить за 250 ₽ в месяц')}
              </Button>
            </div>
            <div className={`${themeClasses.promo.iconHidden} ${themeClasses.text.whiteOpacity}`}>
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
        >
          <div className={LIST_CONTAINER_CLASSES}>
            {(members.length > 0 || pendingInvites.length > 0) ? (
              <div className="p-4">
                <SeparatedList>
                  {/* Активные участники */}
                  {members.map((member) => (
                    <MemberItem 
                      key={member.id} 
                      member={member} 
                      isChild={member.role === 'child'} 
                      t={t} 
                    />
                  ))}
                  {/* Pending invites */}
                  {pendingInvites.map((invite) => (
                    <MemberItem 
                      key={invite.id} 
                      member={invite} 
                      t={t} 
                    />
                  ))}
                </SeparatedList>
                
                {/* Разделитель между участниками и действиями */}
                <Separator className="my-3" />
                
                {/* Действия в конце списка */}
                <div className="space-y-0">
                  <button
                    onClick={handleOpenModal}
                    className={`${themeClasses.list.item} w-full`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={themeClasses.iconContainer.gray}>
                        <Icon name="plus" size="md" />
                      </div>
                      <div className={`font-medium ${themeClasses.text.primary}`}>
                        {t('family.invite.action', 'Пригласить близкого')}
                      </div>
                    </div>
                  </button>
                  <Separator className="my-3" />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: открыть модалку создания детского аккаунта
                    }}
                    className={`${themeClasses.list.item} w-full block`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={themeClasses.iconContainer.gray}>
                        <Icon name="smile" size="md" />
                      </div>
                      <div className={`font-medium ${themeClasses.text.primary}`}>
                        {t('family.child.create', 'Создать детский аккаунт')}
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            ) : (
              <div className={EMPTY_STATE_CLASSES}>
                <div className={themeClasses.iconCircle.info + ' mb-4'}>
                  <Icon name="users" size="lg" />
                </div>
                <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>
                  {t('family.empty.title', 'Нет участников')}
                </h3>
                <p className={`${themeClasses.text.secondary} max-w-md mb-4`}>
                  {t('family.empty.description', 'Пригласите близких в семейную группу, чтобы делиться подписками и сервисами')}
                </p>
                <Button 
                  variant="primary" 
                  size="sm"
                  leftIcon={<Icon name="user-plus" size="sm" />}
                  onClick={handleOpenModal}
                >
                  {t('family.inviteButton', 'Пригласить участника')}
                </Button>
              </div>
            )}
          </div>
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
                    <div className={feature.active ? themeClasses.iconContainer.active : themeClasses.iconContainer.inactive}>
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
                  className={themeClasses.button.delete}
                  leftIcon={
                    <div className={themeClasses.button.deleteIcon}>
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

        {/* Pets Section */}
        <PetsSection
          pets={pets}
          onAddPet={() => {
            // TODO: открыть модалку добавления питомца
          }}
        />

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
