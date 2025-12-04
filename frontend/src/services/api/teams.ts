import { apiClient } from './client';

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  organizationId?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: {
    id: string;
    name: string;
    level: number;
  };
  joinedAt?: string;
  source?: string;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  organizationId?: string | null; // Опционально для команд без организации
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export const teamsApi = {
  /**
   * Получить все доступные команды пользователя
   */
  getAccessibleTeams: () => apiClient.get<{ success: boolean; data: Team[] }>('/teams/accessible'),

  /**
   * Получить команды пользователя
   */
  getUserTeams: () => apiClient.get<{ success: boolean; data: Team[] }>('/teams'),

  /**
   * Получить команду по ID
   */
  getTeam: (id: string) => apiClient.get<{ success: boolean; data: Team }>(`/teams/${id}`),

  /**
   * Создать команду
   */
  createTeam: (data: CreateTeamDto) => 
    apiClient.post<{ success: boolean; data: Team }>('/teams', data),

  /**
   * Обновить команду
   */
  updateTeam: (id: string, data: UpdateTeamDto) =>
    apiClient.put<{ success: boolean; data: Team }>(`/teams/${id}`, data),

  /**
   * Удалить команду
   */
  deleteTeam: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/teams/${id}`),

  /**
   * Получить участников команды
   */
  getTeamMembers: (id: string) =>
    apiClient.get<{ success: boolean; data: { team: Team; members: TeamMember[] } }>(`/teams/${id}/members`),

  /**
   * Добавить участника в команду
   */
  addMember: (teamId: string, data: { userId: string; roleName: string }) =>
    apiClient.post<{ success: boolean; data: any }>(`/teams/${teamId}/members`, data),

  /**
   * Изменить роль участника команды
   */
  changeMemberRole: (teamId: string, userId: string, data: { roleName: string }) =>
    apiClient.put<{ success: boolean; data: any }>(`/teams/${teamId}/members/${userId}/role`, data),

  /**
   * Удалить участника из команды
   */
  removeMember: (teamId: string, userId: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/teams/${teamId}/members/${userId}`),

  /**
   * Получить роли команды
   */
  getTeamRoles: (teamId: string) =>
    apiClient.get<{ success: boolean; data: any[] }>(`/teams/${teamId}/roles`),

  /**
   * Генерировать многоразовую ссылку приглашения в команду
   */
  generateInviteLink: (teamId: string, roleName?: string) =>
    apiClient.post<{ success: boolean; data: { invitationLink: string; token: string } }>(
      `/teams/${teamId}/invite-link`,
      { roleName: roleName || 'member' }
    ),
};

