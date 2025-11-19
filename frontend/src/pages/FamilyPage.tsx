import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../design-system/layouts/PageTemplate';
import { Button, Icon, Avatar } from '../design-system/primitives';
import { DataSection } from '../design-system/composites/DataSection';
import { profileApi } from '../services/api/profile';
import { getInitials } from '../utils/stringUtils';

/**
 * FamilyPage - страница управления семьей
 */
const FamilyPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['family'],
    queryFn: () => profileApi.getDashboard(),
  });

  if (isLoading) {
    return (
      <PageTemplate title={t('dashboard.family.title', 'Семья')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-body-color dark:text-dark-6">{t('common.loading', 'Загрузка...')}</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  const family = data?.data?.dashboard?.family || [];

  return (
    <PageTemplate title={t('dashboard.family.title', 'Семья')} showSidebar={true}>
      <div className="space-y-6">
        <DataSection
          id="family"
          title={t('dashboard.family.title', 'Семья')}
          description={t('dashboard.family.description', 'Управление членами семьи')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {family.map((member: any) => (
              <div
                key={member.id}
                className="p-6 rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-4">
                  <Avatar
                    src={member.avatar || undefined}
                    initials={getInitials(member.name)}
                    size="lg"
                    rounded
                  />
                  <div className="text-center">
                    <h3 className="font-semibold text-dark dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-body-color dark:text-dark-6">
                      {member.role || t('dashboard.family.member', 'Член семьи')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="p-6 rounded-lg border-2 border-dashed border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 hover:border-primary transition-colors">
              <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[200px]">
                <Icon name="users" size="xl" className="text-primary" />
                <Button
                  variant="primary"
                  size="sm"
                >
                  {t('dashboard.family.add', 'Добавить члена семьи')}
                </Button>
              </div>
            </div>
          </div>
        </DataSection>
      </div>
    </PageTemplate>
  );
};

export default FamilyPage;

