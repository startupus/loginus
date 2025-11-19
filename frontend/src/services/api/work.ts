import { apiClient } from './client';

export const workApi = {
  /**
   * Получить список рабочих групп
   */
  getGroups: () => apiClient.get('/work/groups'),
  
  /**
   * Создать рабочую группу
   */
  createGroup: (data: { name: string; description?: string }) => 
    apiClient.post('/work/groups', data),
  
  /**
   * Пригласить участника в группу
   */
  inviteMember: (groupId: string, data: { email: string; role?: 'admin' | 'member' }) =>
    apiClient.post(`/work/groups/${groupId}/invite`, data),
  
  /**
   * Получить события группы
   */
  getGroupEvents: (groupId?: string) => 
    apiClient.get(groupId ? `/work/groups/${groupId}/events` : '/work/events'),
};

