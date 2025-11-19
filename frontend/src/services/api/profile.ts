import { apiClient } from './client';

export const profileApi = {
  /**
   * Получить профиль пользователя
   */
  getProfile: () => apiClient.get('/profile'),
  
  /**
   * Получить данные дашборда
   */
  getDashboard: () => apiClient.get('/profile/dashboard'),
  
  /**
   * Обновить профиль
   */
  updateProfile: (data: Partial<{
    firstName: string;
    lastName: string;
    displayName: string;
    birthday: string;
  }>) => apiClient.patch('/profile', data),
  
  /**
   * Удалить профиль
   */
  deleteProfile: (password: string) => apiClient.delete('/profile', { data: { password } }),
};
