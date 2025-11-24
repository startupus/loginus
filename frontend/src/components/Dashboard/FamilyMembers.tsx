import React, { useRef, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, Icon, ScrollButton, Button } from '../../design-system/primitives';
import { DataSection, AddButton } from '../../design-system/composites';
import { getInitials } from '../../utils/stringUtils';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useModal } from '../../hooks/useModal';

// Lazy loading модального окна
const EditFamilyMemberAvatarModal = lazy(() => 
  import('../Modals/EditFamilyMemberAvatarModal').then(m => ({ default: m.EditFamilyMemberAvatarModal }))
);

export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
}

export interface FamilyMembersProps {
  members: FamilyMember[];
  onAddMember?: () => void;
  onMemberClick?: (member: FamilyMember) => void;
}

/**
 * FamilyMembers - компактные горизонтальные карточки членов семьи
 */
export const FamilyMembers: React.FC<FamilyMembersProps> = ({
  members,
  onAddMember,
  onMemberClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const editAvatarModal = useModal();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  
  const handleViewAll = () => {
    navigate(buildPathWithLang('/family', currentLang));
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  React.useEffect(() => {
    handleScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [members]);

  const handleEditAvatar = (e: React.MouseEvent, member: FamilyMember) => {
    e.stopPropagation();
    setSelectedMember(member);
    editAvatarModal.open();
  };

  const handleAvatarSaved = (avatarUrl: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Avatar saved for member:', selectedMember?.id, 'url:', avatarUrl);
    }
    // TODO: Обновить аватар члена семьи через API
    editAvatarModal.close();
  };
  
  
  return (
    <DataSection
      id="family"
      title={t('dashboard.family.title', { defaultValue: 'Family' })}
      action={
        <button
          onClick={handleViewAll}
          className={`text-sm ${themeClasses.text.secondary} hover:text-primary transition-colors duration-200 flex items-center gap-1`}
        >
          <span>{t('dashboard.family.manage', { defaultValue: 'Manage' })}</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      }
    >
      {members.length === 0 && onAddMember ? (
        // Пустое состояние с кнопкой добавления
        <div className={themeClasses.state.emptyDark}>
          <div className={themeClasses.iconCircle.info + ' mb-4'}>
            <Icon name="users" size="lg" />
          </div>
          <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>
              {t('dashboard.family.empty.title', { defaultValue: 'No members yet' })}
          </h3>
          <p className={`${themeClasses.text.secondary} max-w-md mb-4`}>
              {t('dashboard.family.empty.description', {
                defaultValue: 'Invite your family to share subscriptions and services.',
              })}
          </p>
          <Button 
            variant="primary" 
            size="sm"
            leftIcon={<Icon name="user-plus" size="sm" />}
            onClick={onAddMember}
          >
              {t('dashboard.family.add', { defaultValue: 'Add member' })}
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Кнопка прокрутки влево */}
          {canScrollLeft && (
            <ScrollButton
              direction="left"
              ariaLabel={t('common.scrollLeft', { defaultValue: 'Scroll left' })}
              onClick={() => scroll('left')}
              variant="accent"
            />
          )}

          {/* Карусель членов семьи */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onScroll={handleScroll}
          >
            {members.map((member, index) => (
              <div
                key={member.id}
                className="relative flex-shrink-0"
                onMouseEnter={() => setHoveredMemberId(member.id)}
                onMouseLeave={() => setHoveredMemberId(null)}
              >
                <button
                  onClick={() => onMemberClick?.(member)}
                  className={`group flex-shrink-0 flex flex-col items-center justify-center gap-3 p-4 rounded-lg border transition-all duration-200 animate-fade-in w-[140px] h-[140px] ${
                    member.role === 'owner' 
                      ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/20' 
                      : `${themeClasses.card.gridItem} ${themeClasses.border.default} hover:border-primary/30 dark:hover:border-primary/30 ${themeClasses.card.gridItemHover}`
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Аватар с индикатором статуса */}
                  <div className="flex-shrink-0 relative transition-transform duration-200 group-hover:scale-110">
                    <Avatar
                      src={member.avatar || undefined}
                      initials={getInitials(member.name)}
                      name={member.name}
                      size="2xl"
                      rounded
                      showStatus
                      status={(member as any).isOnline ? 'online' : 'offline'}
                    />
                  </div>
                  
                  {/* Имя */}
                  <div className="flex flex-col items-center gap-1.5 w-full min-w-0 flex-1 justify-center">
                    <p className={`text-xs font-medium text-center ${themeClasses.text.primary} group-hover:text-primary transition-colors duration-200 line-clamp-1 break-words w-full`}>
                      {member.name}
                    </p>
                  </div>
                </button>
                
                {/* Кнопка редактирования аватара (показывается при наведении) */}
                {hoveredMemberId === member.id && (
                  <button
                    onClick={(e) => handleEditAvatar(e, member)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-lg transition-all duration-200 animate-fade-in z-10"
                    aria-label={t('dashboard.family.editAvatar', { defaultValue: 'Edit avatar' })}
                  >
                    <Icon name="edit" size="xs" />
                  </button>
                )}
              </div>
            ))}
            
            {/* Кнопка добавить */}
            {onAddMember && (
              <div className="flex-shrink-0">
                <AddButton
                  label={t('dashboard.family.add', { defaultValue: 'Add member' })}
                  onClick={onAddMember}
                  variant="vertical"
                  size="md"
                  borderStyle="solid"
                  background="default"
                  className="w-[140px] h-[140px] min-h-0"
                />
              </div>
            )}
          </div>

          {/* Кнопка прокрутки вправо */}
          {canScrollRight && (
            <ScrollButton
              direction="right"
              ariaLabel={t('common.scrollRight', { defaultValue: 'Scroll right' })}
              onClick={() => scroll('right')}
              variant="accent"
            />
          )}
        </div>
      )}

      {/* Модальное окно редактирования аватара */}
      {selectedMember && (
        <Suspense fallback={null}>
          <EditFamilyMemberAvatarModal
            isOpen={editAvatarModal.isOpen}
            onClose={editAvatarModal.close}
            onSuccess={handleAvatarSaved}
            initialData={{
              name: selectedMember.name,
              avatar: selectedMember.avatar,
            }}
          />
        </Suspense>
      )}
    </DataSection>
  );
};
