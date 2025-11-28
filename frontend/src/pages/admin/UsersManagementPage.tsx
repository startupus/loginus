import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
import { organizationsApi } from '../../services/api/organizations';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { useDebounce } from '../../hooks/useDebounce';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { formatDate } from '../../utils/intl/formatters';
import { useCurrentLanguage } from '../../utils/routing';
import { getInitials } from '../../utils/stringUtils';
import { preloadModule } from '../../services/i18n/config';

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

type EnrichedUser = User & {
  companyName: string;
  createdAtFormatted: string;
};

const UsersManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isSuperAdmin } = useAdminPermissions();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ userId: string | null; isOpen: boolean }>({ userId: null, isOpen: false });
  const currentLang = useCurrentLanguage();
  const locale = currentLang === 'en' ? 'en' : 'ru';
  const queryClient = useQueryClient();

  // Предзагрузка модуля admin для переводов
  useEffect(() => {
    const loadAdminModule = async () => {
      try {
        await preloadModule('admin');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[UsersManagementPage] Failed to preload admin module:', error);
        }
      }
    };

    loadAdminModule();

    // Перезагружаем модуль при смене языка
    const handleLanguageChanged = async () => {
      try {
        await preloadModule('admin');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[UsersManagementPage] Failed to reload admin module on language change:', error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  
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
  const {
    data: usersResponse,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['users', debouncedSearchQuery, roleFilter, statusFilter, companyFilter, dateFrom, dateTo, page, limit, sortBy, sortOrder],
    queryFn: () =>
      adminApi.getUsers({
        search: debouncedSearchQuery || undefined,
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
    keepPreviousData: true,
    select: (response) => {
      const payload = response?.data?.data ?? {};
      const extractedUsers = Array.isArray(payload.users)
        ? payload.users
        : Array.isArray(payload.data)
          ? payload.data
          : [];
      const rawMeta = payload.meta ?? {
        total: payload.total ?? extractedUsers.length,
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
      };
      const total = rawMeta.total ?? extractedUsers.length;
      const currentPage = rawMeta.page ?? page;
      const currentLimit = rawMeta.limit ?? limit;
      const totalPages =
        rawMeta.totalPages ??
        Math.max(1, Math.ceil((total || 0) / (currentLimit || limit || 1)));

      return {
        users: extractedUsers,
        meta: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages,
        },
      };
    },
  });

  // Загружаем организации (компании) для выбора при создании пользователя
  const { data: companiesResponse } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsApi.getOrganizations(),
    enabled: isSuperAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Извлечение данных из ответа API
  const usersResult = usersResponse ?? {
    users: [],
    meta: {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
    },
  };

  const users = usersResult.users as User[];
  const meta = usersResult.meta;

  // Преобразуем организации в формат компаний для совместимости
  const companies = useMemo(() => {
    if (!companiesResponse?.data?.data) return [];
    return companiesResponse.data.data.map((org: any) => ({
      id: org.id,
      name: org.name,
      domain: org.settings?.domain || '',
      subscriptionPlan: org.settings?.subscriptionPlan || 'basic',
    }));
  }, [companiesResponse]);

  const companiesMap = useMemo(() => {
    const map = new Map<string, string>();
    companies.forEach((company: any) => {
      if (company?.id) {
        map.set(company.id, company.name);
      }
    });
    return map;
  }, [companies]);

  const enrichedUsers: EnrichedUser[] = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        companyName: user.companyId ? companiesMap.get(user.companyId) ?? '-' : '-',
        createdAtFormatted: formatDate(user.createdAt, locale, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      })),
    [users, companiesMap, locale],
  );

  const paginationButtons = useMemo(() => {
    const totalPages = meta.totalPages || 1;
    const buttons: number[] = [];
    const visibleCount = Math.min(5, totalPages);

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        buttons.push(i);
      }
      return buttons;
    }

    if (page <= 3) {
      for (let i = 1; i <= visibleCount; i += 1) {
        buttons.push(i);
      }
      return buttons;
    }

    if (page >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i += 1) {
        buttons.push(i);
      }
      return buttons;
    }

    for (let i = page - 2; i <= page + 2; i += 1) {
      buttons.push(i);
    }

    return buttons;
  }, [meta.totalPages, page]);
  
  // Обработчик сортировки
  const handleSort = useCallback((column: 'displayName' | 'role' | 'status' | 'createdAt') => {
    if (sortBy === column) {
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy]);
  
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
    if (process.env.NODE_ENV === 'development') {
      console.log('[UsersManagementPage] handleCreateUser called');
    }
    setIsCreateMode(true);
    setSelectedUser(null);
    setIsEditModalOpen(true);
    if (process.env.NODE_ENV === 'development') {
      console.log('[UsersManagementPage] isEditModalOpen set to true');
    }
  };

  const handleEditUser = (user: User) => {
    setIsCreateMode(false);
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteConfirmModal({ userId, isOpen: true });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmModal.userId) {
      await deleteMutation.mutateAsync(deleteConfirmModal.userId);
      setDeleteConfirmModal({ userId: null, isOpen: false });
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

  if (isLoading && enrichedUsers.length === 0) {
    return (
      <AdminPageTemplate title={t('admin.users.title')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Icon name="loader" size="lg" className="animate-spin" color="rgb(var(--color-primary))" />
        </div>
      </AdminPageTemplate>
    );
  }

  if (error) {
    return (
      <AdminPageTemplate title={t('admin.users.title')} showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Icon name="alert-circle" size="lg" color="rgb(var(--color-error))" className="mx-auto mb-4" />
            <p className={themeClasses.text.secondary}>
              {t('errors.500Description')}
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
          {t('admin.users.add')}
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
              placeholder={t('admin.users.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rightIcon={<Icon name="search" size="sm" className={themeClasses.text.secondary} />}
            />
          </div>

          {/* Фильтр по роли */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`${themeClasses.input.default} w-full`}
            >
              <option value="all">{t('admin.users.filters.allRoles')}</option>
              <option value="super_admin">{t('admin.users.roles.super_admin')}</option>
              <option value="super_admin_staff">{t('admin.users.roles.super_admin_staff')}</option>
              <option value="company_admin">{t('admin.users.roles.company_admin')}</option>
              <option value="company_admin_staff">{t('admin.users.roles.company_admin_staff')}</option>
              <option value="user">{t('admin.users.roles.user')}</option>
            </select>
          </div>

          {/* Фильтр по статусу */}
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

          {/* Фильтр по компании (только для super_admin) */}
          {isSuperAdmin && (
            <div>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className={`${themeClasses.input.default} w-full`}
              >
                <option value="all">{t('admin.users.filters.allCompanies')}</option>
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
          {isFetching && (
            <div className="flex justify-end px-4 py-2">
              <Icon name="loader" size="sm" className="animate-spin" color="rgb(var(--color-primary))" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={themeClasses.background.gray2}>
                <tr>
                  <th 
                    className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary} cursor-pointer ${themeClasses.list.itemHover} transition-colors`}
                    onClick={() => handleSort('displayName')}
                  >
                    <div className="flex items-center gap-2">
                      {t('admin.users.table.user')}
                      {sortBy === 'displayName' && (
                        <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size="sm" />
                      )}
                    </div>
                  </th>
                  <th 
                    className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary} cursor-pointer ${themeClasses.list.itemHover} transition-colors`}
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-2">
                      {t('admin.users.table.role')}
                      {sortBy === 'role' && (
                        <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size="sm" />
                      )}
                    </div>
                  </th>
                  <th 
                    className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary} cursor-pointer ${themeClasses.list.itemHover} transition-colors`}
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      {t('admin.users.table.status')}
                      {sortBy === 'status' && (
                        <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size="sm" />
                      )}
                    </div>
                  </th>
                  {isSuperAdmin && (
                    <th                     className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary}`}>
                      {t('admin.users.table.company')}
                    </th>
                  )}
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${themeClasses.text.primary} relative`}>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`flex items-center gap-2 ${themeClasses.link.primary} transition-colors`}
                      >
                        <Icon name="calendar" size="sm" />
                        {t('admin.users.table.createdAt')}
                      </button>
                      <button 
                        onClick={() => handleSort('createdAt')}
                        className={`${themeClasses.link.primary} transition-colors`}
                      >
                        {sortBy === 'createdAt' && (
                          <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size="sm" />
                        )}
                      </button>
                    </div>
                    {showDatePicker && (
                      <div className={`absolute z-10 mt-2 p-4 ${themeClasses.card.default} ${themeClasses.border.default} rounded-lg shadow-lg min-w-[280px]`}>
                        <div className="space-y-3">
                          <div>
                            <Input
                              type="date"
                              label={t('admin.users.dateFrom')}
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              placeholder="дд.мм.гггг"
                            />
                          </div>
                          <div>
                            <Input
                              type="date"
                              label={t('admin.users.dateTo')}
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
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
                              {t('common.reset')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => setShowDatePicker(false)}
                              className="flex-1"
                            >
                              {t('common.apply')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </th>
                  <th className={`px-6 py-4 text-right text-sm font-semibold ${themeClasses.text.primary}`}>
                    {t('admin.users.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Icon name="users" size="lg" className={`${themeClasses.text.secondary} mb-4`} />
                        <p className={themeClasses.text.secondary}>
                          {t('admin.users.empty')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  enrichedUsers.map((user: EnrichedUser) => (
                    <tr key={user.id} className={`${themeClasses.list.itemHover} transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar || undefined}
                            initials={getInitials(user.displayName)}
                            name={user.displayName}
                            size="md"
                            rounded
                            showStatus
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
                      {isSuperAdmin && (
                        <td className="px-6 py-4">
                          <p className={`text-sm ${themeClasses.text.secondary}`}>
                            {user.companyName}
                          </p>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <p className={`text-sm ${themeClasses.text.secondary}`}>
                          {user.createdAtFormatted}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={() => handleEditUser(user)}
                            title={t('admin.users.edit')}
                          >
                            <Icon name="edit" size="sm" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={() => handleDeleteClick(user.id)}
                            title={t('admin.users.delete')}
                          >
                            <Icon name="trash" size="sm" className={themeClasses.text.error} />
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
          <div className={`flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 ${themeClasses.card.default} ${themeClasses.border.default} rounded-lg gap-4`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${themeClasses.text.secondary}`}>
                {t('admin.users.showing')} {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} {t('admin.users.of')} {meta.total}
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
              
              {paginationButtons.map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  disabled={isFetching && pageNum === page}
                >
                  {pageNum}
                </Button>
              ))}
              
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

      {/* Модальное окно подтверждения удаления */}
      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ userId: null, isOpen: false })}
        title={t('admin.users.deleteConfirmTitle')}
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmModal({ userId: null, isOpen: false })}>
              {t('common.cancel')}
            </Button>
            <Button variant="error" onClick={handleDeleteConfirm}>
              {t('common.delete')}
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text.primary}>
          {t('admin.users.deleteConfirm')}
        </p>
      </Modal>
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
    // status убран - будет вычисляться автоматически на бэкенде
  });

  // Сбрасываем форму при открытии модального окна или изменении режима
  React.useEffect(() => {
    if (isOpen) {
      if (isCreateMode) {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'user',
          companyId: '',
        });
      } else if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'user',
          companyId: user.companyId || '',
        });
      }
    }
  }, [isOpen, isCreateMode, user]);

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
    // Статус не передается - будет вычисляться автоматически на бэкенде
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
      title={isCreateMode ? t('admin.users.createUser') : t('admin.users.editUser')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('admin.users.form.firstName')}
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label={t('admin.users.form.lastName')}
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
          label={t('admin.users.form.phone')}
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <div>
          <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
            {t('admin.users.form.role')}
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            className={`${themeClasses.input.default} w-full`}
            required
          >
            <option value="user">{t('admin.users.roles.user')}</option>
            <option value="company_admin">{t('admin.users.roles.company_admin')}</option>
            {isSuperAdmin && (
              <option value="super_admin">{t('admin.users.roles.super_admin')}</option>
            )}
          </select>
        </div>

        {isSuperAdmin && (
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
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
