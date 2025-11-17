import { apiClient } from './client';

export const securityApi = {
  getDevices: () => apiClient.get('/security/devices'),
  deleteDevice: (deviceId: string) => apiClient.delete(`/security/devices/${deviceId}`),
  getActivity: () => apiClient.get('/security/activity'),
  changePassword: (data: { oldPassword: string; newPassword: string }) => 
    apiClient.post('/security/password/change', data),
};

