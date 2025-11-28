import { apiClient } from './client';

export interface Organization {
  id: string;
  name: string;
  settings?: Record<string, any>;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationsResponse {
  success: boolean;
  data: Organization[];
}

export interface OrganizationResponse {
  success: boolean;
  data: Organization;
}

export const organizationsApi = {
  /**
   * Получить список организаций пользователя
   */
  getOrganizations: () => apiClient.get<OrganizationsResponse>('/organizations'),

  /**
   * Получить организацию по ID
   */
  getOrganizationById: (id: string) => apiClient.get<OrganizationResponse>(`/organizations/${id}`),

  /**
   * Создать организацию
   */
  createOrganization: (organizationData: { name: string; settings?: Record<string, any> }) => 
    apiClient.post<OrganizationResponse>('/organizations', organizationData),

  /**
   * Обновить организацию
   */
  updateOrganization: (id: string, organizationData: { name?: string; settings?: Record<string, any> }) => 
    apiClient.put<OrganizationResponse>(`/organizations/${id}`, organizationData),

  /**
   * Удалить организацию
   */
  deleteOrganization: (id: string) => 
    apiClient.delete<{ message: string }>(`/organizations/${id}`),

  /**
   * Получить участников организации
   */
  getOrganizationMembers: (id: string) => 
    apiClient.get<{ success: boolean; data: any[] }>(`/organizations/${id}/members`),

  /**
   * Добавить участника в организацию
   */
  addMemberToOrganization: (id: string, data: { userId: string; roleName: string }) => 
    apiClient.post(`/organizations/${id}/members`, data),

  /**
   * Изменить роль участника организации
   */
  changeMemberRole: (id: string, userId: string, data: { roleName: string }) => 
    apiClient.put(`/organizations/${id}/members/${userId}/role`, data),

  /**
   * Удалить участника из организации
   */
  removeMemberFromOrganization: (id: string, userId: string) => 
    apiClient.delete(`/organizations/${id}/members/${userId}`),
};

