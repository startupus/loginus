import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { Input } from '../../design-system/primitives/Input';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { Badge } from '../../design-system/primitives/Badge';
import { Avatar } from '../../design-system/primitives/Avatar';
import { Modal } from '../../design-system/composites/Modal';
import { LoadingState } from '../../design-system/composites/LoadingState';
import { ErrorState } from '../../design-system/composites/ErrorState';
import { EmptyState } from '../../design-system/composites/EmptyState';
import { adminApi, AdminUser, AdminCompany } from '../../services/api/admin';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { formatDate } from '../../utils/intl/formatters';

const CompanyDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  const locale = currentLang === 'en' ? 'en' : 'ru';
  const queryClient = useQueryClient();

  // Состояния фильтров для пользователей
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Состояние модального окна редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Запрос компании
  const { data: companyData, isLoading: isLoadingCompany, error: companyError } = useQuery({
    queryKey: ['company', id],
    queryFn: () => adminApi.getCompanyById(id!),
    enabled: !!id,
  });

  // Запрос пользователей компании
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['company-users', id],
    queryFn: () => adminApi.getUsersByCompany(id!),
    enabled: !!id,
  });

  // Фильтрация пользователей
  const users = useMemo(() => {
    if (!usersData?.data?.data?.users) return [];
    
    let filtered = usersData.data.data.users;

    // Поиск
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((user: AdminUser) =>
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(searchQuery)
      );
    }

    // Фильтр по роли
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user: AdminUser) => user.role === roleFilter);
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user: AdminUser) => user.status === statusFilter);
    }

    return filtered;
  }, [usersData, searchQuery, roleFilter, statusFilter]);

  const company = companyData?.data?.data;

  // Обработчики
  const handleBack = () => {
    navigate(buildPathWithLang('/admin/companies', currentLang));
  };

  const handleEditCompany = () => {
    setIsEditModalOpen(true);
  };

  const getRoleBadgeVariant = (role: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (role) {
      case 'super_admin':
        return 'danger';
      case 'company_admin':
        return 'primary';
      case 'company_admin_staff':
      case 'super_admin_staff':
        return 'info';
      default:
        return 'success';
    }
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'blocked':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: t('admin.users.roles.super_admin'),
      super_admin_staff: t('admin.users.roles.super_admin_staff'),
      company_admin: t('admin.users.roles.company_admin'),
      company_admin_staff: t('admin.users.roles.company_admin_staff'),
      user: t('admin.users.roles.user'),
    };
    return labels[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: t('admin.users.status.active'),
      inactive: t('admin.users.status.inactive'),
      blocked: t('admin.users.status.blocked'),
    };
    return labels[status] || status;
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
      basic: t('admin.companies.plans.basic'),
      premium: t('admin.companies.plans.premium'),
      enterprise: t('admin.companies.plans.enterprise'),
    };
    return labels[plan] || plan;
  };


  if (isLoadingCompany) {
    return (
      <AdminPageTemplate title={t('admin.companies.detail.title')} showSidebar={true}>
        <LoadingState text={t('admin.companies.detail.loading')} />
      </AdminPageTemplate>
    );
  }

  if (companyError || !company) {
    return (
      <AdminPageTemplate title={t('admin.companies.detail.title')} showSidebar={true}>
        <ErrorState
          title={t('admin.companies.detail.error.title')}
          description={t('admin.companies.detail.error.description')}
          action={{
            label: t('admin.companies.detail.back'),
            onClick: handleBack,
          }}
        />
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate 
      title={t('admin.companies.detail.title', { name: company.name })} 
      showSidebar={true}
      headerActions={
        <Button
          variant="primary"
          leftIcon={<Icon name="edit" size="sm" />}
          onClick={handleEditCompany}
          className="hidden sm:flex"
        >
          {t('admin.companies.edit')}
        </Button>
      }
    >
      <div className="p-4 sm:p-6">
        {/* Кнопка назад */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            leftIcon={<Icon name="arrow-left" size="sm" />}
          >
            {t('admin.companies.detail.back')}
          </Button>
        </div>

        {/* Информация о компании */}
        <div className={`${themeClasses.card.default} p-6 mb-6`}>
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
            {t('admin.companies.detail.info')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                {t('admin.companies.detail.plan')}
              </p>
              <Badge variant={getPlanBadgeVariant(company.subscriptionPlan)} size="md">
                {getPlanLabel(company.subscriptionPlan)}
              </Badge>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                {t('admin.companies.detail.servicesCount')}
              </p>
              <p className={`text-sm ${themeClasses.text.primary} font-medium`}>
                {company.servicesCount || company.services?.length || 0}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                {t('admin.companies.detail.usersCount')}
              </p>
              <p className={`text-sm ${themeClasses.text.primary} font-medium`}>
                {company.userCount || 0}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                {t('admin.companies.detail.createdAt')}
              </p>
              <p className={`text-sm ${themeClasses.text.primary}`}>
                {formatDate(company.createdAt, locale, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                {t('admin.companies.detail.lastActivity')}
              </p>
              <p className={`text-sm ${themeClasses.text.primary}`}>
                {formatDate(company.lastActivity || company.updatedAt, locale, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Список сервисов */}
          {company.services && company.services.length > 0 && (
            <div className="mt-6">
              <p className={`text-sm ${themeClasses.text.secondary} mb-3`}>
                {t('admin.companies.detail.services')}
              </p>
              <div className="flex flex-wrap gap-2">
                {company.services.map((service) => (
                  <Badge
                    key={service.id}
                    variant={service.status === 'active' ? 'success' : 'gray'}
                    size="md"
                  >
                    {service.name} ({service.type})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Таблица пользователей */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
            {t('admin.companies.detail.users')}
          </h3>

          {/* Фильтры пользователей */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <Input
                type="text"
                placeholder={t('admin.users.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rightIcon={<Icon name="search" size="sm" className={themeClasses.text.secondary} />}
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`${themeClasses.input.default} w-full`}
              >
                <option value="all">{t('admin.users.filters.allRoles')}</option>
                <option value="company_admin">{t('admin.users.roles.company_admin')}</option>
                <option value="company_admin_staff">{t('admin.users.roles.company_admin_staff')}</option>
                <option value="user">{t('admin.users.roles.user')}</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${themeClasses.input.default} w-full`}
              >
                <option value="all">{t('admin.users.filters.allStatuses')}</option>
                <option value="active">{t('admin.users.status.active')}</option>
                <option value="inactive">{t('admin.users.status.inactive')}</option>
                <option value="blocked">{t('admin.users.status.blocked')}</option>
              </select>
            </div>
          </div>

          {/* Таблица */}
          {isLoadingUsers ? (
            <LoadingState text={t('admin.companies.detail.usersLoading')} />
          ) : usersError ? (
            <ErrorState
              title={t('admin.companies.detail.usersError.title')}
              description={t('admin.companies.detail.usersError.description')}
            />
          ) : (
            <div className={`${themeClasses.card.default} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={themeClasses.background.gray2}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                        {t('admin.users.table.user')}
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                        {t('admin.users.table.role')}
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                        {t('admin.users.table.status')}
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                        {t('admin.users.table.createdAt')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12">
                          <EmptyState
                            icon="users"
                            title={t('admin.companies.detail.usersEmpty.title')}
                            description={t('admin.companies.detail.usersEmpty.description')}
                          />
                        </td>
                      </tr>
                    ) : (
                      users.map((user: AdminUser) => (
                        <tr key={user.id} className={`${themeClasses.list.itemHover} transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={user.avatar || undefined}
                                name={user.displayName}
                                size="md"
                                status={user.status === 'active' ? 'online' : 'offline'}
                              />
                              <div>
                                <p className={`font-medium ${themeClasses.text.primary}`}>{user.displayName}</p>
                                <p className={`text-sm ${themeClasses.text.secondary}`}>{user.email}</p>
                                <p className={`text-sm ${themeClasses.text.secondary}`}>{user.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getRoleBadgeVariant(user.role)} size="md">
                              {getRoleLabel(user.role)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getStatusBadgeVariant(user.status)} size="md">
                              {getStatusLabel(user.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className={`text-sm ${themeClasses.text.secondary}`}>
                              {formatDate(user.createdAt, locale, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно редактирования */}
      {isEditModalOpen && company && (
        <CompanyEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          company={company}
        />
      )}
    </AdminPageTemplate>
  );
};

// Компонент модального окна редактирования компании
interface CompanyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: AdminCompany;
}

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: company.name,
    domain: company.domain,
    subscriptionPlan: company.subscriptionPlan,
  });

  // Обновляем форму при изменении компании
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        domain: company.domain,
        subscriptionPlan: company.subscriptionPlan,
      });
    }
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateCompany(company.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', company.id] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.companies.editCompany')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('admin.companies.form.name')}
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label={t('admin.companies.form.domain')}
          type="text"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          required
        />

        <div>
          <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
            {t('admin.companies.form.plan')}
          </label>
          <select
            value={formData.subscriptionPlan}
            onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
            className={`${themeClasses.input.default} w-full`}
            required
          >
            <option value="basic">{t('admin.companies.plans.basic')}</option>
            <option value="premium">{t('admin.companies.plans.premium')}</option>
            <option value="enterprise">{t('admin.companies.plans.enterprise')}</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={updateMutation.isPending}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyDetailPage;

