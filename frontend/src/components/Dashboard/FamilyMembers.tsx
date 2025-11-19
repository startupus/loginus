import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, Icon } from '../../design-system/primitives';
import { DataSection, AddButton } from '../../design-system/composites';
import { getInitials } from '../../utils/stringUtils';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

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
  
  
  return (
    <DataSection
      id="family"
      title={t('dashboard.family.title', 'Семья')}
      action={
        <button
          onClick={handleViewAll}
          className="text-sm text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1"
        >
          <span>{t('dashboard.family.manage', 'Управление')}</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      }
    >
      <div className="relative">
        {/* Кнопка прокрутки влево */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background dark:bg-surface shadow-lg border border-border flex items-center justify-center hover:bg-gray-1 dark:hover:bg-gray-2 transition-colors"
            aria-label={t('common.scrollLeft', 'Прокрутить влево')}
          >
            <Icon name="chevron-left" size="sm" className="text-text-secondary" />
          </button>
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
            <button
              key={member.id}
              onClick={() => onMemberClick?.(member)}
              className={`group flex-shrink-0 flex flex-col items-center justify-center gap-3 p-4 rounded-lg border transition-all duration-200 animate-fade-in w-[140px] h-[140px] ${
                member.role === 'owner' 
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/20' 
                  : 'bg-gray-1/50 dark:bg-gray-2/50 border-border hover:border-primary/30 hover:bg-gray-1 dark:hover:bg-gray-2'
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
                <p className="text-xs font-medium text-center text-text-primary group-hover:text-primary transition-colors duration-200 line-clamp-1 break-words w-full">
                  {member.name}
                </p>
              </div>
            </button>
          ))}
          
          {/* Кнопка добавить */}
          {onAddMember && (
            <div className="flex-shrink-0">
              <AddButton
                label={t('dashboard.family.add', 'Добавить')}
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
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background dark:bg-surface shadow-lg border border-border flex items-center justify-center hover:bg-gray-1 dark:hover:bg-gray-2 transition-colors"
            aria-label={t('common.scrollRight', 'Прокрутить вправо')}
          >
            <Icon name="chevron-right" size="sm" className="text-text-secondary" />
          </button>
        )}
      </div>
    </DataSection>
  );
};
