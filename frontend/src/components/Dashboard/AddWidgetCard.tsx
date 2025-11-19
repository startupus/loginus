import React from 'react';
import { useTranslation } from 'react-i18next';
import { AddButton } from '../../design-system/composites/AddButton';

export interface AddWidgetCardProps {
  onClick: () => void;
}

/**
 * AddWidgetCard - карточка для добавления нового виджета
 * Отображается как плитка в Masonry сетке
 * Использует стандартный AddButton со сплошной границей
 */
export const AddWidgetCard: React.FC<AddWidgetCardProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <AddButton
      label={t('dashboard.widgets.add', 'Добавить виджет')}
      onClick={onClick}
      variant="compact"
      size="sm"
      borderStyle="solid"
      background="default"
      className="w-full"
    />
  );
};

