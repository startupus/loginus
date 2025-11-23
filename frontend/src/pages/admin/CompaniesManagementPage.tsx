import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { Input } from '../../design-system/primitives/Input';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { Badge } from '../../design-system/primitives/Badge';
import { Modal } from '../../design-system/composites/Modal';
import { LoadingState } from '../../design-system/composites/LoadingState';
import { ErrorState } from '../../design-system/composites/ErrorState';
import { EmptyState } from '../../design-system/composites/EmptyState';
import { adminApi, AdminCompany } from '../../services/api/admin';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { formatDate } from '../../utils/intl/formatters';

const CompaniesManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  const locale = currentLang === 'en' ? 'en' : 'ru';
  const queryClient = useQueryClient();

  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Состояния модального окна
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Запрос компаний
  const { data: companiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: () => adminApi.getCompanies(),
  });

  // Мутации
  const deleteMutation = useMutation({
    mutationFn: (companyId: string) => adminApi.deleteCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  // Фильтрация компаний
  const companies = useMemo(() => {
    if (!companiesData?.data?.data?.companies) return [];
    
    let filtered = companiesData.data.data.companies;

    // Поиск по названию
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((company: AdminCompany) =>
        company.name.toLowerCase().includes(searchLower) ||
        company.domain.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по тарифу
    if (planFilter !== 'all') {
      filtered = filtered.filter((company: AdminCompany) => company.subscriptionPlan === planFilter);
    }

    return filtered;
  }, [companiesData, searchQuery, planFilter]);

  // Обработчики
  const handleViewCompany = (companyId: string) => {
    navigate(buildPathWithLang(`/admin/companies/${companyId}`, currentLang));
  };

  const handleCreateCompany = () => {
    setIsCreateMode(true);
    setSelectedCompany(null);
    setIsEditModalOpen(true);
  };

  const handleEditCompany = (company: AdminCompany) => {
    setIsCreateMode(false);
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (window.confirm(t('admin.companies.deleteConfirm', 'Вы уверены, что хотите удалить компанию?'))) {
      await deleteMutation.mutateAsync(companyId);
    }
  };

  const getPlanBadgeVariant = (plan: string): 'success' | 'primary' | 'warning' => {
    switch (plan) {
      case 'basic':
        return 'success';
      case 'premium':
        return 'primary';
      case 'enterprise':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      basic: t('admin.companies.plans.basic', 'Базовый'),
      premium: t('admin.companies.plans.premium', 'Премиум'),
      enterprise: t('admin.companies.plans.enterprise', 'Корпоративный'),
    };
    return labels[plan] || plan;
  };


  if (isLoading) {
    return (
      <AdminPageTemplate title={t('admin.companies.title', 'Управление компаниями')} showSidebar={true}>
        <LoadingState text={t('admin.companies.loading', 'Загрузка компаний...')} />
      </AdminPageTemplate>
    );
  }

  if (error) {
    return (
      <AdminPageTemplate title={t('admin.companies.title', 'Управление компаниями')} showSidebar={true}>
        <ErrorState
          title={t('admin.companies.error.title', 'Ошибка загрузки компаний')}
          description={t('admin.companies.error.description', 'Не удалось загрузить список компаний')}
          action={{
            label: t('common.retry', 'Повторить'),
            onClick: () => refetch(),
          }}
        />
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate 
      title={t('admin.companies.title', 'Управление компаниями')} 
      showSidebar={true}
      headerActions={
        <Button
          variant="primary"
          leftIcon={<Icon name="plus" size="sm" />}
          onClick={handleCreateCompany}
          className="hidden sm:flex"
        >
          {t('admin.companies.add', 'Добавить')}
        </Button>
      }
    >
      <div className="p-4 sm:p-6 pb-24 sm:pb-6">{/* Дополнительный padding снизу для мобильной кнопки */}
        {/* Фильтры */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Поиск */}
          <div className="lg:col-span-2">
            <Input
              type="text"
              placeholder={t('admin.companies.search', 'Поиск по названию или домену...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rightIcon={<Icon name="search" size="sm" className={themeClasses.text.secondary} />}
            />
          </div>

          {/* Фильтр по тарифу */}
          <div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="all">{t('admin.companies.filters.allPlans', 'Все тарифы')}</option>
              <option value="basic">{t('admin.companies.plans.basic', 'Базовый')}</option>
              <option value="premium">{t('admin.companies.plans.premium', 'Премиум')}</option>
              <option value="enterprise">{t('admin.companies.plans.enterprise', 'Корпоративный')}</option>
            </select>
          </div>
        </div>

        {/* Таблица компаний */}
        <div className={`${themeClasses.card.default} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={themeClasses.background.gray2}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                    {t('admin.companies.table.name', 'Название')}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                    {t('admin.companies.table.plan', 'Тариф')}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                    {t('admin.companies.table.services', 'Сервисы')}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                    {t('admin.companies.table.users', 'Пользователи')}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                    {t('admin.companies.table.lastActivity', 'Последняя активность')}
                  </th>
                  <th className={`px-6 py-4 text-right text-sm font-semibold ${themeClasses.text.primary}`}>
                    {t('admin.companies.table.actions', 'Действия')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <EmptyState
                        icon="briefcase"
                        title={t('admin.companies.empty.title', 'Компании не найдены')}
                        description={t('admin.companies.empty.description', 'Попробуйте изменить параметры поиска или фильтры')}
                      />
                    </td>
                  </tr>
                ) : (
                  companies.map((company: AdminCompany) => (
                    <tr key={company.id} className={`${themeClasses.list.itemHover} transition-colors`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`font-medium ${themeClasses.text.primary}`}>{company.name}</p>
                          <p className={`text-sm ${themeClasses.text.secondary}`}>{company.domain}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getPlanBadgeVariant(company.subscriptionPlan)} size="md">
                          {getPlanLabel(company.subscriptionPlan)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${themeClasses.text.primary} font-medium`}>
                          {company.servicesCount || company.services?.length || 0}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${themeClasses.text.primary} font-medium`}>
                          {company.userCount || 0}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${themeClasses.text.secondary}`}>
                          {formatDate(company.lastActivity || company.updatedAt, locale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCompany(company.id)}
                            title={t('admin.companies.view', 'Просмотр')}
                          >
                            <Icon name="eye" size="sm" className="mr-2" />
                            {t('admin.companies.view', 'Просмотр')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={() => handleEditCompany(company)}
                            title={t('admin.companies.edit', 'Редактировать')}
                          >
                            <Icon name="edit" size="sm" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={() => handleDeleteCompany(company.id)}
                            title={t('admin.companies.delete', 'Удалить')}
                          >
                            <Icon name="trash" size="sm" className="text-error" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Мобильная кнопка создания компании */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <Button
          variant="primary"
          size="lg"
          onClick={handleCreateCompany}
          className="rounded-full shadow-xl hover:shadow-2xl"
          iconOnly
        >
          <Icon name="plus" size="md" />
        </Button>
      </div>

      {/* Модальное окно редактирования/создания */}
      {isEditModalOpen && (
        <CompanyEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCompany(null);
          }}
          company={selectedCompany}
          isCreateMode={isCreateMode}
        />
      )}
    </AdminPageTemplate>
  );
};

// Компонент модального окна редактирования/создания компании
interface CompanyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: AdminCompany | null;
  isCreateMode: boolean;
}

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
  isOpen,
  onClose,
  company,
  isCreateMode,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: company?.name || '',
    domain: company?.domain || '',
    subscriptionPlan: company?.subscriptionPlan || 'basic' as 'basic' | 'premium' | 'enterprise',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateCompany(company!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', company!.id] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreateMode) {
      await createMutation.mutateAsync(formData);
    } else {
      await updateMutation.mutateAsync(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? t('admin.companies.createCompany', 'Создать компанию') : t('admin.companies.editCompany', 'Редактировать компанию')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('admin.companies.form.name', 'Название компании')}
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label={t('admin.companies.form.domain', 'Домен')}
          type="text"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          required
        />

        <div>
          <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
            {t('admin.companies.form.plan', 'Тариф')}
          </label>
          <select
            value={formData.subscriptionPlan}
            onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
            className={`${themeClasses.input.default} w-full`}
            required
          >
            <option value="basic">{t('admin.companies.plans.basic', 'Базовый')}</option>
            <option value="premium">{t('admin.companies.plans.premium', 'Премиум')}</option>
            <option value="enterprise">{t('admin.companies.plans.enterprise', 'Корпоративный')}</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} type="button">
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isCreateMode ? t('common.create', 'Создать') : t('common.save', 'Сохранить')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompaniesManagementPage;
