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
};

