import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

export interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (organizationId: string) => void;
  onCreate?: () => void;
  organizations?: Organization[];
}

/**
 * OrganizationModal - модальное окно для выбора организации
 */
export const OrganizationModal: React.FC<OrganizationModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onCreate,
  organizations = [],
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Фильтрация организаций по поисковому запросу
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedOrgId) {
      onSelect(selectedOrgId);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedOrgId(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modals.organization.title', 'Выбрать организацию')}
      size="md"
    >
      <div className="space-y-4">
        {/* Поиск */}
        <div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('modals.organization.searchPlaceholder', 'Введите название организации')}
            leftIcon={<Icon name="search" size="sm" />}
            fullWidth
          />
        </div>

        {/* Список организаций */}
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {filteredOrganizations.length === 0 ? (
            <div className={`text-center py-8 ${themeClasses.text.secondary}`}>
              <p className="mb-2">{t('modals.organization.noOrganizations', 'У вас пока нет организаций')}</p>
              {onCreate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleClose();
                    onCreate();
                  }}
                >
                  {t('modals.organization.createNew', 'Создать новую организацию')}
                </Button>
              )}
            </div>
          ) : (
            filteredOrganizations.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => setSelectedOrgId(org.id)}
                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                  selectedOrgId === org.id
                    ? `${themeClasses.background.primarySemiTransparent} border-primary`
                    : `${themeClasses.background.gray2} border-border hover:border-primary/30`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${themeClasses.text.primary} mb-1`}>{org.name}</h3>
                    {org.description && (
                      <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>{org.description}</p>
                    )}
                    {org.memberCount !== undefined && (
                      <p className={`text-xs ${themeClasses.text.secondary}`}>
                        {t('modals.organization.memberCount', { count: org.memberCount, defaultValue: `${org.memberCount} ${org.memberCount === 1 ? 'member' : 'members'}` })}
                      </p>
                    )}
                  </div>
                  {selectedOrgId === org.id && (
                    <Icon name="check" size="sm" className="text-primary ml-2" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3 pt-4 border-t border-border">
          {onCreate && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleClose();
                onCreate();
              }}
              className="flex-1"
            >
              <Icon name="plus" size="sm" className="mr-2" />
              {t('modals.organization.create', 'Создать организацию')}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
          >
            {t('modals.organization.cancel', 'Отмена')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSelect}
            disabled={!selectedOrgId}
            className="flex-1"
          >
            {t('modals.organization.select', 'Выбрать')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

