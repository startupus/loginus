import { apiClient } from './client';

export const profileApi = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data: any) => apiClient.put('/profile', data),
  getSecuritySettings: () => apiClient.get('/profile/security'),
  getSessions: () => apiClient.get('/profile/sessions'),
};

