import { apiClient } from './client';

export const authApi = {
  login: (login: string, password: string) =>
    apiClient.post('/auth/login', { login, password }),
    
  register: (phone: string, email: string, password: string) =>
    apiClient.post('/auth/register', { phone, email, password }),
    
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
    
  logout: () => apiClient.post('/auth/logout'),
};

