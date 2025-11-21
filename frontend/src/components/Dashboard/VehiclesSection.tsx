import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system/primitives';
import { DataSection, AddButton } from '../../design-system/composites';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
}

export interface VehiclesSectionProps {
  vehicles: Vehicle[];
  onAddVehicle?: () => void;
}

/**
 * VehiclesSection - секция автомобилей пользователя
 * Отображает список автомобилей с возможностью добавления нового
 */
export const VehiclesSection: React.FC<VehiclesSectionProps> = ({
  vehicles,
  onAddVehicle,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();

  const handleViewAll = () => {
    navigate(buildPathWithLang('/personal/vehicles', currentLang));
  };

  return (
    <DataSection
      id="auto"
      title={t('personalData.vehicles.title', 'Автомобили')}
      action={
        vehicles.length > 0 ? (
          <button
            onClick={handleViewAll}
            className="text-sm text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1"
          >
            <span>
              {t('personalData.vehicles.viewAll', 'Все автомобили')}
              {vehicles.length > 0 && ` ${vehicles.length}`}
            </span>
            <Icon name="arrow-right" size="sm" />
          </button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle, index) => (
            <button
              key={vehicle.id}
              className={`w-full p-4 rounded-lg bg-gray-1/50 dark:bg-dark-3/50 ${themeClasses.border.default} hover:border-primary/30 dark:hover:border-primary/30 hover:bg-gray-1 dark:hover:bg-dark-3 transition-all duration-200 animate-fade-in text-left`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Иконка автомобиля */}
                <div className="w-12 h-12 rounded-lg bg-gray-1 dark:bg-dark-3 flex items-center justify-center flex-shrink-0">
                  <Icon name="car" size="md" className="text-text-secondary" />
                </div>
                
                {/* Информация об автомобиле */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary">
                    {vehicle.brand} {vehicle.model}
                    {vehicle.year && ` (${vehicle.year})`}
                  </div>
                  {vehicle.vin && (
                    <div className="text-xs text-text-secondary mt-1 truncate">
                      VIN: {vehicle.vin}
                    </div>
                  )}
                  {vehicle.licensePlate && (
                    <div className="text-xs text-text-secondary mt-1">
                      {vehicle.licensePlate}
                    </div>
                  )}
                </div>
                
                {/* Стрелка */}
                <Icon name="chevron-right" size="sm" className="text-text-secondary flex-shrink-0" />
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-text-secondary mb-4">
              {t('personalData.vehicles.empty', 'У вас пока нет добавленных автомобилей')}
            </p>
          </div>
        )}
        
        {/* Кнопка добавления */}
        {onAddVehicle && (
          <AddButton
            label={t('personalData.vehicles.add', 'Добавить автомобиль')}
            onClick={onAddVehicle}
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

