import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system/primitives';
import { DataSection, AddButton } from '../../design-system/composites';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  birthYear?: number;
  avatar?: string;
  chipNumber?: string;
}

export interface PetsSectionProps {
  pets: Pet[];
  onAddPet?: () => void;
}

/**
 * PetsSection - секция питомцев пользователя
 * Отображает список питомцев с возможностью добавления нового
 */
export const PetsSection: React.FC<PetsSectionProps> = ({
  pets,
  onAddPet,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();

  const handleViewAll = () => {
    navigate(buildPathWithLang('/personal/pets', currentLang));
  };

  return (
    <DataSection
      id="pets"
      title={t('data.pets.title', 'Pets')}
      description={t('data.pets.description', 'We will help store documents, choose food or make an appointment with a veterinarian')}
      action={
        pets.length > 0 ? (
          <button
            onClick={handleViewAll}
            className={`text-sm ${themeClasses.text.secondary} hover:text-primary transition-colors duration-200 flex items-center gap-1`}
          >
            <span>
              {t('data.pets.viewAll', 'All pets')}
            </span>
            <Icon name="arrow-right" size="sm" />
          </button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {pets.length > 0 ? (
          pets.map((pet, index) => (
            <button
              key={pet.id}
              className={`w-full p-4 rounded-lg bg-gray-1/50 dark:bg-dark-3/50 ${themeClasses.border.default} hover:border-primary/30 dark:hover:border-primary/30 hover:bg-gray-1 dark:hover:bg-dark-3 transition-all duration-200 animate-fade-in text-left`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Аватар питомца */}
                {pet.avatar ? (
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-1 dark:bg-dark-3 flex items-center justify-center flex-shrink-0">
                    <Icon name="heart" size="md" className={themeClasses.text.secondary} />
                  </div>
                )}
                
                {/* Информация о питомце */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    {pet.name}
                  </div>
                  <div className={`text-xs ${themeClasses.text.secondary} mt-1`}>
                    {pet.type}
                    {pet.breed && ` · ${pet.breed}`}
                    {pet.birthYear && ` · ${new Date().getFullYear() - pet.birthYear} ${t('common.years', 'лет')}`}
                  </div>
                </div>
                
                {/* Стрелка */}
                <Icon name="chevron-right" size="sm" className={`${themeClasses.text.secondary} flex-shrink-0`} />
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8">
            <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
              {t('data.pets.empty', 'You have no added pets yet')}
            </p>
          </div>
        )}
        
        {/* Кнопка добавления */}
        {onAddPet && (
          <AddButton
            label={t('data.pets.add', 'Add pet')}
            onClick={onAddPet}
            variant="horizontal"
            size="md"
            borderStyle="solid"
            background="default"
            className="w-full"
          />
        )}
      </div>
    </DataSection>
  );
};

