import { apiClient } from './client';

export const securityApi = {
  // Devices
  getDevices: () => apiClient.get('/security/devices'),
  deleteDevice: (deviceId: string) => apiClient.delete(`/security/devices/${deviceId}`),
  logoutAllDevices: () => apiClient.post('/security/logout-all'), // ✅ NEW
  
  // Activity
  getActivity: () => apiClient.get('/security/activity'),
  getActivityHistory: (params: { page?: number; limit?: number }) => 
    apiClient.get('/security/activity', { params }), // ✅ NEW
  
  // Password
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    apiClient.post('/security/password/change', { 
      oldPassword: data.currentPassword, 
      newPassword: data.newPassword 
    }),
  
  // Recovery Methods
  getRecoveryMethods: () => apiClient.get('/security/recovery-methods'), // ✅ NEW
  setupRecoveryMethod: (data: { method: 'email' | 'phone' }) => 
    apiClient.post('/security/recovery-method/setup', data), // ✅ NEW
  
  // Additional Auth Factors
  addAuthFactor: (method: string) => apiClient.post('/auth/user-additional-factors', { method }), // ✅ NEW
  removeAuthFactor: (factorId: string) => apiClient.delete(`/auth/user-additional-factors/${factorId}`), // ✅ NEW
};
