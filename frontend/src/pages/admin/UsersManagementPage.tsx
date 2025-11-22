import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { Input } from '../../design-system/primitives/Input';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { Badge } from '../../design-system/primitives/Badge';
import { Avatar } from '../../design-system/primitives/Avatar';
import { Modal } from '../../design-system/composites/Modal';
import { adminApi } from '../../services/api/admin';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { themeClasses } from '../../design-system/utils/themeClasses';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  avatar?: string | null;
  role: 'super_admin' | 'super_admin_staff' | 'company_admin' | 'company_admin_staff' | 'user';
  companyId: string | null;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

const UsersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { isSuperAdmin, canAccessCompany } = useAdminPermissions();
  const queryClient = useQueryClient();

  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Состояния сортировки
  const [sortBy, setSortBy] = useState<'displayName' | 'role' | 'status' | 'createdAt' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Состояние календаря
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Состояния модального окна
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Запросы
  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users', searchQuery, roleFilter, statusFilter, companyFilter, dateFrom, dateTo, page, limit, sortBy, sortOrder],
    queryFn: () => adminApi.getUsers({
      search: searchQuery || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      companyId: companyFilter !== 'all' ? companyFilter : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    }),
  });

  const { data: companiesResponse } = useQuery({
    queryKey: ['companies'],
    queryFn: () => adminApi.getCompanies(),
    enabled: isSuperAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Извлечение данных из ответа API
  const users = Array.isArray(usersResponse?.data?.data?.data) 
    ? usersResponse.data.data.data 
    : [];
  const companies = Array.isArray(companiesResponse?.data?.data?.data) 
    ? companiesResponse.data.data.data 
    : [];
  const meta = usersResponse?.data?.data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };
  
  // Обработчик сортировки
  const handleSort = (column: 'displayName' | 'role' | 'status' | 'createdAt') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  // Генерация инициалов для аватара (как в ProfileMenu)
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Обработчики
  const handleCreateUser = () => {
    setIsCreateMode(true);
    setSelectedUser(null);
    setIsEditModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setIsCreateMode(false);
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t('admin.users.deleteConfirm', 'Вы уверены, что хотите удалить пользователя?'))) {
      await deleteMutation.mutateAsync(userId);
    }
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
      super_admin: t('admin.users.roles.super_admin', 'Супер-админ'),
      super_admin_staff: t('admin.users.roles.super_admin_staff', 'Персонал супер-админа'),
      company_admin: t('admin.users.roles.company_admin', 'Админ компании'),
      company_admin_staff: t('admin.users.roles.company_admin_staff', 'Персонал админа'),
      user: t('admin.users.roles.user', 'Пользователь'),
    };
    return labels[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: t('admin.users.status.active', 'Активен'),
      inactive: t('admin.users.status.inactive', 'Неактивен'),
      blocked: t('admin.users.status.blocked', 'Заблокирован'),
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <AdminPageTemplate title={t('admin.users.title', 'Управление пользователями')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Icon name="loader" size="lg" className="animate-spin text-primary" />
        </div>
      </AdminPageTemplate>
    );
  }

  if (error) {
    return (
      <AdminPageTemplate title={t('admin.users.title', 'Управление пользователями')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Icon name="alert-circle" size="lg" color="rgb(var(--color-error))" className="mx-auto mb-4" />
            <p className="text-text-secondary">
              {t('errors.500Description', 'Что-то пошло не так. Мы уже работаем над исправлением.')}
            </p>
          </div>
        </div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate 
      title={t('admin.users.title', 'Управление пользователями')} 
      showSidebar={true}
      headerActions={
        <Button
          variant="primary"
          leftIcon={<Icon name="user-plus" size="sm" />}
          onClick={handleCreateUser}
          className="hidden sm:flex"
        >
          {t('admin.users.add', 'Добавить')}
        </Button>
      }
    >
      <div className="p-4 sm:p-6 pb-24 sm:pb-6">{/* Дополнительный padding снизу для мобильной кнопки */}
        {/* Фильтры */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Поиск */}
          <div className="lg:col-span-2">
            <Input
              type="text"
              placeholder={t('admin.users.search', 'Поиск по имени, email или телефону...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rightIcon={<Icon name="search" size="sm" className="text-text-secondary" />}
            />
          </div>

          {/* Фильтр по роли */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="all">{t('admin.users.filters.allRoles', 'Все роли')}</option>
              <option value="super_admin">{t('admin.users.roles.super_admin', 'Супер-админ')}</option>
              <option value="super_admin_staff">{t('admin.users.roles.super_admin_staff', 'Персонал супер-админа')}</option>
              <option value="company_admin">{t('admin.users.roles.company_admin', 'Админ компании')}</option>
              <option value="company_admin_staff">{t('admin.users.roles.company_admin_staff', 'Персонал админа')}</option>
              <option value="user">{t('admin.users.roles.user', 'Пользователь')}</option>
            </select>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="all">{t('admin.users.filters.allStatuses', 'Все статусы')}</option>
              <option value="active">{t('admin.users.status.active', 'Активен')}</option>
              <option value="inactive">{t('admin.users.status.inactive', 'Неактивен')}</option>
              <option value="blocked">{t('admin.users.status.blocked', 'Заблокирован')}</option>
            </select>
          </div>

          {/* Фильтр по компании (только для super_admin) */}
          {isSuperAdmin && (
            <div>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className={`${themeClasses.input.default} w-full`}
              >
                <option value="all">{t('admin.users.filters.allCompanies', 'Все компании')}</option>
                {companies.map((company: any) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Таблица пользователей */}
        <div className={`${themeClasses.card.default} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-1 dark:bg-dark-2">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-2 dark:hover:bg-dark-3 transition-colors"
                    onClick={() => handleSort('displayName')}
                  >
                    <div className="flex items-center gap-2">
                      {t('admin.users.table.user', 'Пользователь')}
                      {sortBy === 'displayName' && (
                        <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size="sm" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-2 dark:hover:bg-dark-3 transition-colors"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-2">
                      {t('admin.users.table.role', 'Роль')}
                      {sortBy === 'role' && (
                        <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size="sm" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-2 dark:hover:bg-dark-3 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      {t('admin.users.table.status', 'Статус')}
                      {sortBy === 'status' && (
                        <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size="sm" />
                      )}
                    </div>
                  </th>
                  {isSuperAdmin && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      {t('admin.users.table.company', 'Компания')}
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary relative">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <Icon name="calendar" size="sm" />
                        {t('admin.users.table.createdAt', 'Дата регистрации')}
                      </button>
                      <button 
                        onClick={() => handleSort('createdAt')}
                        className="hover:text-primary transition-colors"
                      >
                        {sortBy === 'createdAt' && (
                          <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size="sm" />
                        )}
                      </button>
                    </div>
                    {showDatePicker && (
                      <div className="absolute z-10 mt-2 p-4 bg-white dark:bg-dark-2 rounded-lg shadow-lg border border-border min-w-[280px]">
                        <div className="space-y-3">
                          <div>
                            <Input
                              type="date"
                              label={t('admin.users.dateFrom', 'С')}
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              size="sm"
                              placeholder="дд.мм.гггг"
                            />
                          </div>
                          <div>
                            <Input
                              type="date"
                              label={t('admin.users.dateTo', 'По')}
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                              size="sm"
                              placeholder="дд.мм.гггг"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setDateFrom('');
                                setDateTo('');
                                setShowDatePicker(false);
                              }}
                              className="flex-1"
                            >
                              {t('common.reset', 'Сбросить')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => setShowDatePicker(false)}
                              className="flex-1"
                            >
                              {t('common.apply', 'Применить')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                    {t('admin.users.table.actions', 'Действия')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Icon name="users" size="lg" className="text-text-secondary mb-4" />
                        <p className="text-text-secondary">
                          {t('admin.users.empty', 'Пользователи не найдены')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-1 dark:hover:bg-dark-2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative inline-flex items-center justify-center overflow-hidden rounded-full w-10 h-10 text-base bg-primary/10 text-primary font-semibold">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(user.displayName)
                            )}
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-dark-2 ${
                              user.status === 'active' ? 'bg-success' : 'bg-gray-3'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{user.displayName}</p>
                            <p className="text-sm text-text-secondary">{user.email}</p>
                            <p className="text-sm text-text-secondary">{user.phone}</p>
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
                      {isSuperAdmin && (
                        <td className="px-6 py-4">
                          <p className="text-sm text-text-secondary">
                            {user.companyId
                              ? companies.find((c: any) => c.id === user.companyId)?.name || '-'
                              : '-'}
                          </p>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-secondary">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={() => handleEditUser(user)}
                            title={t('admin.users.edit', 'Редактировать')}
                          >
                            <Icon name="edit" size="sm" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={() => handleDeleteUser(user.id)}
                            title={t('admin.users.delete', 'Удалить')}
                          >
                            <Icon name="trash" size="sm" className="text-danger" />
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

        {/* Пагинация */}
        {meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-dark-2 rounded-lg border border-border gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                {t('admin.users.showing', 'Показано')} {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} {t('admin.users.of', 'из')} {meta.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                iconOnly
              >
                <Icon name="chevron-left" size="sm" />
              </Button>
              
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                let pageNum;
                if (meta.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                disabled={page === meta.totalPages}
                iconOnly
              >
                <Icon name="chevron-right" size="sm" />
              </Button>
            </div>
          </div>
        )}

        {/* Модальное окно редактирования/создания */}
        {isEditModalOpen && (
          <UserEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            isCreateMode={isCreateMode}
            companies={companies}
            isSuperAdmin={isSuperAdmin}
          />
        )}
      </div>
      
      {/* Мобильная кнопка создания пользователя */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <Button
          variant="primary"
          size="lg"
          onClick={handleCreateUser}
          className="rounded-full shadow-xl hover:shadow-2xl"
          iconOnly
        >
          <Icon name="plus" size="md" />
        </Button>
      </div>
    </AdminPageTemplate>
  );
};

// Компонент модального окна редактирования/создания пользователя
interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isCreateMode: boolean;
  companies: any[];
  isSuperAdmin: boolean;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  isCreateMode,
  companies,
  isSuperAdmin,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    companyId: user?.companyId || '',
    status: user?.status || 'active',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      title={isCreateMode ? t('admin.users.createUser', 'Создать пользователя') : t('admin.users.editUser', 'Редактировать пользователя')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('admin.users.form.firstName', 'Имя')}
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label={t('admin.users.form.lastName', 'Фамилия')}
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <Input
          label={t('admin.users.form.email', 'Email')}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label={t('admin.users.form.phone', 'Телефон')}
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('admin.users.form.role', 'Роль')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className={`${themeClasses.input.default} w-full`}
              required
            >
              <option value="user">{t('admin.users.roles.user', 'Пользователь')}</option>
              <option value="company_admin_staff">{t('admin.users.roles.company_admin_staff', 'Персонал админа')}</option>
              <option value="company_admin">{t('admin.users.roles.company_admin', 'Админ компании')}</option>
              {isSuperAdmin && (
                <>
                  <option value="super_admin_staff">{t('admin.users.roles.super_admin_staff', 'Персонал супер-админа')}</option>
                  <option value="super_admin">{t('admin.users.roles.super_admin', 'Супер-админ')}</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('admin.users.form.status', 'Статус')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className={`${themeClasses.input.default} w-full`}
              required
            >
              <option value="active">{t('admin.users.status.active', 'Активен')}</option>
              <option value="inactive">{t('admin.users.status.inactive', 'Неактивен')}</option>
              <option value="blocked">{t('admin.users.status.blocked', 'Заблокирован')}</option>
            </select>
          </div>
        </div>

        {isSuperAdmin && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('admin.users.form.company', 'Компания')}
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="">{t('admin.users.form.noCompany', 'Без компании')}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

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

export default UsersManagementPage;
