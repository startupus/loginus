import { apiClient } from './client';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'super_admin_staff' | 'company_admin' | 'company_admin_staff' | 'user';
  companyId?: string | null;
  permissions?: string[];
  parentAdminId?: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    totalSessions: number;
  };
}

export interface CompanyService {
  id: string;
  name: string;
  type: 'mobile' | 'web' | 'desktop' | 'api';
  status: 'active' | 'inactive';
}

export interface AdminCompany {
  id: string;
  name: string;
  domain: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  services?: CompanyService[];
  userCount?: number;
  servicesCount?: number;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
  settings?: {
    branding: {
      logo: string | null;
      primaryColor: string;
    };
    features: {
      familyAccess: boolean;
      biometricAuth: boolean;
      '2fa': boolean;
    };
  };
}

export interface AdminCompaniesResponse {
  success: boolean;
  data: {
    companies: AdminCompany[];
    total: number;
  };
}

export const adminApi = {
  /**
   * Получить статистику админки
   */
  getStats: () => apiClient.get<AdminStatsResponse>('/admin/stats'),

  /**
   * Получить список пользователей с фильтрацией и пагинацией
   */
  getUsers: (params?: {
    page?: number;
    limit?: number;
    companyId?: string;
    role?: string;
    status?: string;
    search?: string;
  }) => apiClient.get<AdminUsersResponse>('/admin/users', { params }),

  /**
   * Получить пользователя по ID
   */
  getUserById: (id: string) => apiClient.get<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`),

  /**
   * Создать пользователя
   */
  createUser: (userData: Partial<AdminUser>) => apiClient.post<{ success: boolean; data: AdminUser }>('/admin/users', userData),

  /**
   * Обновить пользователя
   */
  updateUser: (id: string, userData: Partial<AdminUser>) => apiClient.put<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`, userData),

  /**
   * Удалить/деактивировать пользователя
   */
  deleteUser: (id: string) => apiClient.delete<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`),

  /**
   * Получить пользователей компании
   */
  getUsersByCompany: (companyId: string) => apiClient.get<{ success: boolean; data: { users: AdminUser[]; total: number } }>(`/admin/companies/${companyId}/users`),

  /**
   * Получить список компаний
   */
  getCompanies: () => apiClient.get<AdminCompaniesResponse>('/admin/companies'),

  /**
   * Получить компанию по ID
   */
  getCompanyById: (id: string) => apiClient.get<{ success: boolean; data: AdminCompany }>(`/admin/companies/${id}`),

  /**
   * Создать компанию
   */
  createCompany: (companyData: Partial<AdminCompany>) => apiClient.post<{ success: boolean; data: AdminCompany }>('/admin/companies', companyData),

  /**
   * Обновить компанию
   */
  updateCompany: (id: string, companyData: Partial<AdminCompany>) => apiClient.put<{ success: boolean; data: AdminCompany }>(`/admin/companies/${id}`, companyData),

  /**
   * Удалить компанию
   */
  deleteCompany: (id: string) => apiClient.delete<{ success: boolean; data: AdminCompany }>(`/admin/companies/${id}`),
};

